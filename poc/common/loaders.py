"""
CSV dataset loaders.

These functions read the files in poc/datasets/ and return dict structures
identical in shape to what the synthetic generators in poc.common.utils
produce. This lets every algorithm in the library be driven from real CSV
data without any change to the algorithm code.

Usage
-----
    from poc.common.loaders import load_inventory_csv, load_supply_network_csv, load_transport_csv

    inv_data     = load_inventory_csv()
    network_data = load_supply_network_csv()
    transp_data  = load_transport_csv()
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd

# Directory containing the CSV datasets. Resolved relative to this file so the
# same loader works regardless of the caller's working directory.
DATASETS_DIR = Path(__file__).resolve().parent.parent / "datasets"


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------

def load_inventory_csv(path: str | Path | None = None) -> Dict[str, np.ndarray]:
    """Load inventory data and return the dict expected by InventoryProblem."""
    p = Path(path) if path else DATASETS_DIR / "inventory_sample.csv"
    df = pd.read_csv(p)
    return {
        "product_id":        df["product_id"].to_numpy(),
        "product_name":      df["product_name"].to_numpy(dtype=object),
        "annual_demand":     df["annual_demand"].to_numpy(dtype=float),
        "weekly_demand_std": df["weekly_demand_std"].to_numpy(dtype=float),
        "lead_time":         df["lead_time_days"].to_numpy(dtype=float),
        "unit_price":        df["unit_price"].to_numpy(dtype=float),
        "holding_cost":      df["holding_cost"].to_numpy(dtype=float),
        "ordering_cost":     df["ordering_cost"].to_numpy(dtype=float),
        "shortage_cost":     df["shortage_cost"].to_numpy(dtype=float),
        "break_qty":         df[["break_qty_1", "break_qty_2"]].to_numpy(dtype=float),
        "discount":          df[["discount_1", "discount_2"]].to_numpy(dtype=float),
    }


# ---------------------------------------------------------------------------
# Supply network
# ---------------------------------------------------------------------------

def load_supply_network_csv(
    suppliers_path: str | Path | None = None,
    plants_path:    str | Path | None = None,
    dcs_path:       str | Path | None = None,
    sp_cost_path:   str | Path | None = None,
    pd_cost_path:   str | Path | None = None,
) -> Dict[str, object]:
    """Load the three-tier supply network from CSV files.

    Returns the same dict structure as make_supply_network(), augmented with
    friendly entity names.
    """
    s_path  = Path(suppliers_path) if suppliers_path else DATASETS_DIR / "suppliers.csv"
    pl_path = Path(plants_path)    if plants_path    else DATASETS_DIR / "plants.csv"
    d_path  = Path(dcs_path)       if dcs_path       else DATASETS_DIR / "distribution_centers.csv"
    sp_path = Path(sp_cost_path)   if sp_cost_path   else DATASETS_DIR / "sp_cost_matrix.csv"
    pd_path = Path(pd_cost_path)   if pd_cost_path   else DATASETS_DIR / "pd_cost_matrix.csv"

    s_df  = pd.read_csv(s_path)
    pl_df = pd.read_csv(pl_path)
    d_df  = pd.read_csv(d_path)
    sp_df = pd.read_csv(sp_path)
    pd_df = pd.read_csv(pd_path)

    n_s = len(s_df);  n_p = len(pl_df);  n_d = len(d_df)

    # sp_cost: skip the first column (supplier_id index); use the rest
    sp_cost = sp_df.iloc[:, 1:].to_numpy(dtype=float)
    pd_cost = pd_df.iloc[:, 1:].to_numpy(dtype=float)

    assert sp_cost.shape == (n_s, n_p), f"sp_cost shape {sp_cost.shape} != ({n_s}, {n_p})"
    assert pd_cost.shape == (n_p, n_d), f"pd_cost shape {pd_cost.shape} != ({n_p}, {n_d})"

    return {
        "n_suppliers":         n_s,
        "n_plants":            n_p,
        "n_dcs":               n_d,
        "supplier_capacity":   s_df["capacity_units_per_week"].to_numpy(dtype=float),
        "plant_capacity":      pl_df["capacity_units_per_week"].to_numpy(dtype=float),
        "dc_demand":           d_df["weekly_demand_units"].to_numpy(dtype=float),
        "sp_cost":             sp_cost,
        "pd_cost":             pd_cost,
        "fixed_plant_cost":    pl_df["fixed_operating_cost_per_week"].to_numpy(dtype=float),
        "supplier_names":      s_df["supplier_name"].to_numpy(dtype=object),
        "plant_names":         pl_df["plant_name"].to_numpy(dtype=object),
        "dc_names":            d_df["dc_name"].to_numpy(dtype=object),
    }


# ---------------------------------------------------------------------------
# Transportation
# ---------------------------------------------------------------------------

def load_transport_csv(
    lanes_path: str | Path | None = None,
    modes_path: str | Path | None = None,
) -> Dict[str, object]:
    """Load freight lanes + mode parameters in the TransportProblem format."""
    l_path = Path(lanes_path) if lanes_path else DATASETS_DIR / "transport_lanes.csv"
    m_path = Path(modes_path) if modes_path else DATASETS_DIR / "transport_modes.csv"
    lanes = pd.read_csv(l_path)
    modes = pd.read_csv(m_path)
    return {
        "origin":                     lanes["origin"].to_numpy(dtype=object),
        "destination":                lanes["destination"].to_numpy(dtype=object),
        "distance_km":                lanes["distance_km"].to_numpy(dtype=float),
        "weekly_tonnes":              lanes["weekly_tonnes"].to_numpy(dtype=float),
        "max_transit_hours":          lanes["max_transit_hours"].to_numpy(dtype=float),
        "mode_names":                 modes["mode"].to_numpy(dtype=object),
        "mode_cost_per_tkm":          modes["cost_per_tkm"].to_numpy(dtype=float),
        "mode_co2_kg_per_tkm":        modes["co2_kg_per_tkm"].to_numpy(dtype=float),
        "mode_handling_cost_per_t":   modes["handling_cost_per_t"].to_numpy(dtype=float),
        "mode_handling_co2_kg_per_t": modes["handling_co2_kg_per_t"].to_numpy(dtype=float),
        "mode_speed_kmh":             modes["avg_speed_kmh"].to_numpy(dtype=float),
        "mode_fixed_hours":           modes["fixed_hours"].to_numpy(dtype=float),
    }


# ---------------------------------------------------------------------------
# BFD features (pre-extracted, ready for classification)
# ---------------------------------------------------------------------------

def load_bfd_features_csv(path: str | Path | None = None):
    """Load pre-extracted BFD features and labels for quick classification demos."""
    p = Path(path) if path else DATASETS_DIR / "bfd_features_sample.csv"
    df = pd.read_csv(p)
    y = df["shape_class"].to_numpy(dtype=object)
    X = df.drop(columns=["shape_class"]).to_numpy(dtype=float)
    return X, y
