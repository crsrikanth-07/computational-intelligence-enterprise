"""
Multi-seed benchmarks behind every comparison table in the book.

    python -m poc.benchmarks            # full run (a few minutes), writes poc/results/benchmarks.json
    python -m poc.benchmarks --quick    # 5 seeds per experiment, for a smoke test

Every number printed here is quoted in Chapters 7, 9, 13 and 15. Each result
is reported against an exact answer (exhaustive enumeration, MILP, exact
Pareto front, or per-product exact optimization) wherever one exists.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import numpy as np

from poc.agoa.agoa_scm import AGOAConfig, SupplyNetworkProblem, brute_force_optimum, milp_optimum, run_agoa
from poc.bessel_bfd.bfd_classifier import BFDConfig, run_bfd_pipeline
from poc.common import load_transport_csv, make_inventory_dataset, make_supply_network, make_transportation_network
from poc.hybrid_pso_ga.hybrid import HybridConfig, run_hybrid_pso_ga
from poc.pso.pso_inventory import InventoryProblem, PSOConfig, exact_optimum, run_pso
from poc.simulated_annealing.mosa_scm import (
    SAConfig, TransportProblem, exact_pareto_front, front_quality, run_archive_mosa, run_weight_sweep_mosa,
)

OUT = Path(__file__).resolve().parent / "results" / "benchmarks.json"


def _stats(values):
    v = np.asarray(values, float)
    return {"mean": float(v.mean()), "median": float(np.median(v)), "min": float(v.min()), "max": float(v.max())}


def agoa_small(seeds):
    problem = SupplyNetworkProblem(make_supply_network(5, 3, 6, seed=11))
    opt, _, n = brute_force_optimum(problem)
    variants = {
        "AGOA (adaptive)": AGOAConfig(population_size=80, generations=150),
        "GA fixed p_m=0.05": AGOAConfig(population_size=80, generations=150, adaptive=False),
        "GA fixed p_m=0.20": AGOAConfig(population_size=80, generations=150, adaptive=False, base_mutation_rate=0.20),
    }
    out = {"optimum": opt, "designs": n, "variants": {}}
    for name, cfg in variants.items():
        runs = [run_agoa(problem, cfg, seed=s) for s in seeds]
        gaps = [100 * (r.best_fitness - opt) / opt for r in runs]
        first_hit = [next((g for g, v in enumerate(r.convergence_trace) if v <= opt + 1e-6), None) for r in runs]
        out["variants"][name] = {
            "hits": int(sum(g < 1e-9 for g in gaps)), "runs": len(runs), "gap_pct": _stats(gaps),
            "median_gen_to_optimum": float(np.median([h for h in first_hit if h is not None])) if any(h is not None for h in first_hit) else None,
            "traces": [r.convergence_trace for r in runs],
            "mutation_trace_seed0": runs[0].extra["mutation_trace"],
        }
    return out


def agoa_large(seeds):
    problem = SupplyNetworkProblem(make_supply_network(20, 6, 40, seed=21))
    t = time.perf_counter(); opt, _ = milp_optimum(problem); t_milp = time.perf_counter() - t
    base = dict(population_size=100, generations=300, per_gene_scaling=True,
                base_mutation_rate=1.0, min_mutation_rate=0.25, max_mutation_rate=4.0)
    out = {"optimum": opt, "milp_seconds": t_milp, "search_space": float(6 ** 60), "variants": {}}
    for name, cfg in {"AGOA (adaptive)": AGOAConfig(**base),
                      "GA fixed p_m=1/L": AGOAConfig(adaptive=False, **base)}.items():
        runs = [run_agoa(problem, cfg, seed=s) for s in seeds]
        out["variants"][name] = {
            "gap_pct": _stats([100 * (r.best_fitness - opt) / opt for r in runs]),
            "seconds_per_run": float(np.mean([r.wall_time_seconds for r in runs])),
            "evaluations": int(runs[0].extra["evaluations"]),
        }
    return out


def mosa(seeds):
    out = {}
    for label, data in [("synthetic", make_transportation_network(8, seed=7)), ("csv", load_transport_csv())]:
        problem = TransportProblem(data)
        exact = exact_pareto_front(problem)
        res = {"lanes": problem.n_lanes, "exact_points": len(exact), "exact_front": exact.tolist()}
        for name, fn in [("weight sweep", lambda s: run_weight_sweep_mosa(problem, SAConfig(iterations=1500), seed=s)),
                         ("archive MOSA", lambda s: run_archive_mosa(problem, SAConfig(iterations=16500), seed=s))]:
            runs = [fn(s) for s in seeds]
            fronts = [np.array(r.best_solution) for r in runs]
            on_exact = [sum(any(np.allclose(p, e) for e in exact) for p in f) for f in fronts]
            res[name] = {
                "points": _stats([len(f) for f in fronts]),
                "hypervolume_pct": _stats([100 * front_quality(problem, f, exact) for f in fronts]),
                "points_on_exact_front": _stats(on_exact),
                "front_seed0": fronts[0].tolist(),
            }
        out[label] = res
    return out


def pso_vs_hybrid(seeds):
    data = make_inventory_dataset(8, seed=42)
    out = {}
    for label, disc in [("base", False), ("discounts", True)]:
        problem = InventoryProblem(data, use_discounts=disc)
        opt, _ = exact_optimum(problem)
        res = {"optimum": opt}
        for name, fn in [
            ("PSO 30x200", lambda s: run_pso(problem, PSOConfig(30, 200), seed=s)),
            ("PSO 60x200", lambda s: run_pso(problem, PSOConfig(60, 200), seed=s)),
            ("Hybrid 30x200", lambda s: run_hybrid_pso_ga(problem, HybridConfig(n_particles=30, iterations=200), seed=s)),
        ]:
            runs = [fn(s) for s in seeds]
            excess = [r.best_fitness - opt for r in runs]
            res[name] = {
                "evaluations": int(runs[0].extra["evaluations"]),
                "within_1": int(sum(e < 1 for e in excess)),
                "within_100": int(sum(e < 100 for e in excess)),
                "runs": len(runs), "excess": _stats(excess),
                "trace_median": np.median(np.array([r.convergence_trace for r in runs]) - opt, axis=0).tolist(),
            }
        out[label] = res
    return out


def bfd(seeds):
    out = {}
    for name, cfg in [("radial BFD (14)", BFDConfig(num_coeffs=14, lambda_value=0.22)),
                      ("Bessel-Fourier moments (30)", BFDConfig(descriptor="moments", n_max=6, m_max=4))]:
        runs = [run_bfd_pipeline(cfg, seed=s) for s in seeds]
        out[name] = {"accuracy": _stats([r.extra["test_accuracy"] for r in runs]),
                     "confusion_seed7": run_bfd_pipeline(cfg, seed=7).extra["confusion_matrix"]}
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args()
    s20 = range(5) if args.quick else range(20)
    s10 = range(3) if args.quick else range(10)
    t0 = time.perf_counter()
    results = {}
    for name, fn, seeds in [("agoa_small", agoa_small, s20), ("agoa_large", agoa_large, s10),
                            ("mosa", mosa, s10), ("pso_vs_hybrid", pso_vs_hybrid, s20), ("bfd", bfd, range(5))]:
        t = time.perf_counter()
        results[name] = fn(list(seeds))
        print(f"[{name}] done in {time.perf_counter() - t:.0f}s")
    results["seconds"] = time.perf_counter() - t0
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(results))
    print(f"Wrote {OUT}")
    print_summary(results)


def print_summary(R) -> None:
    a = R["agoa_small"]
    print(f"\nAGOA, 5/3/6 network — proven optimum ${a['optimum']:,.2f} ({a['designs']:,} designs)")
    for k, v in a["variants"].items():
        print(f"  {k:<18} optimal {v['hits']}/{v['runs']}  mean gap {v['gap_pct']['mean']:.2f}%  worst {v['gap_pct']['max']:.2f}%")
    b = R["agoa_large"]
    print(f"AGOA, 20/6/40 network — MILP optimum ${b['optimum']:,.2f} in {b['milp_seconds']:.1f}s")
    for k, v in b["variants"].items():
        g = v["gap_pct"]
        print(f"  {k:<18} mean gap {g['mean']:.1f}%  best {g['min']:.1f}%  worst {g['max']:.1f}%  {v['seconds_per_run']:.1f}s/run")
    for label, m in R["mosa"].items():
        print(f"MOSA {label}: {m['lanes']} lanes, exact front {m['exact_points']} points")
        for k in ("weight sweep", "archive MOSA"):
            print(f"  {k:<13} points {m[k]['points']['mean']:.1f}  hypervolume {m[k]['hypervolume_pct']['mean']:.1f}% "
                  f"(min {m[k]['hypervolume_pct']['min']:.1f}%)  on exact front {m[k]['points_on_exact_front']['mean']:.1f}")
    for label, m in R["pso_vs_hybrid"].items():
        print(f"PSO vs Hybrid ({label}) — exact optimum ${m['optimum']:,.2f}")
        for k in ("PSO 30x200", "PSO 60x200", "Hybrid 30x200"):
            v = m[k]
            print(f"  {k:<14} evals {v['evaluations']:>6,}  within $1: {v['within_1']:>2}/{v['runs']}  within $100: {v['within_100']:>2}/{v['runs']}"
                  f"  mean excess ${v['excess']['mean']:,.0f}  median ${v['excess']['median']:,.0f}  worst ${v['excess']['max']:,.0f}")
    for k, v in R["bfd"].items():
        acc = v["accuracy"]
        print(f"BFD {k:<28} accuracy mean {acc['mean']:.3f} (min {acc['min']:.3f}, max {acc['max']:.3f})")


if __name__ == "__main__":
    main()
