# Computational Intelligence for Enterprise Systems — companion code

Working Python prototypes, datasets, benchmarks and tests for the book
*Computational Intelligence for Enterprise Systems: Advanced Optimization
Algorithms with Working Prototypes* by Srikanth Cherukupalli.

The book covers five methods and a capstone, and measures every result against
an exact answer or a proven bound wherever one exists:

| Part | Method | Enterprise problem | Exact reference |
|---|---|---|---|
| III | Adaptive Genetic Optimization (AGOA) | Single-sourcing supply-network design | Exhaustive enumeration; MILP (HiGHS) |
| IV | Multi-objective simulated annealing | Freight mode choice: cost vs CO2 | Exact Pareto front (lane merging) |
| V | PSO and hybrid PSO-GA | Multi-product (Q, r) inventory with quantity discounts | Exact per-product optimum |
| VI | Bessel-Fourier descriptors | Rotation-invariant visual inspection | Held-out and fresh-data accuracy |
| VIII | Margin Leak Finder (capstone) | Margin-leakage detection and threshold calibration | Golden catalogue; exact front by decomposition |

## Quick start

```bash
pip install -r requirements.txt
python -m poc.run_all_demos       # every method once, with exact references (a few seconds)
python -m poc.worked_examples     # Appendix D worked examples on the CSV datasets
python -m poc.benchmarks          # all multi-seed comparisons in the book (~4 minutes)
python -m pytest                  # regression tests for the numbers reported in the book
```

Individual demos: `python -m poc.agoa.agoa_scm`, `poc.simulated_annealing.mosa_scm`,
`poc.pso.pso_inventory`, `poc.hybrid_pso_ga.hybrid`, `poc.bessel_bfd.bfd_classifier`,
`poc.bessel_bfd.tuning`, `poc.value_lens.margin_leak`, `poc.value_lens.threshold_calibration`.

## Selected results (all reproducible from fixed seeds)

- **AGOA**, 5 suppliers / 3 plants / 6 DCs: proven optimum $18,715.83/week. Over 20 seeds the adaptive GA
  reaches it in 18/20 runs versus 6/20 for a fixed-rate GA (p_m = 0.05). On a 20/6/40 network a MILP solver
  proves the optimum in 0.9 s while the GA averages 14% above it — the book says so plainly.
- **MOSA**, 20 freight lanes: archive MOSA recovers 99.5% of the exact front's hypervolume versus 89.8% for a
  weight sweep at equal budgets.
- **Hybrid PSO-GA**, 8 products: exact optimum in 20/20 runs (plain PSO: 16/20 at the same budget); with
  quantity discounts the hybrid cuts PSO's mean excess cost from $2,291 to $837 a year.
- **Bessel-Fourier descriptors**: PSO-tuned radial descriptor 98.8% test accuracy (99.5% on fresh data),
  up from 80.0% with the preprint's settings.
- **Margin Leak Finder**: reproduces its golden catalogue exactly (13 cases, $1,410 leakage); calibration finds
  the exact 227-point front over 17 billion threshold settings in about four seconds.

## Repository layout

```
poc/          algorithms, generators, CSV loaders, demos, benchmarks (results/benchmarks.json)
tests/        pytest suite
book/         manuscript sources (docx-js), figures (make_figures.py), KDP build scripts
kdp/          print interior, cover and KDP metadata (build outputs are git-ignored)
```

## Building the book

Requires Node.js with the `docx` package, LibreOffice (`soffice`) and poppler-utils.

```bash
python book/make_figures.py                  # regenerate the 14 figures
cd book && npm install && npm run build      # interior: contents pages, index, checks
python ../kdp/build_cover.py                 # full-wrap cover sized from the page count
```

Set `ISBN=978-...` in the environment to print an ISBN on the copyright page.

## License

The source code is released under the MIT License (see `LICENSE`). The manuscript, figures and cover
are © Srikanth Cherukupalli, all rights reserved. All datasets are synthetic.
