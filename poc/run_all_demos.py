"""
Unified POC runner — exercises every algorithm in the book on seeded synthetic
data and prints each result next to its exact (or reference) answer.

Run it from the repository root:

    python -m poc.run_all_demos
"""

from __future__ import annotations

import numpy as np

from poc.agoa.agoa_scm import AGOAConfig, SupplyNetworkProblem, brute_force_optimum, run_agoa
from poc.bessel_bfd.bfd_classifier import BFDConfig, run_bfd_pipeline
from poc.common import make_inventory_dataset, make_supply_network, make_transportation_network, set_seed
from poc.hybrid_pso_ga.hybrid import HybridConfig, run_hybrid_pso_ga
from poc.pso.pso_inventory import InventoryProblem, PSOConfig, exact_optimum, run_pso
from poc.simulated_annealing.mosa_scm import (
    SAConfig, TransportProblem, exact_pareto_front, front_quality,
    run_archive_mosa, run_weight_sweep_mosa,
)


def main() -> None:
    set_seed(42)
    rows = []
    print("=" * 78)
    print(" RUNNING ALL POCs")
    print("=" * 78)

    # ---- AGOA ---------------------------------------------------------
    print("\n[1/5] AGOA — three-tier supply network (5 suppliers, 3 plants, 6 DCs)")
    print("-" * 78)
    agoa_problem = SupplyNetworkProblem(make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11))
    agoa = run_agoa(agoa_problem, AGOAConfig(population_size=60, generations=120), seed=1)
    opt, _, n_enum = brute_force_optimum(agoa_problem)
    b = agoa.extra["breakdown"]
    print(agoa.summary())
    print(f"  Supplier->Plant : {agoa.best_solution['supplier_to_plant']}")
    print(f"  DC->Plant       : {agoa.best_solution['dc_to_plant']}")
    print(f"  Open plants {b['open_plants']}, penalty ${b['penalty']:,.0f}; "
          f"exhaustive optimum over {n_enum:,} designs = ${opt:,.2f}")
    rows.append(("AGOA", "network design $/wk", agoa.best_fitness, opt, agoa.extra["evaluations"], agoa.wall_time_seconds))

    # ---- MOSA ---------------------------------------------------------
    print("\n[2/5] Multi-objective SA — freight cost vs CO2 (8 sites)")
    print("-" * 78)
    tp = TransportProblem(make_transportation_network(n_locations=8, seed=7))
    exact = exact_pareto_front(tp)
    sweep = run_weight_sweep_mosa(tp, SAConfig(iterations=1500), seed=1)
    arch = run_archive_mosa(tp, SAConfig(iterations=16500), seed=1)
    q_sweep = front_quality(tp, np.array(sweep.best_solution), exact)
    q_arch = front_quality(tp, np.array(arch.best_solution), exact)
    print(f"  {tp.n_lanes} lanes; exact Pareto front has {len(exact)} points")
    print(f"  Weight sweep : {sweep.extra['pareto_front_size']:>3} points, hypervolume {100 * q_sweep:.1f}% of exact")
    print(f"  Archive MOSA : {arch.extra['pareto_front_size']:>3} points, hypervolume {100 * q_arch:.1f}% of exact")
    print(f"  Knee (archive): cost ${arch.extra['knee_cost']:,.0f}/wk, CO2 {arch.extra['knee_co2_kg']:,.0f} kg/wk")
    rows.append(("Weight-sweep SA", "front hypervolume %", 100 * q_sweep, 100.0, sweep.extra["evaluations"], sweep.wall_time_seconds))
    rows.append(("Archive MOSA", "front hypervolume %", 100 * q_arch, 100.0, arch.extra["evaluations"], arch.wall_time_seconds))

    # ---- PSO ----------------------------------------------------------
    print("\n[3/5] PSO — (Q, r) inventory policy, 6 products")
    print("-" * 78)
    inv = InventoryProblem(make_inventory_dataset(n_products=6, seed=42))
    pso = run_pso(inv, PSOConfig(n_particles=30, iterations=200), seed=1)
    inv_opt, x_star = exact_optimum(inv)
    print(pso.summary())
    print(f"  Q (PSO)  : {np.round(pso.extra['order_quantity'], 1).tolist()}")
    print(f"  Q (exact): {np.round(x_star[:inv.n_products], 1).tolist()}")
    rows.append(("PSO", "inventory $/yr", pso.best_fitness, inv_opt, pso.extra["evaluations"], pso.wall_time_seconds))

    # ---- Hybrid PSO-GA -----------------------------------------------
    print("\n[4/5] Hybrid PSO-GA vs PSO — quantity-discount variant (8 products), equal budgets")
    print("-" * 78)
    disc = InventoryProblem(make_inventory_dataset(n_products=8, seed=42), use_discounts=True)
    disc_opt, _ = exact_optimum(disc)
    hy = run_hybrid_pso_ga(disc, HybridConfig(n_particles=30, iterations=200), seed=1)
    pso2 = run_pso(disc, PSOConfig(n_particles=60, iterations=200), seed=1)
    for r in (pso2, hy):
        print(f"  {r.algorithm:<14} ${r.best_fitness:,.2f}/yr  (+${r.best_fitness - disc_opt:,.2f} over optimum, "
              f"{r.extra['evaluations']:,} evaluations)")
    rows.append(("PSO (discounts)", "inventory $/yr", pso2.best_fitness, disc_opt, pso2.extra["evaluations"], pso2.wall_time_seconds))
    rows.append(("Hybrid PSO-GA", "inventory $/yr", hy.best_fitness, disc_opt, hy.extra["evaluations"], hy.wall_time_seconds))

    # ---- BFD ----------------------------------------------------------
    print("\n[5/5] Bessel-Fourier features — shape classification")
    print("-" * 78)
    radial = run_bfd_pipeline(BFDConfig(num_coeffs=14, lambda_value=0.22), seed=7)
    moments = run_bfd_pipeline(BFDConfig(descriptor="moments", n_max=6, m_max=4), seed=7)
    for r in (radial, moments):
        print(f"  {r.algorithm:<18} accuracy {r.extra['test_accuracy']:.3f} "
              f"({r.extra['num_features']} features, {r.extra['n_test']} test images)")
    rows.append(("BFD radial + SVM", "test accuracy %", 100 * radial.extra["test_accuracy"], None, 1, radial.wall_time_seconds))
    rows.append(("BFM + SVM", "test accuracy %", 100 * moments.extra["test_accuracy"], None, 1, moments.wall_time_seconds))

    # ---- Summary table ------------------------------------------------
    print("\n" + "=" * 78)
    print(" SUMMARY (each result beside its exact or reference value)")
    print("=" * 78)
    print(f"{'Algorithm':<17}{'Measure':<22}{'Result':>14}{'Exact':>14}{'Gap':>8}{'Time':>7}")
    print("-" * 82)
    for name, measure, val, ref, evals, t in rows:
        exact_s = "" if ref is None else f"{ref:,.2f}"
        gap = "" if ref is None or "hypervolume" in measure else f"{100 * (val - ref) / ref:.2f}%"
        print(f"{name:<17}{measure:<22}{val:>14,.2f}{exact_s:>14}{gap:>8}{t:>6.2f}s")
    print()


if __name__ == "__main__":
    main()
