"""
Pareto calibration of Margin Leak Finder detection thresholds
=============================================================

The deterministic engine (margin_leak.py) decides *whether money was lost*.
This algorithm answers the next question: how strict should detection be?
Low thresholds catch more real leakage but flood reviewers with cases they
dismiss as legitimate; high thresholds save review effort but miss money.

Decision variables (8): a minimum net-leakage threshold per customer tier
(strategic, key, standard) and a minimum component threshold per cause
(discount, override, cost, charge, agreement price), each on a $25 grid from
$50 (the current demo policy) to $500. A reviewed historical line is flagged
when its leakage clears BOTH its tier threshold and its cause threshold.

Objectives, from reviewer outcomes on history (both minimized):
    f1 = cases reviewers dismissed as legitimate       (wasted review effort)
    f2 = confirmed leakage the thresholds would miss   ($ per year)

Because a line's flag depends on max(tier threshold, cause threshold), the
thresholds are coupled and the problem is not separable. It still has an exact
Pareto front: enumerate the 19^3 tier settings; for each, the five causes are
separable and merge exactly (the lane-merge technique from Chapter 9). That
exact front is the yardstick for archive multi-objective simulated annealing
(MOSA), the method that still works once more couplings are added.

Governance, consistent with the Value Lens guardrails: calibration runs
offline on reviewed history and proposes candidate configurations. A human
owner picks one; it becomes a new versioned detection config with new golden
tests. Nothing here changes thresholds at run time and no model selects them.

All data below are synthetic.  Run:  python threshold_calibration.py
"""

from __future__ import annotations

import itertools
import math
import time

import numpy as np

TIERS = ["strategic", "key", "standard"]
CAUSES = ["discount", "override", "cost", "charge", "agreement_price"]
GRID = np.arange(50, 501, 25)          # dollars; index 0 = current $50 policy
K, NT, NC = len(GRID), len(TIERS), len(CAUSES)


# ---------------------------------------------------------------------------
# Synthetic reviewed history
# ---------------------------------------------------------------------------

def simulate_history(weeks: int = 52, lines_per_week: int = 400, seed: int = 2026) -> dict:
    """Flagged-at-$50 lines with reviewer outcomes (confirmed leak vs dismissed).

    Legitimate exceptions (approved-but-undocumented concessions, one-off
    goodwill) are common for strategic customers and discount/override causes,
    and become rarer as the amount grows; cost-driven leakage is rarely legit.
    """
    rng = np.random.default_rng(seed)
    n = weeks * lines_per_week
    week = np.repeat(np.arange(weeks), lines_per_week)
    tier = rng.choice(NT, size=n, p=[0.2, 0.3, 0.5])
    has_event = rng.random(n) < np.array([0.12, 0.09, 0.07])[tier]
    week, tier = week[has_event], tier[has_event]
    cause_p = np.array([[0.40, 0.25, 0.15, 0.10, 0.10],
                        [0.30, 0.20, 0.20, 0.15, 0.15],
                        [0.25, 0.10, 0.30, 0.20, 0.15]])
    cause = np.array([rng.choice(NC, p=cause_p[t]) for t in tier])
    amount = 50 + rng.lognormal(np.log(70), 0.9, size=len(tier))          # >= $50
    base = np.array([[1.6, 1.2, -0.5, 0.8, 0.9],
                     [0.8, 0.6, -0.8, 0.3, 0.2],
                     [0.2, 0.0, -1.2, -0.2, -0.6]])
    logit = base[tier, cause] - 0.8 * np.log2(amount / 50)
    legit = rng.random(len(tier)) < 1 / (1 + np.exp(-logit))
    return {"week": week, "tier": tier, "cause": cause, "amount": amount, "confirmed": ~legit}


def outcome_tables(h: dict, mask: np.ndarray):
    """D[t,c,e] = dismissed cases, M[t,c,e] = missed confirmed $, if the
    effective threshold for segment (t, c) is GRID[e]."""
    D = np.zeros((NT, NC, K)); M = np.zeros((NT, NC, K))
    for t in range(NT):
        for c in range(NC):
            sel = mask & (h["tier"] == t) & (h["cause"] == c)
            amt, conf = h["amount"][sel], h["confirmed"][sel]
            for e, T in enumerate(GRID):
                flagged = amt >= T
                D[t, c, e] = np.sum(flagged & ~conf)
                M[t, c, e] = amt[~flagged & conf].sum()
    return D, M


def evaluate(x: np.ndarray, D: np.ndarray, M: np.ndarray):
    """x = [tier idx x3, cause idx x5] -> (dismissed cases, missed confirmed $)."""
    e = np.maximum(x[:NT, None], x[None, NT:])                 # effective index per (t, c)
    t_idx, c_idx = np.indices((NT, NC))
    return float(D[t_idx, c_idx, e].sum()), float(M[t_idx, c_idx, e].sum())


# ---------------------------------------------------------------------------
# Exact Pareto front
# ---------------------------------------------------------------------------

def _nondominated(F: np.ndarray) -> np.ndarray:
    order = np.lexsort((F[:, 1], F[:, 0]))
    keep, best = [], np.inf
    for i in order:
        if F[i, 1] < best - 1e-9:
            keep.append(i); best = F[i, 1]
    return np.array(keep, dtype=int)


def exact_front(D: np.ndarray, M: np.ndarray):
    """Exact front and one threshold vector per front point."""
    all_F, all_X = [], []
    for tv in itertools.product(range(K), repeat=NT):
        tv = np.array(tv)
        F, X = np.zeros((1, 2)), np.zeros((1, 0), dtype=int)
        for c in range(NC):
            e = np.maximum(tv[:, None], np.arange(K)[None, :])       # (NT, K)
            opts = np.stack([D[np.arange(NT)[:, None], c, e].sum(0),
                             M[np.arange(NT)[:, None], c, e].sum(0)], axis=1)
            merged = (F[:, None, :] + opts[None, :, :]).reshape(-1, 2)
            mx = np.concatenate([np.repeat(X, K, axis=0), np.tile(np.arange(K), len(F))[:, None]], axis=1)
            keep = _nondominated(merged)
            F, X = merged[keep], mx[keep]
        all_F.append(F); all_X.append(np.concatenate([np.repeat(tv[None, :], len(F), 0), X], axis=1))
    F, X = np.concatenate(all_F), np.concatenate(all_X)
    keep = _nondominated(F)
    return F[keep], X[keep]


def hypervolume(F: np.ndarray, ref) -> float:
    P = F[_nondominated(F)]
    P = P[(P[:, 0] <= ref[0]) & (P[:, 1] <= ref[1])]
    hv, prev = 0.0, ref[1]
    for f1, f2 in P:
        hv += (ref[0] - f1) * (prev - f2); prev = f2
    return hv


# ---------------------------------------------------------------------------
# Archive MOSA over the 8 coupled thresholds
# ---------------------------------------------------------------------------

def archive_mosa(D, M, iterations=20_000, seed=0, archive_size=150, T0=0.05, cooling=0.9997):
    rng = np.random.default_rng(seed)
    f1_max, f2_max = evaluate(np.zeros(8, int), D, M)[0], evaluate(np.full(8, K - 1), D, M)[1]
    norm = lambda f: (f[0] / max(f1_max, 1e-9), f[1] / max(f2_max, 1e-9))
    dom = lambda a, b: a[0] <= b[0] and a[1] <= b[1] and (a[0] < b[0] or a[1] < b[1])
    x = np.zeros(8, dtype=int)                                  # start from current policy
    fx = evaluate(x, D, M)
    archive = {tuple(x): fx}
    T = T0
    for _ in range(iterations):
        y = x.copy()
        j = rng.integers(8)
        y[j] = np.clip(y[j] + rng.choice([-2, -1, 1, 2]), 0, K - 1)
        fy = evaluate(y, D, M)
        if dom(fy, fx):
            accept = True
        elif dom(fx, fy):
            a, b = norm(fx), norm(fy)
            accept = rng.random() < math.exp(-((b[0] - a[0]) + (b[1] - a[1])) / max(T, 1e-12))
        else:
            accept = rng.random() < 0.5
        if accept:
            x, fx = y, fy
        if not any(dom(v, fx) or v == fx for v in archive.values()):
            archive = {k: v for k, v in archive.items() if not dom(fx, v)}
            archive[tuple(x)] = fx
            if len(archive) > archive_size:                     # drop the most crowded point
                items = sorted(archive.items(), key=lambda kv: kv[1][0])
                f = np.array([v for _, v in items])
                gaps = (f[2:, 0] - f[:-2, 0]) / max(f1_max, 1) + (f[:-2, 1] - f[2:, 1]) / max(f2_max, 1)
                del archive[items[1 + int(np.argmin(gaps))][0]]
        T *= cooling
    X = np.array(list(archive.keys())); F = np.array(list(archive.values()))
    return F, X


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------

def describe(x) -> str:
    tiers = ", ".join(f"{TIERS[t]} ${GRID[x[t]]}" for t in range(NT))
    causes = ", ".join(f"{CAUSES[c]} ${GRID[x[NT + c]]}" for c in range(NC))
    return f"tier floors [{tiers}]; cause floors [{causes}]"


def main() -> None:
    h = simulate_history()
    train, test = h["week"] < 39, h["week"] >= 39
    D, M = outcome_tables(h, train)
    Dt, Mt = outcome_tables(h, test)
    base = np.zeros(8, dtype=int)
    b1, _ = evaluate(base, D, M)
    confirmed_total = h["amount"][train & h["confirmed"]].sum()
    print(f"History: {len(h['amount']):,} lines flagged at the current $50 policy over 52 weeks "
          f"({(~h['confirmed']).mean():.0%} dismissed by reviewers)")
    print(f"Training weeks 1-39 at current policy: {b1:.0f} dismissed cases, "
          f"${confirmed_total:,.0f} confirmed leakage, $0 missed")

    t = time.perf_counter(); F, X = exact_front(D, M); te = time.perf_counter() - t
    lo, hi = F.min(0), F.max(0); ref = hi + 0.05 * (hi - lo)
    hv_exact = hypervolume(F, ref)
    print(f"\nExact Pareto front: {len(F)} points over {K ** 8:,} threshold settings ({te:.1f}s)")

    for seed in range(3):
        t = time.perf_counter(); Fa, _ = archive_mosa(D, M, seed=seed); ta = time.perf_counter() - t
        on = sum(any(np.allclose(p, q) for q in F) for p in Fa)
        print(f"  Archive MOSA seed {seed}: {len(Fa)} points, hypervolume {100 * hypervolume(Fa, ref) / hv_exact:.1f}% "
              f"of exact, {on} exactly on the front, 20,000 evaluations ({ta:.1f}s)")

    # Business selection rule: give up at most 2% of confirmed leakage, then minimize dismissals
    ok = F[:, 1] <= 0.02 * confirmed_total
    i = int(np.argmin(np.where(ok, F[:, 0], np.inf)))
    x = X[i]
    tr = evaluate(x, D, M); ho = evaluate(x, Dt, Mt); hb = evaluate(base, Dt, Mt)
    conf_test = h["amount"][test & h["confirmed"]].sum()
    print(f"\nChosen by 'miss at most 2% of confirmed leakage': {describe(x)}")
    print(f"  Training: dismissed {b1:.0f} -> {tr[0]:.0f} ({100 * (tr[0] - b1) / b1:+.0f}%), "
          f"missed ${tr[1]:,.0f} ({100 * tr[1] / confirmed_total:.1f}% of confirmed)")
    print(f"  Hold-out weeks 40-52: dismissed {hb[0]:.0f} -> {ho[0]:.0f} ({100 * (ho[0] - hb[0]) / hb[0]:+.0f}%), "
          f"missed ${ho[1]:,.0f} ({100 * ho[1] / conf_test:.1f}% of ${conf_test:,.0f} confirmed)")


if __name__ == "__main__":
    main()
