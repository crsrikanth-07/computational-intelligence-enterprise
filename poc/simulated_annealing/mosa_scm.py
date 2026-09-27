"""
Multi-Objective Simulated Annealing for Supply Chain Management
===============================================================

A working POC that uses Simulated Annealing (SA) to trade off weekly
**transportation cost** against **CO2 emissions** across a freight network,
subject to a delivery-time limit on every lane.

Mode economics (per tonne) follow the familiar shape of real freight:

  * truck  — mid-price per km, mid emissions, fast, no terminal handling
  * rail   — cheapest and cleanest per km, but pays terminal handling and
             drayage (cost and CO2) and dwells ~30 h at terminals
  * air    — fastest, by far the most expensive and carbon-intensive

Because rail's handling overhead is fixed per tonne while its savings grow
with distance, cost favours rail beyond roughly 800 km but emissions favour it
beyond roughly 200 km. Lanes in between present a genuine cost-vs-CO2 choice;
the delivery-time limit rules rail out on urgent lanes and forces air on a few.

Three strategies are implemented side-by-side:

1. **Weighted-sum SA** on normalized objectives.
2. **Weight sweep** — weighted-sum SA over many weights; union of results.
3. **Pareto-archive SA (MOSA)** — dominance-based acceptance plus an external
   archive of non-dominated solutions, trimmed by crowding distance.

Because lanes are independent, the *exact* Pareto front can be computed by
merging lanes one at a time (`exact_pareto_front`), so every approximate
front can be scored by its hypervolume ratio against the truth.

Run it
------
    python -m poc.simulated_annealing.mosa_scm
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np

from poc.common import (
    RunReport,
    make_transportation_network,
    save_convergence_plot,
    set_seed,
    stopwatch,
)


# ---------------------------------------------------------------------------
# Problem
# ---------------------------------------------------------------------------

@dataclass
class TransportProblem:
    """Lane-based freight problem. A solution is one mode index per lane."""

    data: dict

    def __post_init__(self) -> None:
        d = self.data
        dist = np.asarray(d["distance_km"], float)[:, None]
        tonnes = np.asarray(d["weekly_tonnes"], float)[:, None]
        self.cost_lm = tonnes * (dist * d["mode_cost_per_tkm"] + d["mode_handling_cost_per_t"])
        self.co2_lm = tonnes * (dist * d["mode_co2_kg_per_tkm"] + d["mode_handling_co2_kg_per_t"])
        self.hours_lm = d["mode_fixed_hours"] + dist / d["mode_speed_kmh"]
        self.feasible = self.hours_lm <= np.asarray(d["max_transit_hours"], float)[:, None]
        if not self.feasible.any(axis=1).all():
            bad = np.flatnonzero(~self.feasible.any(axis=1))
            raise ValueError(f"lanes {bad.tolist()} have no mode that meets their time limit")
        self.options = [np.flatnonzero(row) for row in self.feasible]
        # Normalization ranges (used by weighted-sum SA and the knee point)
        big = np.where(self.feasible, self.cost_lm, np.inf)
        self.cost_min = float(big.min(axis=1).sum())
        self.cost_max = float(np.where(self.feasible, self.cost_lm, -np.inf).max(axis=1).sum())
        big = np.where(self.feasible, self.co2_lm, np.inf)
        self.co2_min = float(big.min(axis=1).sum())
        self.co2_max = float(np.where(self.feasible, self.co2_lm, -np.inf).max(axis=1).sum())

    @property
    def n_lanes(self) -> int:
        return self.cost_lm.shape[0]

    def random_solution(self, rng: np.random.Generator) -> np.ndarray:
        return np.array([rng.choice(opts) for opts in self.options], dtype=np.int64)

    def evaluate(self, x: np.ndarray) -> Tuple[float, float]:
        """Return (weekly_cost_usd, weekly_co2_kg)."""
        idx = np.arange(self.n_lanes)
        return float(self.cost_lm[idx, x].sum()), float(self.co2_lm[idx, x].sum())

    def normalized(self, cost: float, co2: float) -> Tuple[float, float]:
        return ((cost - self.cost_min) / max(self.cost_max - self.cost_min, 1e-12),
                (co2 - self.co2_min) / max(self.co2_max - self.co2_min, 1e-12))


# ---------------------------------------------------------------------------
# Exact front and quality metrics
# ---------------------------------------------------------------------------

def _nondominated(points: np.ndarray) -> np.ndarray:
    """Non-dominated subset of 2-D points (minimization), sorted by cost."""
    pts = points[np.lexsort((points[:, 1], points[:, 0]))]
    keep, best_co2 = [], np.inf
    for p in pts:
        if p[1] < best_co2 - 1e-9:
            keep.append(p)
            best_co2 = p[1]
    return np.array(keep)


def exact_pareto_front(problem: TransportProblem) -> np.ndarray:
    """Exact (cost, CO2) Pareto front: merge lanes one at a time, pruning
    dominated partial sums after each merge (valid because lanes are additive
    and independent)."""
    front = np.zeros((1, 2))
    for lane, opts in enumerate(problem.options):
        pts = np.stack([problem.cost_lm[lane, opts], problem.co2_lm[lane, opts]], axis=1)
        merged = (front[:, None, :] + pts[None, :, :]).reshape(-1, 2)
        front = _nondominated(merged)
    return front


def hypervolume_2d(front: np.ndarray, ref: Tuple[float, float]) -> float:
    """Area dominated by `front` and bounded by `ref` (both objectives minimized)."""
    pts = _nondominated(np.asarray(front, float))
    pts = pts[(pts[:, 0] <= ref[0]) & (pts[:, 1] <= ref[1])]
    hv, prev_co2 = 0.0, ref[1]
    for c, e in pts:
        hv += (ref[0] - c) * (prev_co2 - e)
        prev_co2 = e
    return hv


def knee_point(problem: TransportProblem, front: np.ndarray) -> np.ndarray:
    """Front point closest to the ideal point after normalizing each objective."""
    f = np.asarray(front, float)
    span = np.maximum(f.max(axis=0) - f.min(axis=0), 1e-12)
    z = (f - f.min(axis=0)) / span
    return f[int(np.argmin(np.hypot(z[:, 0], z[:, 1])))]


# ---------------------------------------------------------------------------
# Shared neighbour operator
# ---------------------------------------------------------------------------

def _perturb(x: np.ndarray, problem: TransportProblem, rng: np.random.Generator) -> np.ndarray:
    """Switch one lane (that has a choice) to a different feasible mode."""
    new = x.copy()
    for _ in range(10):
        lane = int(rng.integers(0, problem.n_lanes))
        opts = problem.options[lane]
        if len(opts) > 1:
            new[lane] = int(rng.choice(opts[opts != new[lane]]))
            return new
    return new


# ---------------------------------------------------------------------------
# Variant 1: Weighted-sum SA
# ---------------------------------------------------------------------------

@dataclass
class SAConfig:
    initial_temperature: float = 0.05     # in normalized-objective units
    cooling_rate: float = 0.997
    iterations: int = 3000
    w_cost: float = 0.5
    w_co2: float = 0.5


def run_weighted_sum_sa(problem: TransportProblem, config: SAConfig = SAConfig(), seed: int = 0) -> RunReport:
    rng = np.random.default_rng(seed)

    def score(c, e):
        nc, ne = problem.normalized(c, e)
        return config.w_cost * nc + config.w_co2 * ne

    x = problem.random_solution(rng)
    cost, co2 = problem.evaluate(x)
    f = score(cost, co2)
    best, best_f, best_obj = x.copy(), f, (cost, co2)
    T = config.initial_temperature
    trace = [best_f]

    with stopwatch() as elapsed:
        for _ in range(config.iterations):
            y = _perturb(x, problem, rng)
            yc, ye = problem.evaluate(y)
            yf = score(yc, ye)
            delta = yf - f
            if delta < 0 or rng.random() < math.exp(-delta / max(T, 1e-12)):
                x, f, cost, co2 = y, yf, yc, ye
                if f < best_f:
                    best, best_f, best_obj = x.copy(), f, (cost, co2)
            T *= config.cooling_rate
            trace.append(best_f)
        total_time = elapsed()

    return RunReport(
        algorithm="SA (weighted sum)",
        problem="multi_obj_transport",
        best_fitness=best_f,
        best_solution=best.tolist(),
        iterations=config.iterations,
        wall_time_seconds=total_time,
        convergence_trace=trace,
        extra={"best_cost": best_obj[0], "best_co2_kg": best_obj[1],
               "weights": {"cost": config.w_cost, "co2": config.w_co2}},
    )


# ---------------------------------------------------------------------------
# Variant 2: weight sweep
# ---------------------------------------------------------------------------

def run_weight_sweep_mosa(problem: TransportProblem, config: SAConfig = SAConfig(),
                          seed: int = 0, n_weights: int = 11) -> RunReport:
    """Run weighted-sum SA for alpha in [0, 1] and keep the non-dominated union.

    Note: a weighted sum can only reach *supported* points — those on the
    convex hull of the front. Points in the hull's "dents" are invisible to it.
    """
    pts, trace = [], []
    with stopwatch() as elapsed:
        for k, alpha in enumerate(np.linspace(0.0, 1.0, n_weights)):
            cfg = SAConfig(config.initial_temperature, config.cooling_rate, config.iterations,
                           w_cost=float(alpha), w_co2=float(1.0 - alpha))
            r = run_weighted_sum_sa(problem, cfg, seed=seed + 17 * k)
            pts.append((r.extra["best_cost"], r.extra["best_co2_kg"]))
            trace.append(len(_nondominated(np.array(pts))))
        total_time = elapsed()
    front = _nondominated(np.array(pts))
    knee = knee_point(problem, front)
    return RunReport(
        algorithm="MOSA (weight sweep)",
        problem="multi_obj_transport",
        best_fitness=float(len(front)),
        best_solution=front.tolist(),
        iterations=n_weights * config.iterations,
        wall_time_seconds=total_time,
        convergence_trace=trace,
        extra={
            "pareto_front_size": len(front),
            "pareto_front": [{"cost": float(c), "co2_kg": float(e)} for c, e in front],
            "knee_cost": float(knee[0]), "knee_co2_kg": float(knee[1]),
            "evaluations": n_weights * config.iterations,
        },
    )


# ---------------------------------------------------------------------------
# Variant 3: Pareto-archive SA (MOSA)
# ---------------------------------------------------------------------------

def _dominates(a: Tuple[float, float], b: Tuple[float, float]) -> bool:
    return a[0] <= b[0] and a[1] <= b[1] and (a[0] < b[0] or a[1] < b[1])


def _crowding_trim(archive: List[Tuple[np.ndarray, float, float]], max_size: int):
    """Drop the most crowded interior point until the archive fits."""
    while len(archive) > max_size:
        archive.sort(key=lambda t: t[1])
        c = np.array([t[1] for t in archive]); e = np.array([t[2] for t in archive])
        cs, es = max(c[-1] - c[0], 1e-12), max(e[0] - e[-1], 1e-12)
        crowd = (c[2:] - c[:-2]) / cs + (e[:-2] - e[2:]) / es   # interior points only
        del archive[1 + int(np.argmin(crowd))]
    return archive


def _update_archive(archive, cand, obj, max_size):
    if any(_dominates((c, e), obj) or (math.isclose(c, obj[0]) and math.isclose(e, obj[1]))
           for (_, c, e) in archive):
        return archive
    archive = [(x, c, e) for (x, c, e) in archive if not _dominates(obj, (c, e))]
    archive.append((cand.copy(), obj[0], obj[1]))
    return _crowding_trim(archive, max_size)


def run_archive_mosa(problem: TransportProblem, config: SAConfig = SAConfig(),
                     seed: int = 0, archive_size: int = 60) -> RunReport:
    rng = np.random.default_rng(seed)
    x = problem.random_solution(rng)
    cost, co2 = problem.evaluate(x)
    archive = [(x.copy(), cost, co2)]
    T = config.initial_temperature
    trace = [1]

    with stopwatch() as elapsed:
        for _ in range(config.iterations):
            y = _perturb(x, problem, rng)
            yc, ye = problem.evaluate(y)
            if _dominates((yc, ye), (cost, co2)):
                accept = True
            elif _dominates((cost, co2), (yc, ye)):
                n0, n1 = problem.normalized(cost, co2), problem.normalized(yc, ye)
                delta = (n1[0] - n0[0]) + (n1[1] - n0[1])
                accept = rng.random() < math.exp(-delta / max(T, 1e-12))
            else:
                accept = rng.random() < 0.5
            if accept:
                x, cost, co2 = y, yc, ye
            archive = _update_archive(archive, x, (cost, co2), archive_size)
            T *= config.cooling_rate
            trace.append(len(archive))
        total_time = elapsed()

    front = np.array(sorted([(c, e) for (_, c, e) in archive]))
    knee = knee_point(problem, front)
    return RunReport(
        algorithm="MOSA (Pareto archive)",
        problem="multi_obj_transport",
        best_fitness=float(len(front)),
        best_solution=front.tolist(),
        iterations=config.iterations,
        wall_time_seconds=total_time,
        convergence_trace=trace,
        extra={
            "pareto_front_size": len(front),
            "pareto_front": [{"cost": float(c), "co2_kg": float(e)} for c, e in front],
            "knee_cost": float(knee[0]), "knee_co2_kg": float(knee[1]),
            "evaluations": config.iterations,
        },
    )


def front_quality(problem: TransportProblem, approx: np.ndarray, exact: np.ndarray) -> float:
    """Hypervolume of `approx` as a fraction of the exact front's hypervolume.

    The reference point sits just beyond the exact front's nadir (its worst
    cost and worst CO2), so the metric rewards covering the whole trade-off
    rather than merely beating obviously bad solutions."""
    lo, hi = exact.min(axis=0), exact.max(axis=0)
    ref = tuple(hi + 0.05 * (hi - lo))
    return hypervolume_2d(approx, ref) / hypervolume_2d(exact, ref)


# ---------------------------------------------------------------------------
# Demo entry point
# ---------------------------------------------------------------------------

def main() -> None:
    set_seed(0)
    problem = TransportProblem(make_transportation_network(n_locations=8, seed=7))
    exact = exact_pareto_front(problem)
    cfg = SAConfig()

    print(f"Lanes: {problem.n_lanes}   exact Pareto front: {len(exact)} points")
    r1 = run_weighted_sum_sa(problem, cfg, seed=1)
    print(r1.summary())
    print(f"  balanced (w=0.5): cost=${r1.extra['best_cost']:,.0f}  CO2={r1.extra['best_co2_kg']:,.0f} kg")

    r2 = run_weight_sweep_mosa(problem, SAConfig(iterations=1500), seed=1)
    r3 = run_archive_mosa(problem, SAConfig(iterations=16500), seed=1)
    for r in (r2, r3):
        q = front_quality(problem, np.array(r.best_solution), exact)
        print(f"{r.algorithm:<24} points={r.extra['pareto_front_size']:>3}  "
              f"hypervolume={100 * q:.2f}% of exact  evaluations={r.extra['evaluations']:,}")

    save_convergence_plot(r1.convergence_trace, "/tmp/sa_weighted_convergence.png",
                          "Weighted-Sum SA — Best Normalized Objective")


if __name__ == "__main__":
    main()
