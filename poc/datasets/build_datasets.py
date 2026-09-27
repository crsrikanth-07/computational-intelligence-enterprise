"""
Regenerate the generated CSV datasets in this folder.

    python -m poc.datasets.build_datasets

inventory_sample.csv and bfd_features_sample.csv are produced by the seeded
generators, so they can always be rebuilt bit-for-bit. The supply-network and
transport CSVs are hand-authored (anonymized) and are not touched.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from poc.common import make_inventory_dataset

HERE = Path(__file__).resolve().parent
PRODUCT_NAMES = ["Widget-A", "Widget-B", "Gadget-C", "Gadget-D",
                 "Module-E", "Module-F", "Sensor-G", "Sensor-H"]


def build_inventory() -> pd.DataFrame:
    d = make_inventory_dataset(n_products=8, seed=2026)
    df = pd.DataFrame({
        "product_id": d["product_id"],
        "product_name": PRODUCT_NAMES,
        "annual_demand": d["annual_demand"].astype(int),
        "weekly_demand_std": d["weekly_demand_std"],
        "lead_time_days": d["lead_time"].astype(int),
        "unit_price": d["unit_price"],
        "holding_cost": d["holding_cost"],
        "ordering_cost": d["ordering_cost"],
        "shortage_cost": d["shortage_cost"],
        "break_qty_1": d["break_qty"][:, 0].astype(int),
        "discount_1": d["discount"][:, 0],
        "break_qty_2": d["break_qty"][:, 1].astype(int),
        "discount_2": d["discount"][:, 1],
    })
    df.to_csv(HERE / "inventory_sample.csv", index=False)
    return df


def build_bfd_features() -> pd.DataFrame:
    from poc.bessel_bfd.bfd_classifier import bessel_fourier_descriptors, make_synthetic_dataset
    X, y, names = make_synthetic_dataset(n_per_class=2, size=48, seed=7)
    feats = np.array([bessel_fourier_descriptors(im, 14, 0.22) for im in X]).round(4)
    df = pd.DataFrame(feats, columns=[f"a{k}" for k in range(14)])
    df.insert(0, "shape_class", [names[k] for k in y])
    df.to_csv(HERE / "bfd_features_sample.csv", index=False)
    return df


if __name__ == "__main__":
    print(build_inventory().to_string(index=False))
    print(build_bfd_features().iloc[:, :6].to_string(index=False))
