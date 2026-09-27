"""
Particle Swarm Optimization for Inventory Management
====================================================

A working POC of PSO applied to multi-product inventory optimization using
the classical continuous-review (Q, r) policy: when a product's inventory
position falls to its reorder point r, order a lot of Q units.

For each product i (annual demand D, weekly demand std sigma, lead time L):

    mu_L    = expected demand during the lead time
    sigma_L = std of lead-time demand            (sigma * sqrt(L in weeks))
    z       = (r - mu_L) / sigma_L               (safety factor)

    cost_i(Q, r) = K * D / Q                     ordering
                 + h * (Q / 2 + r - mu_L)        cycle stock + safety stock
                 + p * (D / Q) * sigma_L * G(z)  expected backorders per year

where G(z) is the standard normal loss function. The decision vector for n
products has 2n entries: [Q_1..Q_n, r_1..r_n].

Optional all-units quantity discounts (`use_discounts=True`) cut the unit
price — and therefore the purchase and holding cost — once Q reaches a price
break. That makes each product's cost curve saw-toothed and the joint
landscape multimodal; it is the harder variant used for Hybrid PSO-GA.

`exact_optimum` solves every product exactly (products are independent), so
PSO results are always reported against the true optimum.

Run it
------
    python -m poc.pso.pso_inventory
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np
from scipy.optimize import minimize_scalar
from scipy.stats import norm

from poc.common import (
    RunReport,
    make_inventory_dataset,
    save_convergence_plot,
    set_seed,
    stopwatch,
)


def normal_loss(z: np.ndarray) -> np.ndarray:
    """Standard normal loss function G(z) = E[max(Z - z, 0)]."""
    return norm.pdf(z) - z * norm.sf(z)


# ---------------------------------------------------------------------------
# Problem
# ---------------------------------------------------------------------------

@dataclass
class InventoryProblem:
    data: dict
    use_discounts: bool = False

    def __post_init__(self) -> None:
        d = self.data
        self.D = np.asarray(d["annual_demand"], float)
        self.K = np.asarray(d["ordering_cost"], float)
        self.h = np.asarray(d["holding_cost"], float)
        self.p = np.asarray(d["shortage_cost"], float)
        weeks = np.asarray(d["lead_time"], float) / 7.0
        self.mu_L = self.D / 52.0 * weeks
        self.sigma_L = np.asarray(d["weekly_demand_std"], float) * np.sqrt(weeks)
        self.eoq = np.sqrt(2 * self.K * self.D / self.h)
        # Price tiers for the discount variant: breaks (n, 2) and rates (n, 2)
        self.breaks = np.asarray(d.get("break_qty", np.full((len(self.D), 2), np.inf)), float)
        self.rates = np.asarray(d.get("discount", np.zeros((len(self.D), 2))), float)
        self.price = np.asarray(d.get("unit_price", np.zeros(len(self.D))), float)

    @property
    def n_products(self) -> int:
        return len(self.D)

    @property
    def dim(self) -> int:
        return 2 * self.n_products

    def bounds(self) -> Tuple[np.ndarray, np.ndarray]:
        """Search box: Q in [1, 10 x EOQ] (covers every price break),
        r in [mu_L - 2 sigma_L, mu_L + 5 sigma_L] (clipped at zero)."""
        q_hi = np.maximum(10 * self.eoq, 1.2 * self.breaks.max(axis=1, initial=0, where=np.isfinite(self.breaks)))
        lo = np.concatenate([np.ones(self.n_products), np.maximum(0.0, self.mu_L - 2 * self.sigma_L)])
        hi = np.concatenate([q_hi, self.mu_L + 5 * self.sigma_L])
        return lo, hi

    def discount_rate(self, Q: np.ndarray) -> np.ndarray:
        if not self.use_discounts:
            return np.zeros_like(Q)
        rate = np.zeros_like(Q)
        for k in range(self.breaks.shape[1]):
            rate = np.where(Q >= self.breaks[:, k], self.rates[:, k], rate)
        return rate

    def product_costs(self, Q: np.ndarray, r: np.ndarray) -> np.ndarray:
        """Annual cost of each product for lot sizes Q and reorder points r."""
        Q = np.maximum(Q, 1.0)
        z = (r - self.mu_L) / self.sigma_L
        disc = self.discount_rate(Q)
        h = self.h * (1.0 - disc)
        cost = (self.K * self.D / Q
                + h * (Q / 2.0 + r - self.mu_L)
                + self.p * (self.D / Q) * self.sigma_L * normal_loss(z))
        if self.use_discounts:
            cost = cost + self.D * self.price * (1.0 - disc)
        return cost

    def fitness(self, x: np.ndarray) -> float:
        n = self.n_products
        return float(self.product_costs(x[:n], x[n:]).sum())


# ---------------------------------------------------------------------------
# Exact solution (products are independent)
# ---------------------------------------------------------------------------

def _best_r(problem: InventoryProblem, i: int, Q: float, h: float) -> float:
    """Optimal reorder point for a fixed Q: P(stockout) = h Q / (p D)."""
    ratio = min(h * Q / (problem.p[i] * problem.D[i]), 1.0 - 1e-12)
    return float(problem.mu_L[i] + problem.sigma_L[i] * norm.isf(ratio))


def _solve_product(problem: InventoryProblem, i: int, h: float, q_lo: float, q_hi: float) -> Tuple[float, float]:
    """Minimize cost over Q in [q_lo, q_hi] with r chosen optimally for each Q."""
    def c(Q):
        r = _best_r(problem, i, Q, h)
        z = (r - problem.mu_L[i]) / problem.sigma_L[i]
        return (problem.K[i] * problem.D[i] / Q + h * (Q / 2 + r - problem.mu_L[i])
                + problem.p[i] * problem.D[i] / Q * problem.sigma_L[i] * float(normal_loss(z)))
    res = minimize_scalar(c, bounds=(q_lo, q_hi), method="bounded", options={"xatol": 1e-6})
    Q = float(res.x)
    return Q, _best_r(problem, i, Q, h)


def exact_optimum(problem: InventoryProblem) -> Tuple[float, np.ndarray]:
    """Exact optimum: per product (and per price tier when discounts apply)."""
    n = problem.n_products
    _, hi = problem.bounds()
    Q, r = np.zeros(n), np.zeros(n)
    for i in range(n):
        if problem.use_discounts:
            edges = [1.0] + list(problem.breaks[i]) + [hi[i]]
            tiers = [0.0] + list(problem.rates[i])
        else:
            edges, tiers = [1.0, hi[i]], [0.0]
        best = None
        for t, rate in enumerate(tiers):
            q_lo, q_hi = edges[t], min(edges[t + 1] - 1e-6, hi[i])
            if q_lo >= q_hi:
                continue
            q, rr = _solve_product(problem, i, problem.h[i] * (1 - rate), q_lo, q_hi)
            cost = problem.product_costs(np.full(n, q), np.full(n, rr))[i]
            if best is None or cost < best[0]:
                best = (cost, q, rr)
        _, Q[i], r[i] = best
    x = np.concatenate([Q, r])
    return problem.fitness(x), x


# ---------------------------------------------------------------------------
# PSO core
# ---------------------------------------------------------------------------

@dataclass
class PSOConfig:
    n_particles: int = 30
    iterations: int = 200
    w_start: float = 0.9
    w_end: float = 0.4
    c1: float = 1.5
    c2: float = 1.5
    v_max_frac: float = 0.2      # velocity clamp, as a fraction of each dimension's range


def run_pso(problem: InventoryProblem, config: PSOConfig = PSOConfig(), seed: int = 0) -> RunReport:
    rng = np.random.default_rng(seed)
    n, d = config.n_particles, problem.dim
    lo, hi = problem.bounds()

    x = rng.uniform(lo, hi, size=(n, d))
    v_max = config.v_max_frac * (hi - lo)
    v = rng.uniform(-v_max, v_max, size=(n, d))

    pbest = x.copy()
    pbest_f = np.array([problem.fitness(xi) for xi in x])
    g_idx = int(np.argmin(pbest_f))
    gbest, gbest_f = pbest[g_idx].copy(), float(pbest_f[g_idx])
    trace: List[float] = [gbest_f]
    evaluations = n

    with stopwatch() as elapsed:
        for it in range(config.iterations):
            w = config.w_start + (config.w_end - config.w_start) * (it / max(1, config.iterations - 1))
            r1, r2 = rng.random((n, d)), rng.random((n, d))
            v = w * v + config.c1 * r1 * (pbest - x) + config.c2 * r2 * (gbest - x)
            v = np.clip(v, -v_max, v_max)
            x = np.clip(x + v, lo, hi)

            f = np.array([problem.fitness(xi) for xi in x])
            evaluations += n
            improved = f < pbest_f
            pbest[improved], pbest_f[improved] = x[improved], f[improved]
            g_idx = int(np.argmin(pbest_f))
            if pbest_f[g_idx] < gbest_f:
                gbest, gbest_f = pbest[g_idx].copy(), float(pbest_f[g_idx])
            trace.append(gbest_f)
        total_time = elapsed()

    k = problem.n_products
    return RunReport(
        algorithm="PSO",
        problem="inventory_management" + ("_discounts" if problem.use_discounts else ""),
        best_fitness=gbest_f,
        best_solution=gbest.tolist(),
        iterations=config.iterations,
        wall_time_seconds=total_time,
        convergence_trace=trace,
        extra={"order_quantity": gbest[:k].tolist(), "reorder_point": gbest[k:].tolist(),
               "evaluations": evaluations},
    )


# ---------------------------------------------------------------------------
# Demo entry point
# ---------------------------------------------------------------------------

def main() -> None:
    set_seed(42)
    problem = InventoryProblem(make_inventory_dataset(n_products=5, seed=42))
    report = run_pso(problem, PSOConfig(n_particles=30, iterations=200), seed=1)
    opt, x_star = exact_optimum(problem)
    k = problem.n_products
    print(report.summary())
    print(f"Exact optimum: {opt:,.2f}   PSO gap: {100 * (report.best_fitness - opt) / opt:.4f}%")
    print("EOQ        :", np.round(problem.eoq, 1).tolist())
    print("Q (PSO)    :", np.round(report.extra["order_quantity"], 1).tolist())
    print("Q (exact)  :", np.round(x_star[:k], 1).tolist())
    print("r (PSO)    :", np.round(report.extra["reorder_point"], 1).tolist())
    print("r (exact)  :", np.round(x_star[k:], 1).tolist())
    save_convergence_plot(report.convergence_trace, "/tmp/pso_convergence.png",
                          "PSO — Inventory Total-Cost Convergence")


if __name__ == "__main__":
    main()
