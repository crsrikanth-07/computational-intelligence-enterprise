"""
AGOA — Adaptive Genetic Optimization Algorithm
==============================================

A working POC of the Adaptive Genetic Optimization Algorithm applied to a
three-tier supply network (suppliers -> plants -> distribution centers).

The "adaptive" part of AGOA — what distinguishes it from a textbook GA — is
that **mutation and crossover rates are tuned online** from two signals:

  * population diversity (normalized gene entropy, 0 = clones, 1 = uniform)
  * stagnation (generations since the best-so-far last improved)

Low diversity or long stagnation raises the mutation rate to escape; high
diversity lowers it so good solutions can be exploited.

Problem encoding (single-sourcing network design)
-------------------------------------------------
A chromosome is an integer vector of length (n_suppliers + n_dcs):

    [plant_for_supplier_0, ..., plant_for_supplier_{S-1},
     plant_for_dc_0,       ..., plant_for_dc_{D-1}]

Every DC is served by exactly one plant, so no DC can be left dark by the
encoding. A plant is *open* when at least one DC is assigned to it. Each plant
buys the material it ships from the suppliers assigned to it, cheapest first.

    total_cost = fixed cost of open plants
               + supplier->plant shipping + plant->DC shipping
               + penalty * (plant over-capacity + supplier shortfall)

For small instances the exact optimum is available by exhaustive enumeration
(`brute_force_optimum`), and for larger ones by mixed-integer programming
(`milp_optimum`), so every AGOA result in the book is reported with its
optimality gap.

Run it
------
    python -m poc.agoa.agoa_scm
"""

from __future__ import annotations

import itertools
import math
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np

from poc.common import (
    RunReport,
    make_supply_network,
    save_convergence_plot,
    set_seed,
    stopwatch,
)


# ---------------------------------------------------------------------------
# Problem definition
# ---------------------------------------------------------------------------

@dataclass
class SupplyNetworkProblem:
    """Wraps the network data and exposes a fitness function."""

    data: dict
    penalty_weight: float = 5000.0

    @property
    def n_suppliers(self) -> int:
        return int(self.data["n_suppliers"])

    @property
    def n_plants(self) -> int:
        return int(self.data["n_plants"])

    @property
    def n_dcs(self) -> int:
        return int(self.data["n_dcs"])

    @property
    def chrom_length(self) -> int:
        return self.n_suppliers + self.n_dcs

    def random_chromosome(self, rng: np.random.Generator) -> np.ndarray:
        return rng.integers(0, self.n_plants, size=self.chrom_length)

    def decode(self, chrom: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        s = self.n_suppliers
        return np.asarray(chrom[:s]), np.asarray(chrom[s:])

    def breakdown(self, chrom: np.ndarray) -> Dict[str, float]:
        """Return every cost component of a chromosome (used for reporting)."""
        sup_to_plant, dc_to_plant = self.decode(chrom)
        d = self.data
        P = self.n_plants
        demand = d["dc_demand"]

        # Outbound: each DC's full demand ships from its assigned plant
        load = np.bincount(dc_to_plant, weights=demand, minlength=P)
        outbound = float(np.sum(demand * d["pd_cost"][dc_to_plant, np.arange(self.n_dcs)]))
        open_plants = load > 0
        fixed = float(d["fixed_plant_cost"][open_plants].sum())

        # Inbound: each plant buys its load from its own suppliers, cheapest first
        inbound = 0.0
        shortfall = 0.0
        for p in range(P):
            if load[p] <= 0:
                continue
            sups = np.flatnonzero(sup_to_plant == p)
            order = sups[np.argsort(d["sp_cost"][sups, p], kind="stable")]
            remaining = load[p]
            for s in order:
                q = min(remaining, d["supplier_capacity"][s])
                inbound += q * d["sp_cost"][s, p]
                remaining -= q
                if remaining <= 0:
                    break
            shortfall += max(0.0, remaining)

        overload = float(np.maximum(0.0, load - d["plant_capacity"]).sum())
        penalty = self.penalty_weight * (overload + shortfall)
        return {
            "fixed": fixed,
            "inbound": float(inbound),
            "outbound": outbound,
            "overload_units": overload,
            "shortfall_units": float(shortfall),
            "penalty": float(penalty),
            "total": fixed + float(inbound) + outbound + float(penalty),
            "open_plants": int(open_plants.sum()),
        }

    def total_cost(self, chrom: np.ndarray) -> float:
        return self.breakdown(chrom)["total"]


# ---------------------------------------------------------------------------
# Exact baselines
# ---------------------------------------------------------------------------

def brute_force_optimum(problem: SupplyNetworkProblem) -> Tuple[float, np.ndarray, int]:
    """Enumerate every chromosome (only sensible for small instances).

    The cost decomposes: DC assignments fix plant loads, outbound and fixed
    cost; supplier assignments then fix the inbound cost of each load. We loop
    over supplier assignments and vectorize over all DC assignments.
    Returns (best_cost, best_chromosome, n_evaluated).
    """
    d = problem.data
    S, P, D = problem.n_suppliers, problem.n_plants, problem.n_dcs
    size = P ** (S + D)
    if size > 5_000_000:
        raise ValueError(f"search space {size:,} is too large to enumerate")

    dc_combos = np.array(list(itertools.product(range(P), repeat=D)), dtype=np.int64)
    demand = d["dc_demand"]
    loads = np.zeros((len(dc_combos), P))
    for p in range(P):
        loads[:, p] = ((dc_combos == p) * demand).sum(axis=1)
    outbound = (demand * d["pd_cost"][dc_combos, np.arange(D)]).sum(axis=1)
    fixed = ((loads > 0) * d["fixed_plant_cost"]).sum(axis=1)
    overload = np.maximum(0.0, loads - d["plant_capacity"]).sum(axis=1)
    base = outbound + fixed + problem.penalty_weight * overload

    best = (math.inf, None)
    for sup in itertools.product(range(P), repeat=S):
        sup = np.array(sup)
        inbound = np.zeros(len(dc_combos))
        short = np.zeros(len(dc_combos))
        for p in range(P):
            sups = np.flatnonzero(sup == p)
            order = sups[np.argsort(d["sp_cost"][sups, p], kind="stable")]
            L = loads[:, p]
            covered = np.zeros_like(L)
            for s in order:
                q = np.clip(L - covered, 0.0, d["supplier_capacity"][s])
                inbound += q * d["sp_cost"][s, p]
                covered += q
            short += L - covered
        total = base + inbound + problem.penalty_weight * short
        k = int(np.argmin(total))
        if total[k] < best[0]:
            best = (float(total[k]), np.concatenate([sup, dc_combos[k]]))
    return best[0], best[1], size


def milp_optimum(problem: SupplyNetworkProblem, time_limit: float = 60.0) -> Tuple[float, np.ndarray]:
    """Solve the same single-sourcing design problem exactly with HiGHS (SciPy).

    Variables: x[d,p] (DC d served by plant p), y[s,p] (supplier s feeds p),
    z[p] (plant p open), f[s,p] >= 0 (units shipped s -> p).
    """
    from scipy.optimize import Bounds, LinearConstraint, milp

    d = problem.data
    S, P, D = problem.n_suppliers, problem.n_plants, problem.n_dcs
    nx, ny, nz, nf = D * P, S * P, P, S * P
    n = nx + ny + nz + nf
    ix = lambda dd, p: dd * P + p
    iy = lambda s, p: nx + s * P + p
    iz = lambda p: nx + ny + p
    iff = lambda s, p: nx + ny + nz + s * P + p

    c = np.zeros(n)
    for dd in range(D):
        for p in range(P):
            c[ix(dd, p)] = d["dc_demand"][dd] * d["pd_cost"][p, dd]
    for p in range(P):
        c[iz(p)] = d["fixed_plant_cost"][p]
    for s in range(S):
        for p in range(P):
            c[iff(s, p)] = d["sp_cost"][s, p]

    rows, lo, hi = [], [], []

    def add(coefs, l, h):
        row = np.zeros(n)
        for k, v in coefs:
            row[k] += v
        rows.append(row); lo.append(l); hi.append(h)

    for dd in range(D):
        add([(ix(dd, p), 1.0) for p in range(P)], 1, 1)
        for p in range(P):
            add([(ix(dd, p), 1.0), (iz(p), -1.0)], -np.inf, 0)
    for s in range(S):
        add([(iy(s, p), 1.0) for p in range(P)], 1, 1)
        for p in range(P):
            add([(iff(s, p), 1.0), (iy(s, p), -d["supplier_capacity"][s])], -np.inf, 0)
    for p in range(P):
        load = [(ix(dd, p), d["dc_demand"][dd]) for dd in range(D)]
        add([(iff(s, p), 1.0) for s in range(S)] + [(k, -v) for k, v in load], 0, 0)
        add(load + [(iz(p), -d["plant_capacity"][p])], -np.inf, 0)

    integrality = np.concatenate([np.ones(nx + ny + nz), np.zeros(nf)])
    ub = np.concatenate([np.ones(nx + ny + nz), np.full(nf, np.inf)])
    res = milp(c, constraints=LinearConstraint(np.array(rows), lo, hi),
               integrality=integrality, bounds=Bounds(np.zeros(n), ub),
               options={"time_limit": time_limit})
    if res.x is None:
        raise RuntimeError(f"MILP failed: {res.message}")
    x = res.x
    dc_to_plant = np.array([int(np.argmax([x[ix(dd, p)] for p in range(P)])) for dd in range(D)])
    sup_to_plant = np.array([int(np.argmax([x[iy(s, p)] for p in range(P)])) for s in range(S)])
    return float(res.fun), np.concatenate([sup_to_plant, dc_to_plant])


# ---------------------------------------------------------------------------
# AGOA core
# ---------------------------------------------------------------------------

@dataclass
class AGOAConfig:
    population_size: int = 80
    generations: int = 200
    tournament_k: int = 3
    elite_k: int = 2
    base_mutation_rate: float = 0.05
    base_crossover_rate: float = 0.80
    # Adaptive bounds
    min_mutation_rate: float = 0.01
    max_mutation_rate: float = 0.40
    # Adaptation: how strongly diversity/stagnation tweak rates
    diversity_gain: float = 0.8
    diversity_target: float = 0.5
    stagnation_gain: float = 1.5
    stagnation_window: int = 8
    # Set False to run a plain GA with fixed rates (the Chapter 7 baseline)
    adaptive: bool = True
    # Scale mutation rates by 1/chromosome_length (recommended for long
    # chromosomes: base_mutation_rate then means "expected genes flipped").
    per_gene_scaling: bool = False


def _tournament_select(pop, fitness, k, rng):
    idx = rng.integers(0, len(pop), size=k)
    return pop[idx[int(np.argmin(fitness[idx]))]].copy()


def _two_point_crossover(a, b, rng):
    n = len(a)
    if n < 3:
        return a.copy(), b.copy()
    i, j = sorted(rng.integers(1, n, size=2).tolist())
    c1 = np.concatenate([a[:i], b[i:j], a[j:]])
    c2 = np.concatenate([b[:i], a[i:j], b[j:]])
    return c1, c2


def _mutate(chrom, rate, problem, rng):
    out = chrom.copy()
    mask = rng.random(len(out)) < rate
    out[mask] = rng.integers(0, problem.n_plants, size=int(mask.sum()))
    return out


def population_diversity(pop: np.ndarray, n_values: int) -> float:
    """Mean normalized entropy of each gene: 0 = all identical, 1 = uniform."""
    if n_values < 2:
        return 0.0
    ent = 0.0
    for j in range(pop.shape[1]):
        counts = np.bincount(pop[:, j], minlength=n_values)
        p = counts[counts > 0] / pop.shape[0]
        ent += float(-(p * np.log(p)).sum())
    return ent / (pop.shape[1] * math.log(n_values))


def run_agoa(problem: SupplyNetworkProblem, config: AGOAConfig = AGOAConfig(), seed: int = 0) -> RunReport:
    rng = np.random.default_rng(seed)

    pop = np.vstack([problem.random_chromosome(rng) for _ in range(config.population_size)])
    fitness = np.array([problem.total_cost(c) for c in pop])
    evaluations = len(pop)

    best_idx = int(np.argmin(fitness))
    best, best_fit = pop[best_idx].copy(), float(fitness[best_idx])
    trace: List[float] = [best_fit]
    mutation_trace: List[float] = []
    diversity_trace: List[float] = []

    scale = 1.0 / problem.chrom_length if config.per_gene_scaling else 1.0
    base_mut = config.base_mutation_rate * scale
    min_mut, max_mut = config.min_mutation_rate * scale, config.max_mutation_rate * scale
    mutation_rate = base_mut
    crossover_rate = config.base_crossover_rate
    stagnation = 0

    with stopwatch() as elapsed:
        for gen in range(config.generations):
            new_pop = [pop[e].copy() for e in np.argsort(fitness)[: config.elite_k]]
            while len(new_pop) < config.population_size:
                p1 = _tournament_select(pop, fitness, config.tournament_k, rng)
                p2 = _tournament_select(pop, fitness, config.tournament_k, rng)
                if rng.random() < crossover_rate:
                    c1, c2 = _two_point_crossover(p1, p2, rng)
                else:
                    c1, c2 = p1.copy(), p2.copy()
                new_pop.append(_mutate(c1, mutation_rate, problem, rng))
                if len(new_pop) < config.population_size:
                    new_pop.append(_mutate(c2, mutation_rate, problem, rng))

            pop = np.vstack(new_pop)
            fitness = np.array([problem.total_cost(c) for c in pop])
            evaluations += len(pop)

            gen_best = float(fitness.min())
            if gen_best < best_fit - 1e-9:
                best_fit, best = gen_best, pop[int(np.argmin(fitness))].copy()
                stagnation = 0
            else:
                stagnation += 1
            trace.append(best_fit)

            diversity = population_diversity(pop, problem.n_plants)
            diversity_trace.append(diversity)

            if config.adaptive:
                # Low diversity -> raise mutation; high diversity -> lower it
                mut = base_mut * (
                    1.0 + config.diversity_gain * (config.diversity_target - diversity) / config.diversity_target
                )
                # Long stagnation -> raise mutation further
                if stagnation > config.stagnation_window:
                    mut *= 1.0 + config.stagnation_gain * math.log1p(stagnation - config.stagnation_window)
                mutation_rate = float(np.clip(mut, min_mut, max_mut))
                # Let mutation drive when stagnating: shrink crossover slightly
                crossover_rate = float(np.clip(
                    config.base_crossover_rate - 0.02 * max(0, stagnation - 5), 0.4, 0.95))
            mutation_trace.append(mutation_rate)
        total_time = elapsed()

    sup_to_plant, dc_to_plant = problem.decode(best)
    return RunReport(
        algorithm="AGOA" if config.adaptive else "GA (fixed rates)",
        problem="three_tier_supply_network",
        best_fitness=best_fit,
        best_solution={
            "supplier_to_plant": sup_to_plant.tolist(),
            "dc_to_plant": dc_to_plant.tolist(),
        },
        iterations=config.generations,
        wall_time_seconds=total_time,
        convergence_trace=trace,
        extra={
            "evaluations": evaluations,
            "breakdown": problem.breakdown(best),
            "mutation_trace": mutation_trace,
            "diversity_trace": diversity_trace,
            "final_mutation_rate": mutation_rate,
            "final_crossover_rate": crossover_rate,
        },
    )


# ---------------------------------------------------------------------------
# Demo entry point
# ---------------------------------------------------------------------------

def main() -> None:
    set_seed(42)
    data = make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11)
    problem = SupplyNetworkProblem(data=data)
    report = run_agoa(problem, AGOAConfig(population_size=80, generations=150), seed=0)
    opt, _, n = brute_force_optimum(problem)
    b = report.extra["breakdown"]
    print(report.summary())
    print("Supplier -> Plant:", report.best_solution["supplier_to_plant"])
    print("DC       -> Plant:", report.best_solution["dc_to_plant"])
    print(f"Open plants: {b['open_plants']}  fixed=${b['fixed']:,.0f}  inbound=${b['inbound']:,.2f}  "
          f"outbound=${b['outbound']:,.2f}  penalty=${b['penalty']:,.0f}")
    print(f"Exhaustive optimum over {n:,} chromosomes: {opt:,.2f}  "
          f"(AGOA gap {100 * (report.best_fitness - opt) / opt:.3f}%)")
    save_convergence_plot(report.convergence_trace, "/tmp/agoa_convergence.png",
                          "AGOA — Supply Network Total Cost Convergence")


if __name__ == "__main__":
    main()
