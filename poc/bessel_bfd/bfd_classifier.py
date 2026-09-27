"""
Bessel-Fourier Descriptors (BFD) for Image Pattern Recognition
==============================================================

A working POC that extracts rotation-invariant feature descriptors from
grayscale images using Bessel functions of the first kind, and uses them
as input to a classifier.

Feature pipeline
----------------
  1. Compute the **radial intensity profile** I(r) of each image — the mean
     pixel intensity at each integer radius from the image center.
  2. Integrate against a family of Bessel functions J_n to obtain N
     coefficients:
             a_n = sum_r I(r) * J_n(lambda * r) * r * dr     (discrete)
     The `r * dr` factor comes from the 2-D polar-integration Jacobian.
  3. L2-normalize the coefficient vector so different-brightness copies of
     the same shape map to the same descriptor.

Because the descriptor is built from *radial* averages, it is inherently
rotation-invariant — rotating the image does not change I(r).

This POC generates a small synthetic dataset of geometric shapes (circles,
rings, squares, plus-signs) so it runs with no external data, then trains a
linear SVM on BFD features and reports accuracy.

Run it
------
    python -m poc.bessel_bfd.bfd_classifier
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import List, Tuple

import numpy as np
from scipy.special import jn, jn_zeros, jv
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from poc.common import RunReport, set_seed, stopwatch


# ---------------------------------------------------------------------------
# Feature extraction
# ---------------------------------------------------------------------------

def radial_profile(image: np.ndarray) -> np.ndarray:
    """Return the mean intensity as a function of integer radius."""
    h, w = image.shape
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    y, x = np.indices((h, w))
    r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    r_int = r.astype(int)
    n_bins = int(r_int.max()) + 1
    profile = np.bincount(r_int.ravel(), weights=image.ravel(), minlength=n_bins)
    counts = np.bincount(r_int.ravel(), minlength=n_bins)
    counts = np.maximum(counts, 1)
    return profile / counts


def bessel_fourier_descriptors(
    image: np.ndarray, num_coeffs: int = 12, lambda_value: float = 0.25
) -> np.ndarray:
    """Compute `num_coeffs` BFD features for a single image."""
    I = radial_profile(image)
    r = np.arange(I.size, dtype=float)
    # Polar integration Jacobian `r` included; dr = 1 (integer radii)
    coeffs = np.array([
        float(np.sum(I * jn(n, lambda_value * r) * r)) for n in range(num_coeffs)
    ])
    norm = np.linalg.norm(coeffs)
    if norm > 0:
        coeffs = coeffs / norm
    return coeffs


@lru_cache(maxsize=8)
def _bfm_basis(h: int, w: int, n_max: int, m_max: int, order: int):
    """Precompute the (masked) Bessel-Fourier basis for an h x w image."""
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    R = min(cy, cx)
    y, x = np.indices((h, w))
    xr, yr = (x - cx) / R, (y - cy) / R
    r = np.hypot(xr, yr)
    inside = r <= 1.0
    r, theta = r[inside], np.arctan2(yr, xr)[inside]
    lam = jn_zeros(order, n_max)
    a = jv(order + 1, lam) ** 2 / 2.0
    radial = jv(order, lam[:, None] * r[None, :])                   # (n, pixels)
    angular = np.exp(-1j * np.arange(m_max + 1)[:, None] * theta)    # (m, pixels)
    basis = (radial[:, None, :] * angular[None, :, :]) / (2 * np.pi * a[:, None, None] * R ** 2)
    return inside, basis.reshape(n_max * (m_max + 1), -1)


def bessel_fourier_moments(
    image: np.ndarray, n_max: int = 6, m_max: int = 4, order: int = 1
) -> np.ndarray:
    """Rotation-invariant Bessel-Fourier moment magnitudes |B_nm|.

    Unlike the radial descriptor above, these moments keep angular structure.
    The image is mapped onto the unit disk and projected onto the orthogonal
    basis J_v(lambda_n r) exp(-j m theta), where lambda_n are the zeros of
    J_v (Xiao, Ma and Wang, 2010):

        B_nm = 1 / (2 pi a_n) * sum f(r, theta) J_v(lambda_n r) e^{-j m theta} dA
        a_n  = J_{v+1}(lambda_n)^2 / 2

    Rotating the image only shifts the phase of B_nm, so |B_nm| is invariant.
    Returns the L2-normalized vector of n_max x (m_max + 1) magnitudes.
    """
    inside, basis = _bfm_basis(image.shape[0], image.shape[1], n_max, m_max, order)
    v = np.abs(basis @ image[inside])
    norm = np.linalg.norm(v)
    return v / norm if norm > 0 else v


# ---------------------------------------------------------------------------
# Synthetic shape dataset
# ---------------------------------------------------------------------------

def _make_circle(size: int, radius: int) -> np.ndarray:
    y, x = np.indices((size, size))
    cy, cx = (size - 1) / 2.0, (size - 1) / 2.0
    return ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2).astype(float)


def _make_ring(size: int, r_in: int, r_out: int) -> np.ndarray:
    y, x = np.indices((size, size))
    cy, cx = (size - 1) / 2.0, (size - 1) / 2.0
    d2 = (x - cx) ** 2 + (y - cy) ** 2
    return ((d2 >= r_in ** 2) & (d2 <= r_out ** 2)).astype(float)


def _make_square(size: int, half: int) -> np.ndarray:
    img = np.zeros((size, size), float)
    c = size // 2
    img[c - half:c + half, c - half:c + half] = 1.0
    return img


def _make_plus(size: int, length: int, thickness: int) -> np.ndarray:
    img = np.zeros((size, size), float)
    c = size // 2
    img[c - thickness:c + thickness, c - length:c + length] = 1.0
    img[c - length:c + length, c - thickness:c + thickness] = 1.0
    return img


def _add_noise_and_rotate(
    img: np.ndarray, rng: np.random.Generator, noise_level: float
) -> np.ndarray:
    """Small random rotation + additive noise."""
    from scipy.ndimage import rotate as nd_rotate
    angle = float(rng.uniform(-60, 60))
    out = nd_rotate(img, angle, reshape=False, order=1, mode="constant", cval=0.0)
    out = out + rng.normal(0.0, noise_level, size=out.shape)
    return np.clip(out, 0.0, 1.0)


def make_synthetic_dataset(
    n_per_class: int = 80, size: int = 48, seed: int = 0
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    rng = np.random.default_rng(seed)
    class_names = ["circle", "ring", "square", "plus"]
    X_list, y_list = [], []

    for cls, name in enumerate(class_names):
        for _ in range(n_per_class):
            if name == "circle":
                base = _make_circle(size, radius=int(rng.integers(8, 18)))
            elif name == "ring":
                r_in = int(rng.integers(6, 10))
                r_out = r_in + int(rng.integers(4, 8))
                base = _make_ring(size, r_in, r_out)
            elif name == "square":
                base = _make_square(size, half=int(rng.integers(6, 14)))
            else:  # plus
                base = _make_plus(
                    size,
                    length=int(rng.integers(10, 18)),
                    thickness=int(rng.integers(2, 5)),
                )
            img = _add_noise_and_rotate(base, rng, noise_level=0.08)
            X_list.append(img)
            y_list.append(cls)

    return np.array(X_list), np.array(y_list), class_names


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

@dataclass
class BFDConfig:
    num_coeffs: int = 12
    lambda_value: float = 0.25
    test_size: float = 0.25
    svm_C: float = 1.0
    descriptor: str = "radial"      # "radial" (preprint BFD) or "moments" (full BFM)
    n_max: int = 6                  # moments: radial orders
    m_max: int = 4                  # moments: angular harmonics 0..m_max


def run_bfd_pipeline(config: BFDConfig = BFDConfig(), seed: int = 0) -> RunReport:
    set_seed(seed)
    X_img, y, class_names = make_synthetic_dataset(
        n_per_class=80, size=48, seed=seed
    )

    with stopwatch() as elapsed:
        # Extract BFD features
        if config.descriptor == "moments":
            X = np.array([bessel_fourier_moments(img, config.n_max, config.m_max) for img in X_img])
        else:
            X = np.array([
                bessel_fourier_descriptors(img, config.num_coeffs, config.lambda_value)
                for img in X_img
            ])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config.test_size, random_state=seed, stratify=y
        )

        scaler = StandardScaler().fit(X_train)
        X_train_s = scaler.transform(X_train)
        X_test_s = scaler.transform(X_test)

        clf = SVC(kernel="linear", C=config.svm_C).fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)
        acc = float(accuracy_score(y_test, y_pred))
        total_time = elapsed()

    return RunReport(
        algorithm="BFM + Linear SVM" if config.descriptor == "moments" else "BFD + Linear SVM",
        problem="shape_classification",
        best_fitness=-acc,                     # "lower is better" convention
        best_solution={"test_accuracy": acc},
        iterations=1,
        wall_time_seconds=total_time,
        convergence_trace=[acc],
        extra={
            "test_accuracy": acc,
            "class_names": class_names,
            "descriptor": config.descriptor,
            "num_features": int(X.shape[1]),
            "num_coeffs": config.num_coeffs,
            "lambda": config.lambda_value,
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "n_train": int(len(X_train)),
            "n_test": int(len(X_test)),
            "report": classification_report(
                y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0
            ),
        },
    )


# ---------------------------------------------------------------------------
# Demo entry point
# ---------------------------------------------------------------------------

def main() -> None:
    for cfg in (BFDConfig(num_coeffs=14, lambda_value=0.22),
                BFDConfig(descriptor="moments", n_max=6, m_max=4)):
        report = run_bfd_pipeline(cfg, seed=7)
        print(report.summary())
        print(f"  Features      : {report.extra['num_features']}")
        print(f"  Test accuracy : {report.extra['test_accuracy']:.4f}")
        print(f"  Train/Test    : {report.extra['n_train']} / {report.extra['n_test']}")


if __name__ == "__main__":
    main()
