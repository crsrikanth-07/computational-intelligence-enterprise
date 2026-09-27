# Changelog

## 2.0.0 — September 2026

### Book
- Restructured into 8 parts and 20 chapters; contents page now has verified page numbers, plus a generated index.
- New: MILP-or-metaheuristic decision guide (1.5), how results are reported (2.6), comparing algorithms fairly (4.7).
- Parts III–VI rewritten around exact baselines: enumeration and MILP for AGOA, exact Pareto fronts for MOSA,
  exact per-product optima for PSO and the hybrid, fresh-data accuracy and PSO tuning for Bessel descriptors.
- New Part VIII capstone: Margin Leak Finder (deterministic detection) and multi-objective threshold calibration.
- 14 figures generated from code; appendices A–E rewritten, 33 exercises with selected solutions.
- Fixed: duplicated part numbering, wrong chapter ranges, list numbering that never restarted, ISBN placeholders,
  unembedded cover fonts, barcode placeholder box, missing "About This Book".

### Code
- AGOA: per-DC single-sourcing encoding (every DC served by construction), entropy-based diversity signal,
  optional 1/L per-gene scaling, exact baselines `brute_force_optimum` and `milp_optimum`.
- MOSA: lane-based freight model with truck/rail/air economics, exact Pareto front, hypervolume, knee point,
  weight-sweep and archive variants at equal budgets.
- PSO: (Q, r) inventory model with optional all-units quantity discounts and exact optimum; per-dimension bounds.
- Hybrid PSO-GA: evaluation counting for fair budgets; isolated GA population by default.
- Bessel: full Bessel-Fourier moments (cached basis) alongside the radial descriptor; PSO descriptor tuning.
- New `poc/value_lens/` (Margin Leak Finder reference implementation and threshold calibration).
- New benchmark suite (`poc/benchmarks.py`), worked examples, regenerated CSV datasets and a pytest suite.
