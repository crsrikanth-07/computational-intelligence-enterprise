"""Regression tests for the numbers reported in the book.

Run from the repository root:  python -m pytest
"""
import inspect
import subprocess
import sys

import numpy as np
import pytest
from scipy.ndimage import rotate

from poc.common.loaders import load_supply_network_csv, load_transport_csv
from poc.common.utils import make_inventory_dataset, make_supply_network, make_transportation_network
from poc.agoa.agoa_scm import AGOAConfig, SupplyNetworkProblem, brute_force_optimum, milp_optimum, run_agoa
from poc.simulated_annealing.mosa_scm import TransportProblem, exact_pareto_front
from poc.pso.pso_inventory import InventoryProblem, PSOConfig, exact_optimum, run_pso
from poc.bessel_bfd.bfd_classifier import bessel_fourier_moments, make_synthetic_dataset


def first_float(x):
    """Pull the objective value out of whatever an exact solver returns."""
    if isinstance(x, (int, float)):
        return float(x)
    if hasattr(x, "best_fitness"):
        return float(x.best_fitness)
    if isinstance(x, dict):
        for k in ("cost", "objective", "total", "best_fitness", "value"):
            if k in x:
                return float(x[k])
    if isinstance(x, (tuple, list)):
        for v in x:
            try:
                return first_float(v)
            except TypeError:
                pass
    raise TypeError(f"no numeric value in {type(x)}")


# ------------------------------------------------------------------ Part III
@pytest.fixture(scope="module")
def small_network():
    return SupplyNetworkProblem(data=make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11))


def test_enumeration_and_milp_agree(small_network):
    opt, _, n = brute_force_optimum(small_network)
    assert n == 3 ** 11
    assert opt == pytest.approx(18715.83, abs=0.01)
    assert first_float(milp_optimum(small_network)) == pytest.approx(opt, abs=0.01)


def test_agoa_reaches_optimum_and_is_reproducible(small_network):
    cfg = AGOAConfig(population_size=80, generations=150)
    a = run_agoa(small_network, cfg, seed=0)
    b = run_agoa(small_network, cfg, seed=0)
    assert a.best_fitness == pytest.approx(18715.83, abs=0.01)
    assert a.best_fitness == b.best_fitness
    assert list(a.convergence_trace) == list(b.convergence_trace)


def test_csv_network_optimum():
    opt, _, _ = brute_force_optimum(SupplyNetworkProblem(data=load_supply_network_csv()))
    assert opt == pytest.approx(28742.50, abs=0.01)


# ------------------------------------------------------------------- Part IV
def _assert_nondominated(front):
    f = np.asarray(front, dtype=float)
    for p in f:
        dominated = np.all(f <= p, axis=1) & np.any(f < p, axis=1)
        assert not dominated.any()


def test_exact_fronts():
    csv_front = exact_pareto_front(TransportProblem(data=load_transport_csv()))
    syn_front = exact_pareto_front(TransportProblem(data=make_transportation_network()))
    assert len(csv_front) == 31
    assert len(syn_front) == 59
    _assert_nondominated(csv_front)
    assert csv_front[:, 0].min() == pytest.approx(26636, abs=1)
    assert csv_front[:, 1].min() == pytest.approx(16772, abs=1)


# -------------------------------------------------------------------- Part V
def _inventory(n, seed, discounts=False):
    kwargs = {"data": make_inventory_dataset(n, seed=seed)}
    if discounts:
        params = inspect.signature(InventoryProblem).parameters
        if "use_discounts" not in params:
            pytest.skip("InventoryProblem has no use_discounts option")
        kwargs["use_discounts"] = True
    return InventoryProblem(**kwargs)


def test_pso_matches_exact_on_demo_instance():
    problem = _inventory(5, 42)
    exact, _ = exact_optimum(problem)
    assert exact == pytest.approx(38410.83, abs=0.01)
    report = run_pso(problem, PSOConfig(n_particles=30, iterations=200), seed=1)
    assert report.best_fitness == pytest.approx(exact, rel=1e-6)


def test_exact_optima_of_case_study():
    assert exact_optimum(_inventory(8, 42))[0] == pytest.approx(59798.23, abs=0.01)
    assert exact_optimum(_inventory(8, 42, discounts=True))[0] == pytest.approx(5490829.20, abs=0.01)


# ------------------------------------------------------------------- Part VI
def test_bessel_fourier_moments_rotation_invariant():
    X, y, _ = make_synthetic_dataset(n_per_class=2, seed=3)
    img = np.asarray(X[np.flatnonzero(np.asarray(y) == 2)[0]], dtype=float)   # a square
    img = img.reshape(48, 48) if img.ndim == 1 else img
    turned = rotate(img, 37, reshape=False, order=1, mode="constant")
    d = np.linalg.norm(bessel_fourier_moments(img) - bessel_fourier_moments(turned))
    assert d < 0.05


# ----------------------------------------------------------------- Part VIII
def _run(module):
    return subprocess.run([sys.executable, "-m", module], capture_output=True, text=True, timeout=300)


def test_margin_leak_finder_golden_catalogue():
    out = _run("poc.value_lens.margin_leak")
    assert out.returncode == 0, out.stderr
    assert "ALL CHECKS PASS" in out.stdout
    assert "$1,410.00" in out.stdout and "$73,320.00" in out.stdout


def test_threshold_calibration_runs():
    out = _run("poc.value_lens.threshold_calibration")
    assert out.returncode == 0, out.stderr
