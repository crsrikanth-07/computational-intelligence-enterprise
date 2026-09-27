"""
Worked examples — run every algorithm on the CSV datasets in poc/datasets/
and print the numbers quoted in Appendix D of the book.

Run from the repository root:

    python -m poc.worked_examples
"""

from __future__ import annotations

import numpy as np

from poc.agoa.agoa_scm import AGOAConfig, SupplyNetworkProblem, brute_force_optimum, run_agoa
from poc.bessel_bfd.bfd_classifier import BFDConfig, run_bfd_pipeline
from poc.common import load_inventory_csv, load_supply_network_csv, load_transport_csv, set_seed
from poc.hybrid_pso_ga.hybrid import HybridConfig, run_hybrid_pso_ga
from poc.pso.pso_inventory import InventoryProblem, PSOConfig, exact_optimum, run_pso
from poc.simulated_annealing.mosa_scm import (
    SAConfig, TransportProblem, exact_pareto_front, front_quality, knee_point,
    run_archive_mosa, run_weight_sweep_mosa, run_weighted_sum_sa,
)


def section(title: str) -> None:
    print("\n" + "=" * 78)
    print(f" {title}")
    print("=" * 78)


def worked_example_agoa() -> None:
    section("D.1  AGOA on the CSV supply network")
    data = load_supply_network_csv()
    problem = SupplyNetworkProblem(data=data)
    set_seed(42)
    report = run_agoa(problem, AGOAConfig(population_size=80, generations=200), seed=42)
    opt, _, n = brute_force_optimum(problem)
    b = report.extra["breakdown"]
    print(report.summary())
    print(f"Exhaustive optimum over {n:,} designs: ${opt:,.2f}/week  (AGOA gap {100 * (report.best_fitness - opt) / opt:.2f}%)")
    print(f"Cost breakdown: fixed ${b['fixed']:,.0f} + inbound ${b['inbound']:,.2f} + outbound ${b['outbound']:,.2f}"
          f" + penalty ${b['penalty']:,.0f}   ({b['open_plants']} plants open)")
    print("\nDecoded design:")
    for s, p in enumerate(report.best_solution["supplier_to_plant"]):
        print(f"  {data['supplier_names'][s]:<20} -> {data['plant_names'][p]}")
    for k, p in enumerate(report.best_solution["dc_to_plant"]):
        print(f"  {data['dc_names'][k]:<20} <- {data['plant_names'][p]}")


def worked_example_sa() -> None:
    section("D.2  Multi-objective SA on the CSV freight lanes")
    problem = TransportProblem(load_transport_csv())
    names = problem.data["mode_names"]
    exact = exact_pareto_front(problem)
    print(f"Lanes: {problem.n_lanes}   exact Pareto front: {len(exact)} points")
    print(f"Front spans cost ${exact[:, 0].min():,.0f}-{exact[:, 0].max():,.0f}/week and "
          f"CO2 {exact[:, 1].min():,.0f}-{exact[:, 1].max():,.0f} kg/week")

    for label, w in [("Cost-focused  (w_cost=0.9)", 0.9), ("Balanced      (w_cost=0.5)", 0.5),
                     ("Green-focused (w_cost=0.1)", 0.1)]:
        r = run_weighted_sum_sa(problem, SAConfig(w_cost=w, w_co2=1 - w), seed=7)
        modes = np.bincount(np.array(r.best_solution), minlength=len(names))
        mix = ", ".join(f"{names[m]} {modes[m]}" for m in range(len(names)))
        print(f"{label}: cost ${r.extra['best_cost']:,.0f}  CO2 {r.extra['best_co2_kg']:,.0f} kg   lanes: {mix}")

    sweep = run_weight_sweep_mosa(problem, SAConfig(iterations=1500), seed=7)
    arch = run_archive_mosa(problem, SAConfig(iterations=16500), seed=7)
    for r in (sweep, arch):
        q = front_quality(problem, np.array(r.best_solution), exact)
        print(f"{r.algorithm:<22} {r.extra['pareto_front_size']:>3} points, hypervolume {100 * q:.1f}% of exact "
              f"({r.extra['evaluations']:,} evaluations)")
    kn = knee_point(problem, exact)
    print(f"Exact knee point: cost ${kn[0]:,.0f}/week, CO2 {kn[1]:,.0f} kg/week")


def worked_example_pso() -> None:
    section("D.3  PSO on the CSV inventory dataset — (Q, r) policy")
    data = load_inventory_csv()
    problem = InventoryProblem(data)
    set_seed(42)
    report = run_pso(problem, PSOConfig(n_particles=30, iterations=300), seed=42)
    opt, x_star = exact_optimum(problem)
    n = problem.n_products
    print(f"{'Product':<10}{'EOQ':>8}{'Q exact':>9}{'Q PSO':>8}{'r exact':>9}{'r PSO':>8}")
    for i in range(n):
        print(f"{data['product_name'][i]:<10}{problem.eoq[i]:>8.0f}{x_star[i]:>9.0f}"
              f"{report.extra['order_quantity'][i]:>8.0f}{x_star[n + i]:>9.0f}{report.extra['reorder_point'][i]:>8.0f}")
    print(f"\n{report.summary()}")
    print(f"Exact optimum ${opt:,.2f}/yr; PSO excess ${report.best_fitness - opt:,.2f}/yr")


def worked_example_hybrid() -> None:
    section("D.4  Hybrid PSO-GA vs PSO — CSV inventory with quantity discounts")
    problem = InventoryProblem(load_inventory_csv(), use_discounts=True)
    opt, _ = exact_optimum(problem)
    print(f"Exact optimum ${opt:,.2f}/yr (purchase cost included)")
    ex_pso, ex_hy = [], []
    for seed in [1, 2, 3, 4, 5]:
        r1 = run_pso(problem, PSOConfig(n_particles=60, iterations=200), seed=seed)       # equal budget
        r2 = run_hybrid_pso_ga(problem, HybridConfig(n_particles=30, iterations=200), seed=seed)
        ex_pso.append(r1.best_fitness - opt); ex_hy.append(r2.best_fitness - opt)
        print(f"  seed={seed}:  PSO +${ex_pso[-1]:>8,.2f}   Hybrid +${ex_hy[-1]:>8,.2f}   (excess over optimum, $/yr)")
    print(f"\nMean excess — PSO ${np.mean(ex_pso):,.2f}/yr, Hybrid ${np.mean(ex_hy):,.2f}/yr (12,000+ evaluations each)")


def worked_example_bfd() -> None:
    section("D.5  Bessel-Fourier features + linear SVM")
    for cfg in (BFDConfig(num_coeffs=14, lambda_value=0.22), BFDConfig(descriptor="moments", n_max=6, m_max=4)):
        r = run_bfd_pipeline(cfg, seed=7)
        print(f"{r.algorithm:<18} accuracy {r.extra['test_accuracy']:.3f}  "
              f"features {r.extra['num_features']:>2}  train/test {r.extra['n_train']}/{r.extra['n_test']}")
        print(f"   confusion matrix (rows = true circle, ring, square, plus): {r.extra['confusion_matrix']}")


def main() -> None:
    worked_example_agoa()
    worked_example_sa()
    worked_example_pso()
    worked_example_hybrid()
    worked_example_bfd()


if __name__ == "__main__":
    main()
