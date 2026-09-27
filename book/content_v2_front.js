// content_v2_front.js — About This Book, Preface, and new sections for Chapters 1, 2 and 4
const {
  P, H1, H2, H3, Formula, Callout, Bullet, Numbered, SimpleTable, Blank, Figure, FONT,
} = require('./helpers');
const { Paragraph, TextRun, AlignmentType } = require('docx');

const about = [
  H1("About This Book"),
  P("This book is a practitioner's guide to five computational-intelligence methods for enterprise decisions: an adaptive genetic algorithm for supply-network design, multi-objective simulated annealing for trading freight cost against CO₂, particle swarm optimization and a hybrid PSO-GA for multi-product inventory, and Bessel-Fourier descriptors for visual inspection. It closes with a capstone that puts deterministic enterprise calculation and multi-objective search to work on a single business question: where did we lose margin this week that we should not have lost?"),
  P("Every method comes with a working Python implementation, CSV datasets, a case study and a production blueprint. What sets the book apart is how results are reported. Wherever an exact answer or a proven bound exists — exhaustive enumeration, a mixed-integer programming solver, an exact Pareto front, a per-product optimum — the metaheuristic is measured against it. Sometimes the metaheuristic wins; sometimes a textbook solver is the better tool, and the book says so plainly. Chapter 1 opens with a decision guide for exactly that choice."),

  H3("Who this book is for"),
  P("Supply-chain architects, data scientists, ML engineers and technical managers who want both the mathematical grounding to reason about metaheuristics and the code to adapt them to their own problems. A reader comfortable with first-year calculus, basic linear algebra and intermediate Python will find every chapter approachable."),

  H3("How the book is organized"),
  SimpleTable(
    ["Part", "Chapters", "What it covers"],
    [
      ["I  Foundations", "1–2", "Why metaheuristics, when to use MILP instead, notation, and how results are measured"],
      ["II  Mathematical Machinery", "3–4", "A unified metaheuristic framework and the probability needed to compare algorithms fairly"],
      ["III  Adaptive Genetic Optimization", "5–7", "AGOA for supply-network design, measured against enumeration and MILP"],
      ["IV  Multi-Objective Simulated Annealing", "8–9", "Freight cost versus CO₂, with an exact Pareto front as the yardstick"],
      ["V  Swarm Intelligence for Inventory", "10–13", "PSO and hybrid PSO-GA for (Q, r) inventory policies with quantity discounts"],
      ["VI  Bessel Functions for Visual Inspection", "14–15", "Rotation-invariant shape features, tuned with PSO"],
      ["VII  Integration and Deployment", "16–17", "A unified library, benchmarks, tests and a production blueprint"],
      ["VIII  Capstone and Outlook", "18–20", "Margin Leak Finder: deterministic detection and calibrated thresholds; future directions"],
    ],
    [2300, 900, 3640],
  ),
  Blank(),

  H3("How to read it"),
  P("If you have one evening, read Chapter 1 and then the case-study chapter of the method closest to your problem — Chapter 7, 9, 13 or 15. Each algorithm part follows the same arc of theory, implementation and case study, so Parts III to VI can be read in any order. Part II is a reference to return to, although Section 4.7 on comparing algorithms fairly is worth reading before you benchmark anything of your own. The capstone in Part VIII draws on Parts IV and VII."),

  H3("The companion code"),
  P("All code is in the companion repository at github.com/crsrikanth-07/computational-intelligence-enterprise. It needs Python 3.10 or newer and five scientific packages (Appendix A). Three commands reproduce everything in the book: python -m poc.run_all_demos runs every method once; python -m poc.benchmarks reruns every multi-seed comparison (about four minutes on a laptop); and python -m pytest checks the results against their exact answers. Every figure is generated from the same code by python book/make_figures.py."),

  H3("Conventions"),
  P("Money is in US dollars. All datasets are synthetic and generated from fixed seeds, so every number can be reproduced; company, supplier, customer and product names are invented. Wall times were measured on a single laptop core and will vary with hardware. Where the capstone uses an accounting-style calculation, it follows a demonstration policy — not customer-approved accounting logic — and says so."),
];

const preface = [
  H1("Preface"),
  P("The five preprints behind this book were written during 2024 as I explored a question that kept coming up in my day-to-day work as an SAP architect: when the classical textbook solvers fall over on a real enterprise supply chain, what do we actually reach for instead?"),
  P("Linear and mixed-integer programming are elegant, and — as this book shows more than once — they are often the right answer. But real problems keep leaving their territory: costs that jump at price breaks, objectives that pull in opposite directions, fitness functions that are simulations rather than formulas. Metaheuristics — genetic algorithms, simulated annealing, swarm optimization — sit in that gap. They scale, they tolerate noise, and they make few assumptions about the structure of a problem. The price is tuning, and a willingness to accept “good enough” instead of “provably optimal.”"),
  P("This book collects my findings on five such methods, each of which earned its place by surviving a real project. The adaptive genetic algorithm emerged from a supply-network redesign; the multi-objective simulated annealing study from a carbon-accounting engagement in which transport cost and emissions had to be traded off; the PSO and hybrid PSO-GA work from multi-product inventory planning; and the Bessel-Fourier descriptor work from an image-recognition project. The capstone, the Margin Leak Finder, comes from more recent work on trustworthy enterprise analytics, where the rule is simple: code computes the money, and AI only explains it."),
  P("While preparing the book I re-ran every experiment against an exact answer or a proven bound wherever one existed. That discipline changed several of my own conclusions. A well-tuned fixed-rate genetic algorithm matched the adaptive one on the case-study network. A free mixed-integer solver beat both on a larger linear network. And a descriptor that looked weak turned out to need only a better scale parameter. The book reports all of it, because knowing when not to use a method is as valuable as knowing how to use it."),
  P("The working code matters. Every formula in these pages has a corresponding implementation in the companion repository, and every number quoted in a case study is produced by that code from a fixed seed. If something breaks, it breaks in a way you can step through and fix."),
  P("I owe thanks to the colleagues and practitioners whose practical problems shaped these algorithms, and to the academic authors whose foundational work — cited in Appendix C — made mine possible."),
  new Paragraph({ spacing: { before: 360 }, alignment: AlignmentType.RIGHT, children: [
    new TextRun({ text: "Srikanth Cherukupalli", font: FONT, size: 22, italics: true }),
  ]}),
  new Paragraph({ alignment: AlignmentType.RIGHT, children: [
    new TextRun({ text: "Providence, RI", font: FONT, size: 22, italics: true }),
  ]}),
];

const ch1_decision = [
  H2("1.5 MILP or metaheuristic? A decision guide"),
  P("Before choosing among the methods in this book, ask whether you need a metaheuristic at all. Mixed-integer linear programming (MILP) has one decisive advantage: when it finishes, it proves that its answer is optimal, and when it is stopped early it still reports a bound on how far from optimal its best answer can be. Modern open-source solvers such as HiGHS, which ships with SciPy, solve many enterprise-sized linear models in seconds."),
  P("That is not hypothetical. In Chapter 7 a network with 20 suppliers, 6 plants and 40 distribution centers and a linear cost model is solved to proven optimality by HiGHS in under a second, while the adaptive genetic algorithm — given more time — averages 14% above that optimum. On a model like that, the metaheuristic is the wrong tool."),
  P("Metaheuristics earn their place when the model leaves MILP territory, or when you need something a single optimal point cannot give you:"),
  Bullet("The objective is a black box — a simulation, a pricing engine or a service-level model that you can evaluate but not write as linear constraints."),
  Bullet("Costs are discontinuous or strongly non-linear — quantity discounts, tariff schedules, economies of scale — and linearizing them would bloat or distort the model (Chapter 13)."),
  Bullet("You want the whole trade-off between competing objectives rather than one weighted compromise (Chapter 9)."),
  Bullet("The model is linear but too large to solve or bound in your time budget. Run the solver with a time limit anyway, and use its bound as the yardstick for any heuristic."),
  ...Figure("fig_1_1_decision_guide.png", "Figure 1.1 — Choosing between exact solvers and metaheuristics."),
  Callout("The rule this book follows", "Every metaheuristic result in this book is reported next to an exact answer or a proven bound whenever one exists — exhaustive enumeration, a MILP solver, an exact Pareto front or a per-product optimum. Section 2.6 describes the measures used."),
  Blank(),
];

const roadAhead = "The remainder of Part I (Chapter 2) establishes the vocabulary used throughout the book — decision variables, fitness landscapes, convergence and multi-objective quality measures — and explains how results are reported. Part II supplies the mathematical machinery: a unified framework for metaheuristics and the probability needed to compare them fairly. Parts III to VI each cover one method in depth, following the same arc of theory, implementation and case study. Part VII packages the methods behind a common library, benchmark suite and deployment blueprint, and Part VIII closes with a capstone — the Margin Leak Finder — and with directions for future work.";

const ch2_measure = [
  H2("2.6 How this book reports results"),
  P("Metaheuristics are stochastic: two runs with different seeds can return different answers, and a single lucky run proves nothing. Throughout the book, results are therefore reported with four conventions."),
  H3("Optimality gap"),
  Formula("gap = ( f(x̂) − f* ) / f* × 100%"),
  P("Here f(x̂) is the cost an algorithm found and f* is the exact optimum or, when only a bound is available, the solver's bound. A gap of 0.00% means the run found a proven optimum."),
  H3("Success rate over seeds"),
  P("Each comparison is repeated over independent seeds — 20 in most tables — and reports how many runs reached the optimum or came within a stated tolerance, together with the mean and worst gap. Section 4.7 explains how far a success rate over 20 runs can be trusted."),
  H3("Equal budgets"),
  P("Algorithms are compared at equal numbers of fitness evaluations, not equal iterations. The hybrid PSO-GA of Chapter 12 evaluates two populations per iteration; comparing it with plain PSO at equal iterations would hand it twice the budget."),
  H3("Hypervolume for trade-off curves"),
  P("For two-objective problems the quality of an approximate Pareto front is its hypervolume — the area it dominates up to a reference point — as a percentage of the exact front's hypervolume. 100% means the whole trade-off was recovered."),
  P("The exact references used in the book are:"),
  SimpleTable(
    ["Chapter", "Problem", "Exact reference"],
    [
      ["7", "Supply-network design, 5 / 3 / 6", "Enumeration of 177,147 designs, confirmed by MILP"],
      ["7", "Supply-network design, 20 / 6 / 40", "MILP (HiGHS), proven optimal"],
      ["9", "Freight cost versus CO₂", "Exact Pareto front by merging lanes"],
      ["11, 13", "(Q, r) inventory, with and without discounts", "Exact per-product optimization"],
      ["15", "Shape classification", "Accuracy on held-out images and fresh datasets"],
      ["18", "Margin-leak detection", "Golden catalogue of exact expected results"],
      ["19", "Threshold calibration", "Exact Pareto front by decomposition"],
    ],
    [1000, 2900, 2940],
  ),
  Blank(),
];

const ch4_fair = [
  H2("4.7 Comparing algorithms fairly"),
  P("Section 4.5 showed that a metaheuristic run is a random experiment. Comparing two algorithms is therefore a statistics problem, and four habits keep the comparison honest."),
  Numbered("Use many seeds and report distributions. A table of one run per algorithm measures luck. This book uses 20 seeds for most comparisons and reports the success rate, mean gap and worst gap."),
  Numbered("Pair the seeds. Run every algorithm on the same instance with the same list of seeds, so that differences are not an artifact of which starting points each algorithm happened to draw."),
  Numbered("Equalize the budget in fitness evaluations. Iterations are not comparable across algorithms that evaluate different numbers of points per iteration."),
  Numbered("Never tune on the test set. When parameters are tuned — descriptor settings in Chapter 15, detection thresholds in Chapter 19 — tune on training data and report performance once, on held-out data."),
  P("How far can a success rate over 20 runs be trusted? A success count k out of n runs is a binomial observation. The Wilson score interval (Wilson, 1927) gives a reliable 95% range even for small n:"),
  Formula([
    "p̂ = k / n,   centre = ( p̂ + z²/2n ) / ( 1 + z²/n )",
    "half-width = z · √( p̂(1 − p̂)/n + z²/4n² ) / ( 1 + z²/n ),   z = 1.96",
  ]),
  P("For the adaptive genetic algorithm in Chapter 7, 18 successes out of 20 give an interval of about 70% to 97%; the fixed-rate baseline's 6 out of 20 give about 15% to 52%. The intervals do not overlap, so the difference is real rather than luck. Two algorithms that score 16 and 18 out of 20, by contrast, cannot be told apart with 20 runs: their intervals, 58–92% and 70–97%, overlap almost entirely."),
];

module.exports = { about, preface, ch1_decision, roadAhead, ch2_measure, ch4_fair };
