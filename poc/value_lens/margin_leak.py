"""
Margin Leak Finder — reference algorithm
========================================

Python reference implementation of the deterministic core specified in
VALUE_LENS_PHASE_A_IMPLEMENTATION_PLAN_v0.1 (demo policy v0.1, sections 2, 8, 10):

  1. Reference-price selection: one eligible agreement (customer, material,
     currency, inclusive start / exclusive end) sets the expected price;
     otherwise a complete lookup falls back to list price less 10%.
  2. Price waterfall and signed margin bridge in integer cents:
        expected margin - actual margin
          = discount + override + residual price + cost + charge   (exactly)
     Components are signed so favourable effects offset adverse ones; only the
     final net leakage is clamped at zero.
  3. Rules MLF-R-01..R-09 with inclusive thresholds, severity bands,
     evidence coverage, a stable review-queue order and non-additive
     customer/material patterns.
  4. Missing critical inputs BLOCK a line; they never become zero loss.

DEMO POLICY — NOT CUSTOMER-APPROVED ACCOUNTING LOGIC.

Run `python margin_leak.py` to evaluate the plan's Section 10 golden catalogue.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

UTC = timezone.utc


def sept(day: int) -> datetime:
    return datetime(2026, 9, day, tzinfo=UTC)


# ---------------------------------------------------------------------------
# Policy and inputs
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Policy:
    """Demo detection policy v0.1 (plan section 8). Money is integer cents."""
    version: str = "demo-margin-policy-v0.1"
    fallback_discount_bp: int = 1_000       # 10.00%
    min_net_leakage: int = 5_000            # R-01, inclusive
    min_component: int = 5_000              # R-02..R-07, inclusive
    medium_from: int = 10_000               # LOW below this
    high_from: int = 20_000
    pattern_min_members: int = 3            # R-08 / R-09
    annualization_weeks: int = 52
    window_start: datetime = sept(7)        # inclusive
    window_end: datetime = sept(14)         # exclusive


@dataclass(frozen=True)
class Agreement:
    agreement_id: str
    customer: str
    material: str
    price: int                  # unit price, cents
    valid_from: datetime        # inclusive
    valid_to: datetime          # exclusive
    currency: str = "USD"

    def eligible_for(self, line: "Line") -> bool:
        return (self.customer == line.customer and self.material == line.material
                and self.currency == line.currency and self.valid_from <= line.at < self.valid_to)


@dataclass
class Line:
    line_id: str
    customer: str
    material: str
    at: datetime
    qty: int
    list_price: int                        # cents per unit
    recorded_discount_bp: int
    final_price: int                       # charged unit price, cents
    ref_cost: int                          # reference (expected) unit cost
    current_cost: Optional[int]            # None = missing -> BLOCKED, never zero
    override_price: Optional[int] = None
    charge_cost: int = 0                   # item-level, cents
    charge_recovery: int = 0
    applied_agreement: Optional[str] = None
    evidence: Dict[str, bool] = field(default_factory=lambda: {
        "order_line": True, "pricing_trace": True, "cost_snapshot": True, "supporting_event": True})
    currency: str = "USD"


@dataclass
class LineResult:
    line: Line
    status: str                            # CALCULATED or BLOCKED
    issue: str = ""
    reference_price: int = 0
    reference_source: str = ""
    bridge: Dict[str, int] = field(default_factory=dict)
    expected_margin: int = 0
    actual_margin: int = 0
    leakage: int = 0
    rules: List[str] = field(default_factory=list)
    severity: Optional[str] = None
    coverage_pct: Optional[int] = None

    @property
    def is_case(self) -> bool:
        return "MLF-R-01" in self.rules


@dataclass
class Pattern:
    rule: str
    key: str
    members: List[str]
    exposure: int                          # member leakage; NOT added to run totals


# ---------------------------------------------------------------------------
# Exact arithmetic
# ---------------------------------------------------------------------------

def pct_price(list_price: int, discount_bp: int) -> int:
    """Unit price after a percentage discount, rounded to cents, ties away from zero."""
    num = list_price * (10_000 - discount_bp)
    q, r = divmod(abs(num), 10_000)
    if 2 * r >= 10_000:
        q += 1
    return q if num >= 0 else -q


def pct_half_up(numerator: int, denominator: int) -> int:
    """100 * numerator / denominator, rounded half up (non-negative inputs)."""
    return (200 * numerator + denominator) // (2 * denominator)


# ---------------------------------------------------------------------------
# The algorithm
# ---------------------------------------------------------------------------

def analyze_line(line: Line, agreements: List[Agreement], policy: Policy) -> LineResult:
    if line.current_cost is None:
        return LineResult(line, "BLOCKED", issue="current cost missing (not zero)")

    # 1. Reference price
    eligible = [a for a in agreements if a.eligible_for(line)]
    if len(eligible) > 1:
        return LineResult(line, "BLOCKED", issue="ambiguous eligible agreements")
    if eligible:
        p_ref, source = eligible[0].price, eligible[0].agreement_id
    else:
        p_ref, source = pct_price(line.list_price, policy.fallback_discount_bp), "FALLBACK"

    # 2. Price waterfall and signed bridge
    p_disc = pct_price(line.list_price, line.recorded_discount_bp)
    p_ovr = line.override_price if line.override_price is not None else p_disc
    q = line.qty
    charge_net = line.charge_cost - line.charge_recovery
    bridge = {
        "discount": (p_ref - p_disc) * q,
        "override": (p_disc - p_ovr) * q,
        "residual_price": (p_ovr - line.final_price) * q,
        "cost": (line.current_cost - line.ref_cost) * q,
        "charge": charge_net,
    }
    expected = (p_ref - line.ref_cost) * q
    actual = (line.final_price - line.current_cost) * q - charge_net
    net = sum(bridge.values())
    assert expected - actual == net, "signed bridge must reconcile to the cent"
    leakage = max(0, net)

    # 3. Rules: a financial finding first, then attached causes
    rules: List[str] = []
    if leakage >= policy.min_net_leakage:
        rules.append("MLF-R-01")
        mc = policy.min_component
        for comp, rule in [("discount", "MLF-R-02"), ("override", "MLF-R-03"),
                           ("cost", "MLF-R-04"), ("charge", "MLF-R-05")]:
            if bridge[comp] >= mc:
                rules.append(rule)
        if bridge["residual_price"] >= mc:
            applied = next((a for a in agreements if a.agreement_id == line.applied_agreement), None)
            if source != "FALLBACK":
                rules.append("MLF-R-06")                 # charged below an eligible agreement
            elif applied is not None and not applied.eligible_for(line):
                rules.append("MLF-R-07")                 # expired / out-of-scope agreement applied

    severity = None
    if rules:
        severity = ("HIGH" if leakage >= policy.high_from
                    else "MEDIUM" if leakage >= policy.medium_from else "LOW")
    have = sum(line.evidence.values())
    coverage = pct_half_up(have, len(line.evidence)) if rules else None

    return LineResult(line, "CALCULATED", reference_price=p_ref, reference_source=source,
                      bridge=bridge, expected_margin=expected, actual_margin=actual,
                      leakage=leakage, rules=rules, severity=severity, coverage_pct=coverage)


SEVERITY_RANK = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}


def run_analysis(lines: List[Line], agreements: List[Agreement], policy: Policy = Policy()):
    in_window = [l for l in lines if policy.window_start <= l.at < policy.window_end]
    results = [analyze_line(l, agreements, policy) for l in in_window]
    cases = [r for r in results if r.is_case]
    queue = sorted(cases, key=lambda r: (-SEVERITY_RANK[r.severity], -r.leakage, r.line.at, r.line.line_id))

    # Patterns only after the complete scan; they never add financial exposure
    patterns: List[Pattern] = []
    for rule, attr in [("MLF-R-08", "customer"), ("MLF-R-09", "material")]:
        groups: Dict[str, List[LineResult]] = defaultdict(list)
        for r in cases:
            groups[getattr(r.line, attr)].append(r)
        for key, members in sorted(groups.items()):
            ids = sorted({m.line.line_id for m in members})
            if len(ids) >= policy.pattern_min_members:
                patterns.append(Pattern(rule, key, ids, sum(m.leakage for m in members)))

    calculated = [r for r in results if r.status == "CALCULATED"]
    totals = {
        "lines": len(results),
        "calculated": len(calculated),
        "blocked": len(results) - len(calculated),
        "cases": len(cases),
        "expected_margin": sum(r.expected_margin for r in calculated),
        "actual_margin": sum(r.actual_margin for r in calculated),
        "leakage": sum(r.leakage for r in cases),
        "annualized": sum(r.leakage for r in cases) * policy.annualization_weeks,
        "severity": {s: sum(r.severity == s for r in cases) for s in ("HIGH", "MEDIUM", "LOW")},
    }
    return results, queue, patterns, totals


# ---------------------------------------------------------------------------
# Golden catalogue (plan section 10) — fixtures and independent expectations
# ---------------------------------------------------------------------------

def golden_fixtures() -> Tuple[List[Line], List[Line], List[Agreement]]:
    D = dict(qty=10, list_price=10_000, ref_cost=6_000, current_cost=6_000, at=sept(8))

    def line(lid, cust, mat, **kw):
        args = {**D, **kw}
        return Line(line_id=lid, customer=cust, material=mat, **args)

    agreements = [
        Agreement("AGR-06", "C06", "M06", 9_500, sept(1), datetime(2026, 10, 1, tzinfo=UTC)),
        Agreement("AGR-07", "C07", "M07", 7_500, datetime(2026, 8, 1, tzinfo=UTC), sept(7)),   # expired
        Agreement("AGR-08", "C99", "M08", 7_000, sept(1), datetime(2026, 10, 1, tzinfo=UTC)),  # other customer
        Agreement("AGR-11", "C11", "M11", 6_200, sept(1), datetime(2026, 10, 1, tzinfo=UTC)),  # approved special
    ]
    business = [
        line("GC-01", "C01", "M01", recorded_discount_bp=1_000, final_price=9_000),
        line("GC-02", "C02", "M02", recorded_discount_bp=2_000, final_price=8_000),
        line("GC-03", "C03", "M03", recorded_discount_bp=1_000, override_price=8_000, final_price=8_000,
             evidence={"order_line": True, "pricing_trace": True, "cost_snapshot": True,
                       "supporting_event": False}),                 # justification absent
        line("GC-04", "C04", "M04", recorded_discount_bp=1_000, final_price=9_000, current_cost=7_000),
        line("GC-05", "C05", "M05", recorded_discount_bp=1_000, final_price=9_000, charge_cost=6_000),
        line("GC-06", "C06", "M06", recorded_discount_bp=500, final_price=8_500),
        line("GC-07", "C07", "M07", recorded_discount_bp=1_000, final_price=7_500, applied_agreement="AGR-07"),
        line("GC-08", "C08", "M08", recorded_discount_bp=1_000, final_price=7_000, applied_agreement="AGR-08"),
        *[line(f"GC-09{s}", "C_REPEAT", f"M09{s}", recorded_discount_bp=2_000, final_price=8_000, at=sept(d))
          for s, d in zip("abc", (8, 10, 12))],
        *[line(f"GC-10{s}", f"C10{s}", "M_REPEAT", recorded_discount_bp=1_000, final_price=9_000,
               current_cost=7_000, at=sept(d)) for s, d in zip("abc", (8, 10, 12))],
        line("GC-11", "C11", "M11", recorded_discount_bp=3_800, final_price=6_200),
    ]
    controls = [
        line("GC-N01", "C90", "M90", recorded_discount_bp=2_000, final_price=8_000, current_cost=5_000),
        line("GC-N02", "C91", "M91", recorded_discount_bp=2_000, final_price=8_000, current_cost=None),
    ]
    return business, controls, agreements


# Expected values typed from the plan's catalogue (dollars): E, A, leakage, rules, severity, coverage
GOLDEN = {
    "GC-01": (300, 300, 0, [], None, None),
    "GC-02": (300, 200, 100, ["R-01", "R-02"], "MEDIUM", 100),
    "GC-03": (300, 200, 100, ["R-01", "R-03"], "MEDIUM", 75),
    "GC-04": (300, 200, 100, ["R-01", "R-04"], "MEDIUM", 100),
    "GC-05": (300, 240, 60, ["R-01", "R-05"], "LOW", 100),
    "GC-06": (350, 250, 100, ["R-01", "R-06"], "MEDIUM", 100),
    "GC-07": (300, 150, 150, ["R-01", "R-07"], "MEDIUM", 100),
    "GC-08": (300, 100, 200, ["R-01", "R-07"], "HIGH", 100),
    **{f"GC-09{s}": (300, 200, 100, ["R-01", "R-02"], "MEDIUM", 100) for s in "abc"},
    **{f"GC-10{s}": (300, 200, 100, ["R-01", "R-04"], "MEDIUM", 100) for s in "abc"},
    "GC-11": (20, 20, 0, [], None, None),
    "GC-N01": (300, 300, 0, [], None, None),
}


def check_golden(policy: Policy = Policy()) -> List[str]:
    """Return a list of mismatches against the plan's catalogue (empty = all pass)."""
    business, controls, agreements = golden_fixtures()
    failures: List[str] = []
    results, queue, patterns, totals = run_analysis(business, agreements, policy)
    ctrl_results, _, _, _ = run_analysis(controls, agreements, policy)
    for r in results + ctrl_results:
        lid = r.line.line_id
        if lid == "GC-N02":
            if r.status != "BLOCKED" or r.rules:
                failures.append("GC-N02 must be BLOCKED with no financial case")
            continue
        E, A, L, rules, sev, cov = GOLDEN[lid]
        got = (r.expected_margin, r.actual_margin, r.leakage, [x.replace("MLF-", "") for x in r.rules],
               r.severity, r.coverage_pct)
        want = (E * 100, A * 100, L * 100, rules, sev, cov)
        if got != want:
            failures.append(f"{lid}: got {got}, want {want}")
    want_totals = {"lines": 15, "calculated": 15, "blocked": 0, "cases": 13, "expected_margin": 427_000,
                   "actual_margin": 286_000, "leakage": 141_000, "annualized": 7_332_000,
                   "severity": {"HIGH": 1, "MEDIUM": 11, "LOW": 1}}
    if totals != want_totals:
        failures.append(f"totals: got {totals}, want {want_totals}")
    got_patterns = sorted((p.rule, p.key, len(p.members), p.exposure) for p in patterns)
    if got_patterns != [("MLF-R-08", "C_REPEAT", 3, 30_000), ("MLF-R-09", "M_REPEAT", 3, 30_000)]:
        failures.append(f"patterns: got {got_patterns}")
    return failures


def usd(cents: int) -> str:
    return f"${cents / 100:,.2f}"


def main() -> None:
    business, _, agreements = golden_fixtures()
    results, queue, patterns, totals = run_analysis(business, agreements)
    print("Review queue (severity, leakage, date, id):")
    for r in queue:
        b = {k: v for k, v in r.bridge.items() if v}
        print(f"  {r.severity:<6} {r.line.line_id:<7} leakage {usd(r.leakage):>8}  "
              f"E {usd(r.expected_margin):>8}  A {usd(r.actual_margin):>8}  "
              f"coverage {r.coverage_pct}%  {', '.join(r.rules)}  bridge {b}")
    for p in patterns:
        print(f"  Pattern {p.rule} {p.key}: {len(p.members)} cases, {usd(p.exposure)} exposure (not added to totals)")
    print(f"\nRun totals: {totals['cases']} cases from {totals['lines']} lines; expected margin "
          f"{usd(totals['expected_margin'])}, actual {usd(totals['actual_margin'])}, leakage "
          f"{usd(totals['leakage'])}, illustrative annualized {usd(totals['annualized'])}; severity {totals['severity']}")
    failures = check_golden()
    print("\nGolden catalogue:", "ALL CHECKS PASS" if not failures else "\n  ".join(["FAILURES"] + failures))


if __name__ == "__main__":
    main()
