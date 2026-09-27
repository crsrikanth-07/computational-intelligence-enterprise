"""
Tuning descriptor settings with PSO (Chapter 15).

The same `run_pso` used for inventory in Part V tunes the radial descriptor's
scale lambda and coefficient count N, and the moment orders (n_max, m_max),
by maximizing 5-fold cross-validated accuracy on the training images only.
The held-out test split is touched once, after tuning.

    python -m poc.bessel_bfd.tuning
"""

from __future__ import annotations

import numpy as np
from scipy.special import jn
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from poc.bessel_bfd.bfd_classifier import bessel_fourier_moments, make_synthetic_dataset, radial_profile
from poc.pso.pso_inventory import PSOConfig, run_pso


class DescriptorTuning:
    """Adapter exposing the interface run_pso expects (bounds, dim, fitness)."""

    def __init__(self, kind: str, X_img, y):
        self.kind, self.X_img, self.y = kind, X_img, y
        self.profiles = [radial_profile(im) for im in X_img]
        self.n_products = 2
        self.use_discounts = False
        self.dim = 2
        self.cache = {}

    def bounds(self):
        if self.kind == "radial":
            return np.array([0.05, 4.0]), np.array([1.50, 24.0])      # lambda, N
        return np.array([2.0, 1.0]), np.array([10.0, 8.0])           # n_max, m_max

    def features(self, x, X_img=None, profiles=None):
        if self.kind == "radial":
            lam, N = float(x[0]), int(round(x[1]))
            profs = profiles if profiles is not None else self.profiles
            F = []
            for I in profs:
                r = np.arange(I.size, dtype=float)
                v = np.array([np.sum(I * jn(n, lam * r) * r) for n in range(N)])
                F.append(v / (np.linalg.norm(v) or 1.0))
            return np.array(F)
        n_max, m_max = int(round(x[0])), int(round(x[1]))
        imgs = X_img if X_img is not None else self.X_img
        return np.array([bessel_fourier_moments(im, n_max, m_max) for im in imgs])

    def fitness(self, x):
        key = (round(float(x[0]), 3), int(round(x[1]))) if self.kind == "radial" else (int(round(x[0])), int(round(x[1])))
        if key not in self.cache:
            clf = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0))
            cv = StratifiedKFold(5, shuffle=True, random_state=0)
            self.cache[key] = 1.0 - cross_val_score(clf, self.features(x), self.y, cv=cv).mean()
        return self.cache[key]


def tune(kind: str, seed: int = 7):
    X_img, y, _ = make_synthetic_dataset(n_per_class=80, size=48, seed=seed)
    idx = np.arange(len(y))
    tr, te = train_test_split(idx, test_size=0.25, random_state=seed, stratify=y)
    prob = DescriptorTuning(kind, X_img[tr], y[tr])
    rep = run_pso(prob, PSOConfig(n_particles=12, iterations=15), seed=1)
    x = np.array(rep.best_solution)
    clf = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0))
    Ftr = prob.features(x)
    if kind == "radial":
        Fte = prob.features(x, profiles=[radial_profile(im) for im in X_img[te]])
    else:
        Fte = prob.features(x, X_img=X_img[te])
    acc = clf.fit(Ftr, y[tr]).score(Fte, y[te])
    return x, 1.0 - rep.best_fitness, acc, len(prob.cache), rep.extra["evaluations"]


def holdout_accuracy(kind: str, x, seeds=range(5)) -> list:
    """Accuracy of a fixed tuned setting on five fresh datasets and splits."""
    from poc.bessel_bfd.bfd_classifier import BFDConfig, run_bfd_pipeline
    if kind == "radial":
        cfg = BFDConfig(num_coeffs=int(round(x[1])), lambda_value=float(x[0]))
    else:
        cfg = BFDConfig(descriptor="moments", n_max=int(round(x[0])), m_max=int(round(x[1])))
    return [run_bfd_pipeline(cfg, seed=s).extra["test_accuracy"] for s in seeds]


def main() -> None:
    for kind in ("radial", "moments"):
        x, cv_acc, test_acc, distinct, evals = tune(kind)
        label = (f"lambda={x[0]:.3f}, N={int(round(x[1]))}" if kind == "radial"
                 else f"n_max={int(round(x[0]))}, m_max={int(round(x[1]))}")
        accs = holdout_accuracy(kind, x)
        print(f"{kind:<8} tuned {label}: CV accuracy {cv_acc:.3f}, test accuracy {test_acc:.3f} "
              f"({evals} PSO evaluations, {distinct} distinct settings); "
              f"5 fresh datasets: mean {np.mean(accs):.3f} (min {min(accs):.3f}, max {max(accs):.3f})")


if __name__ == "__main__":
    main()
