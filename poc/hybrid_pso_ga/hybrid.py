"""
Hybrid Particle Swarm Optimization + Genetic Algorithm (HPSO-GA)
================================================================

A working POC of the hybrid algorithm combining PSO's local refinement with
GA's global exploration, applied to multi-product inventory optimization.

Hybridization strategy (from the preprint)
------------------------------------------
Each iteration runs **both** a PSO step and a GA step:
  1. PSO velocity/position update on the swarm.
  2. GA step (tournament selection, BLX-alpha crossover, Gaussian mutation)
     on a parallel population that evolves independently of the swarm, so it
     stays diverse after the swarm has collapsed onto one basin. (Setting
     `ga_uses_swarm_bests=True` lets GA parents come from the swarm's
     personal bests too; it converges faster but explores less.)
  3. Cross-pollination: a GA child that beats a particle's personal best
     replaces that particle.

The rationale: PSO alone can stall in one basin of a multimodal landscape;
GA mutation and crossover keep proposing points elsewhere. Note that each
iteration costs two fitness evaluations per particle, so comparisons with
plain PSO must be made at equal evaluation budgets (see Chapter 13).

Run it
------
    python -m poc.hybrid_pso_ga.hybrid
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np

from poc.common import (
    RunReport,
    make_inventory_dataset,
    save_convergence_plot,
    set_seed,
    stopwatch,
)
from poc.pso.pso_inventory import InventoryProblem, PSOConfig


# ---------------------------------------------------------------------------
# Hybrid config
# ---------------------------------------------------------------------------

@dataclass
class HybridConfig(PSOConfig):
    crossover_rate: float = 0.7
    mutation_rate: float = 0.1
    mutation_sigma_frac: float = 0.08   # Gaussian mutation std, fraction of range
    ga_tournament_k: int = 3
    ga_uses_swarm_bests: bool = False   # True: GA parents also drawn from swarm pbests


# ---------------------------------------------------------------------------
# GA operators (continuous)
# ---------------------------------------------------------------------------

def _tournament(
    pop: np.ndarray, fitness: np.ndarray, k: int, rng: np.random.Generator
) -> np.ndarray:
    idx = rng.integers(0, len(pop), size=k)
    return pop[idx[int(np.argmin(fitness[idx]))]].copy()


def _blx_alpha_crossover(
    a: np.ndarray, b: np.ndarray, rng: np.random.Generator, alpha: float = 0.5
) -> np.ndarray:
    """BLX-α crossover: child drawn from interval extended by α on each side."""
    lo = np.minimum(a, b)
    hi = np.maximum(a, b)
    d = hi - lo
    low = lo - alpha * d
    high = hi + alpha * d
    return rng.uniform(low, high)


def _gaussian_mutate(
    x: np.ndarray, sigma: np.ndarray, rate: float, rng: np.random.Generator
) -> np.ndarray:
    mask = rng.random(size=x.shape) < rate
    noise = rng.normal(0.0, sigma, size=x.shape)
    return x + mask * noise


# ---------------------------------------------------------------------------
# Hybrid runner
# ---------------------------------------------------------------------------

def run_hybrid_pso_ga(
    problem: InventoryProblem, config: HybridConfig = HybridConfig(), seed: int = 0
) -> RunReport:
    rng = np.random.default_rng(seed)
    n = config.n_particles
    d = problem.dim
    lo, hi = problem.bounds()

    # Initialize PSO side
    x = rng.uniform(lo, hi, size=(n, d))
    v_max = config.v_max_frac * (hi - lo)
    v = rng.uniform(-v_max, v_max, size=(n, d))
    pbest = x.copy()
    pbest_f = np.array([problem.fitness(xi) for xi in x])
    g_idx = int(np.argmin(pbest_f))
    gbest = pbest[g_idx].copy()
    gbest_f = float(pbest_f[g_idx])

    # GA side starts from same initial population but evolves independently
    ga_pop = x.copy()
    ga_fit = pbest_f.copy()

    sigma = config.mutation_sigma_frac * (hi - lo)
    trace: List[float] = [gbest_f]
    evaluations = n

    with stopwatch() as elapsed:
        for it in range(config.iterations):
            # ---------- PSO step ------------------------------------------
            w = config.w_start + (config.w_end - config.w_start) * (it / max(1, config.iterations - 1))
            r1 = rng.random(size=(n, d))
            r2 = rng.random(size=(n, d))
            v = (
                w * v
                + config.c1 * r1 * (pbest - x)
                + config.c2 * r2 * (gbest - x)
            )
            v = np.clip(v, -v_max, v_max)
            x = np.clip(x + v, lo, hi)
            f = np.array([problem.fitness(xi) for xi in x])
            evaluations += n

            improved = f < pbest_f
            pbest[improved] = x[improved]
            pbest_f[improved] = f[improved]
            g_idx = int(np.argmin(pbest_f))
            if pbest_f[g_idx] < gbest_f:
                gbest = pbest[g_idx].copy()
                gbest_f = float(pbest_f[g_idx])

            # ---------- GA step -------------------------------------------
            if config.ga_uses_swarm_bests:
                pool, pool_f = np.vstack([ga_pop, pbest]), np.concatenate([ga_fit, pbest_f])
            else:
                pool, pool_f = ga_pop, ga_fit
            new_ga = np.empty_like(ga_pop)
            for i in range(n):
                p1 = _tournament(pool, pool_f, config.ga_tournament_k, rng)
                p2 = _tournament(pool, pool_f, config.ga_tournament_k, rng)
                if rng.random() < config.crossover_rate:
                    child = _blx_alpha_crossover(p1, p2, rng)
                else:
                    child = p1
                child = _gaussian_mutate(child, sigma, config.mutation_rate, rng)
                new_ga[i] = np.clip(child, lo, hi)
            ga_pop = new_ga
            ga_fit = np.array([problem.fitness(xi) for xi in ga_pop])
            evaluations += n

            # ---------- Cross-pollination --------------------------------
            # If a GA child beats the corresponding particle's personal best,
            # replace the swarm slot entirely.
            cross_mask = ga_fit < pbest_f
            if cross_mask.any():
                pbest[cross_mask] = ga_pop[cross_mask]
                pbest_f[cross_mask] = ga_fit[cross_mask]
                x[cross_mask] = ga_pop[cross_mask]
                v[cross_mask] *= 0.5  # reset momentum for inherited slots

                g_idx = int(np.argmin(pbest_f))
                if pbest_f[g_idx] < gbest_f:
                    gbest = pbest[g_idx].copy()
                    gbest_f = float(pbest_f[g_idx])

            trace.append(gbest_f)
        total_time = elapsed()

    k = problem.n_products
    return RunReport(
        algorithm="Hybrid PSO-GA",
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
# Demo entry point: compare PSO vs Hybrid PSO-GA head-to-head
# ---------------------------------------------------------------------------

def main() -> None:
    from poc.pso.pso_inventory import exact_optimum, run_pso

    set_seed(123)
    problem = InventoryProblem(make_inventory_dataset(n_products=8, seed=42), use_discounts=True)
    opt, _ = exact_optimum(problem)

    r_hy = run_hybrid_pso_ga(problem, HybridConfig(n_particles=30, iterations=200), seed=1)
    # Equal budget: the hybrid evaluates 2 x 30 points per iteration
    r_pso = run_pso(problem, PSOConfig(n_particles=60, iterations=200), seed=1)

    print(f"Exact optimum (quantity-discount variant): ${opt:,.2f}/yr")
    for r in (r_pso, r_hy):
        print(f"{r.summary()}  evaluations={r.extra['evaluations']:,}  "
              f"excess over optimum=${r.best_fitness - opt:,.2f}/yr")

    save_convergence_plot(r_hy.convergence_trace, "/tmp/hybrid_psoga_convergence.png",
                          "Hybrid PSO-GA — Inventory Total-Cost Convergence")


if __name__ == "__main__":
    main()
