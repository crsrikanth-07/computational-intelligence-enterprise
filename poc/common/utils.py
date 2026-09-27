"""
Common utilities shared across all algorithm POCs.

This module provides:
  - A unified `RunReport` dataclass so every algorithm produces comparable output
  - Deterministic seeding helpers
  - Synthetic supply-chain dataset generators (so the POCs run without external CSVs)
  - A lightweight timing context manager

Author: Based on the research preprints by Srikanth Cherukupalli
"""

from __future__ import annotations

import contextlib
import json
import random
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

import numpy as np


# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------

def set_seed(seed: int) -> None:
    """Seed both Python `random` and NumPy's default generator."""
    random.seed(seed)
    np.random.seed(seed)


# ---------------------------------------------------------------------------
# Unified run report
# ---------------------------------------------------------------------------

@dataclass
class RunReport:
    """Structured result for any optimization run.

    Every POC in this book returns an instance of `RunReport` so results can
    be compared, logged, or serialized uniformly.
    """

    algorithm: str
    problem: str
    best_fitness: float
    best_solution: Any
    iterations: int
    wall_time_seconds: float
    convergence_trace: List[float] = field(default_factory=list)
    extra: Dict[str, Any] = field(default_factory=dict)

    def to_json(self, path: Optional[str | Path] = None) -> str:
        payload = asdict(self)
        # Convert numpy arrays to lists for JSON
        if isinstance(payload["best_solution"], np.ndarray):
            payload["best_solution"] = payload["best_solution"].tolist()
        text = json.dumps(payload, indent=2, default=str)
        if path is not None:
            Path(path).write_text(text)
        return text

    def summary(self) -> str:
        return (
            f"[{self.algorithm}] problem={self.problem} "
            f"best_fitness={self.best_fitness:.4f} "
            f"iters={self.iterations} "
            f"time={self.wall_time_seconds:.2f}s"
        )


# ---------------------------------------------------------------------------
# Timing
# ---------------------------------------------------------------------------

@contextlib.contextmanager
def stopwatch():
    """Context manager that yields a callable returning elapsed seconds."""
    start = time.perf_counter()
    yield lambda: time.perf_counter() - start


# ---------------------------------------------------------------------------
# Synthetic datasets — so POCs run standalone
# ---------------------------------------------------------------------------

def make_inventory_dataset(
    n_products: int = 5, seed: int = 42
) -> Dict[str, np.ndarray]:
    """Generate a synthetic multi-product dataset for the (Q, r) inventory model.

    Per product: annual demand, weekly demand std, lead time (days), unit price,
    holding cost (25% of price per unit-year), ordering cost per order,
    backorder cost per unit short, and two all-units price breaks (used only
    by the quantity-discount variant).
    """
    rng = np.random.default_rng(seed)
    weekly = rng.uniform(150, 450, size=n_products)
    price = rng.uniform(15, 60, size=n_products).round(2)
    holding = (0.25 * price).round(2)
    ordering = rng.uniform(40, 90, size=n_products).round(2)
    annual = np.round(52 * weekly)
    eoq = np.sqrt(2 * ordering * annual / holding)
    breaks = np.stack([np.round(rng.uniform(2.0, 3.5, n_products) * eoq, -1),
                       np.round(rng.uniform(5.0, 8.0, n_products) * eoq, -1)], axis=1)
    discount = np.stack([rng.uniform(0.002, 0.008, n_products).round(4),
                         rng.uniform(0.010, 0.025, n_products).round(4)], axis=1)
    return {
        "product_id": np.arange(1, n_products + 1),
        "annual_demand": annual,
        "weekly_demand_std": np.round(weekly * rng.uniform(0.2, 0.4, n_products), 1),
        "lead_time": rng.integers(3, 15, size=n_products).astype(float),
        "unit_price": price,
        "holding_cost": holding,
        "ordering_cost": ordering,
        "shortage_cost": np.round(price * rng.uniform(0.4, 1.0, n_products), 2),
        "break_qty": breaks,
        "discount": discount,
    }


# Illustrative per-tonne mode parameters. Orders of magnitude follow published
# freight emission factors (rail well below truck per tonne-km; air far above);
# replace them with your own carrier rates and emission factors in production.
FREIGHT_MODES = {
    "mode_names":                 np.array(["truck", "rail", "air"]),
    "mode_cost_per_tkm":          np.array([0.090, 0.035, 0.950]),   # USD per tonne-km
    "mode_co2_kg_per_tkm":        np.array([0.090, 0.025, 0.800]),   # kg CO2 per tonne-km
    "mode_handling_cost_per_t":   np.array([0.0, 45.0, 80.0]),       # terminal + drayage, USD/t
    "mode_handling_co2_kg_per_t": np.array([0.0, 12.0, 5.0]),        # drayage legs, kg CO2/t
    "mode_speed_kmh":             np.array([65.0, 40.0, 700.0]),
    "mode_fixed_hours":           np.array([2.0, 30.0, 8.0]),        # dwell / handling time
}


def make_transportation_network(
    n_locations: int = 8, seed: int = 7, lane_density: float = 0.5
) -> Dict[str, np.ndarray]:
    """Generate a synthetic freight network as a list of directed lanes.

    Sites are scattered over a 1,500 km x 900 km region; road distance is
    1.25 x straight-line distance. Each lane carries 5-40 tonnes a week and has
    a delivery-time limit drawn from {12, 24, 48, 72, 120} hours. Limits that no
    mode can meet are relaxed to the fastest mode's transit time.
    """
    rng = np.random.default_rng(seed)
    xy = rng.uniform([0, 0], [1500, 900], size=(n_locations, 2))
    origin, dest = [], []
    for i in range(n_locations):
        for j in range(n_locations):
            if i != j and rng.random() < lane_density:
                origin.append(i); dest.append(j)
    origin, dest = np.array(origin), np.array(dest)
    dist = np.round(1.25 * np.hypot(*(xy[origin] - xy[dest]).T))
    tonnes = rng.integers(5, 41, size=len(origin)).astype(float)
    limit = rng.choice([12, 24, 48, 72, 120], p=[0.1, 0.2, 0.3, 0.2, 0.2], size=len(origin)).astype(float)
    m = FREIGHT_MODES
    fastest = (m["mode_fixed_hours"][None, :] + dist[:, None] / m["mode_speed_kmh"][None, :]).min(axis=1)
    limit = np.maximum(limit, np.ceil(fastest))
    return {
        "origin": origin, "destination": dest,
        "distance_km": dist, "weekly_tonnes": tonnes, "max_transit_hours": limit,
        **{k: v.copy() for k, v in m.items()},
    }


def make_supply_network(
    n_suppliers: int = 4, n_plants: int = 3, n_dcs: int = 5, seed: int = 11,
    capacity_slack: float = 1.25,
) -> Dict[str, Any]:
    """Generate a synthetic three-tier supply network for AGOA.

    The network has suppliers -> plants -> distribution centers. AGOA
    chooses which plant each supplier feeds and which plant serves each DC.
    Capacity ranges are set so that a feasible single-sourcing design exists
    for typical seeds (total supplier and plant capacity exceed total demand).
    """
    rng = np.random.default_rng(seed)
    supplier_capacity = rng.integers(500, 1300, n_suppliers).astype(float)
    plant_capacity = rng.integers(1000, 2000, n_plants).astype(float)
    dc_demand = rng.integers(200, 900, n_dcs).astype(float)
    sp_cost = rng.uniform(1.0, 4.0, (n_suppliers, n_plants)).round(2)
    pd_cost = rng.uniform(1.5, 5.0, (n_plants, n_dcs)).round(2)
    fixed_plant_cost = rng.uniform(2000, 6000, n_plants).round(0)

    # Larger networks: scale capacities up (never down) so total supplier and
    # plant capacity are at least `capacity_slack` x total demand, and scale
    # plant fixed costs with plant size so consolidation stays a real trade-off.
    need = capacity_slack * dc_demand.sum()
    if supplier_capacity.sum() < need:
        supplier_capacity = np.ceil(supplier_capacity * need / supplier_capacity.sum())
    if plant_capacity.sum() < need:
        scale = need / plant_capacity.sum()
        plant_capacity = np.ceil(plant_capacity * scale)
        fixed_plant_cost = (fixed_plant_cost * scale).round(0)

    return {
        "n_suppliers": n_suppliers,
        "n_plants": n_plants,
        "n_dcs": n_dcs,
        "supplier_capacity": supplier_capacity,
        "plant_capacity": plant_capacity,
        "dc_demand": dc_demand,
        "sp_cost": sp_cost,
        "pd_cost": pd_cost,
        "fixed_plant_cost": fixed_plant_cost,
    }


# ---------------------------------------------------------------------------
# Mini plotting helper (headless-safe)
# ---------------------------------------------------------------------------

def save_convergence_plot(trace: Sequence[float], path: str, title: str) -> None:
    """Save a convergence curve. Uses Agg backend so it works headless."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(7, 4))
    ax.plot(trace, linewidth=1.8)
    ax.set_xlabel("Iteration")
    ax.set_ylabel("Best fitness so far")
    ax.set_title(title)
    ax.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)
