// content_part_a.js — front matter, Part I (Foundations), Part III (AGOA), Part IV (SA)
const {
  P, PRich, H1, H2, H3, H4,
  Formula, CodeBlock, Callout,
  Bullet, Numbered, SimpleTable,
  Blank, HR, FONT, ACCENT,
} = require('./helpers');
const { Paragraph, TextRun, AlignmentType, PageBreak, BorderStyle } = require('docx');

// ===========================================================================
// COVER / TITLE PAGE
// ===========================================================================
const cover = [
  new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "COMPUTATIONAL INTELLIGENCE", font: FONT, size: 56, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 120 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "FOR ENTERPRISE SYSTEMS", font: FONT, size: 56, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 240, after: 600 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Advanced Optimization Algorithms with Working Prototypes", font: FONT, size: 28, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 1200, after: 120 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "AGOA  •  Simulated Annealing  •  PSO  •  Hybrid PSO-GA  •  Bessel-Fourier Descriptors", font: FONT, size: 22, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 2400, after: 120 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Srikanth Cherukupalli", font: FONT, size: 28, bold: true }),
  ]}),
  new Paragraph({ spacing: { before: 40, after: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "", font: FONT, size: 22, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ children: [new PageBreak()] }),
];

// ===========================================================================
// COPYRIGHT / ABOUT
// ===========================================================================
const copyright = [
  H2("About This Book"),
  P("This volume consolidates five original research preprints authored by Srikanth Cherukupalli into a single, self-contained technical manual. Every algorithm presented here — AGOA, Multi-Objective Simulated Annealing, Particle Swarm Optimization, Hybrid PSO-GA, and Bessel-Fourier Descriptors — is accompanied by a working Python proof-of-concept, a clear mathematical formulation, and a blueprint for moving the code toward production."),
  P("The source code accompanying this book is organized as a small Python package under the poc/ directory. A unified runner (poc/run_all_demos.py) exercises every algorithm and prints a comparative results table. All datasets used in the demos are synthetic and generated deterministically from fixed seeds, so every reported number in this book can be reproduced exactly."),
  Blank(),
  H3("Intended Audience"),
  P("The book is written for practitioners — supply-chain architects, data scientists, ML engineers, and technical managers — who want both the mathematical grounding to reason about these algorithms and the code to adapt them to their own problems. A reader comfortable with first-year calculus, basic linear algebra, and intermediate Python will find every chapter approachable."),
  H3("How to Read This Book"),
  P("Each algorithm-centric part follows the same three-act structure: (1) a Theory chapter that motivates the method and develops its equations; (2) an Implementation chapter that walks through the reference code; and (3) a Case Study or Deployment Blueprint that connects the algorithm to a realistic enterprise scenario. Readers pressed for time can read only the Theory + Case Study chapters; readers who want to reproduce or extend the POCs should additionally read the Implementation chapters with the source code open."),
  Blank(),
  P("© 2024–2026 Srikanth Cherukupalli. Research preprints reproduced and extended with permission of the author. Code released under a permissive license for educational and research use.", { size: 18, italic: true, color: "707070" }),
];

// ===========================================================================
// TOC — manually populated so it displays immediately in Word (no "Update Field" needed)
// ===========================================================================

// Helper: build a TOC line with dot leader and page-number placeholder
const tocPart = (label) => new Paragraph({
  spacing: { before: 280, after: 100 },
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
  children: [new TextRun({ text: label, font: FONT, size: 24, bold: true, color: ACCENT, characterSpacing: 60 })],
});

const tocChapter = (label) => new Paragraph({
  spacing: { before: 80, after: 40 },
  indent: { left: 240 },
  children: [new TextRun({ text: label, font: FONT, size: 22, bold: true, color: "2F2F2F" })],
});

const tocSection = (label) => new Paragraph({
  spacing: { before: 0, after: 30 },
  indent: { left: 720 },
  children: [new TextRun({ text: label, font: FONT, size: 20, color: "595959" })],
});

const tocFront = (label) => new Paragraph({
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text: label, font: FONT, size: 22, bold: true, color: "2F2F2F" })],
});

const toc = [
  H1("Table of Contents"),

  tocFront("About This Book"),
  tocFront("Preface"),

  tocPart("PART I  —  FOUNDATIONS"),
  tocChapter("Chapter 1  —  The Optimization Landscape in Modern Enterprise Systems"),
  tocSection("1.1 Why optimization, and why now"),
  tocSection("1.2 A working taxonomy"),
  tocSection("1.3 When to reach for each algorithm"),
  tocSection("1.4 What this book will not do"),
  tocSection("1.5 The road ahead"),
  tocChapter("Chapter 2  —  Mathematical Preliminaries and Notation"),
  tocSection("2.1 Decision variables, objective functions, and constraints"),
  tocSection("2.2 Fitness landscapes"),
  tocSection("2.3 Convergence and stopping criteria"),
  tocSection("2.4 Measuring quality in multi-objective problems"),
  tocSection("2.5 Notation summary"),
  tocChapter("Chapter 3  —  Metaheuristics: A Unified Framework"),
  tocSection("3.1 What is a metaheuristic?"),
  tocSection("3.2 The exploration-exploitation trade-off"),
  tocSection("3.3 Common building blocks"),
  tocSection("3.4 Single-point versus population-based methods"),
  tocSection("3.5 The No Free Lunch theorem"),
  tocSection("3.6 What convergence means (and does not mean)"),
  tocSection("3.7 Why hybrids work"),
  tocSection("3.8 A reading map for the rest of the book"),
  tocChapter("Chapter 4  —  Stochastic Foundations: A Working Primer"),
  tocSection("4.1 Random variables and distributions"),
  tocSection("4.2 Independence and the Central Limit Theorem"),
  tocSection("4.3 Markov chains"),
  tocSection("4.4 Random walks and diffusion"),
  tocSection("4.5 Monte Carlo estimation"),
  tocSection("4.6 Bringing it back to the algorithms"),
  tocSection("4.7 A glance at stochastic calculus proper"),
  tocSection("4.8 What the practitioner actually needs to remember"),

  tocPart("PART II  —  ADAPTIVE GENETIC OPTIMIZATION"),
  tocChapter("Chapter 5  —  AGOA: Theory and Adaptive Mechanisms"),
  tocSection("5.1 The textbook genetic algorithm in one page"),
  tocSection("5.2 Why static GA parameters fail on supply networks"),
  tocSection("5.3 The AGOA algorithm"),
  tocSection("5.4 Objective, fitness, and selection — the math"),
  tocSection("5.5 What makes a chromosome in this problem"),
  tocChapter("Chapter 6  —  Implementing AGOA for Supply Network Planning"),
  tocSection("6.1 Code structure"),
  tocSection("6.2 Fitness function in Python"),
  tocSection("6.3 Selection, crossover, mutation"),
  tocSection("6.4 The adaptive update in detail"),
  tocSection("6.5 A complete run"),
  tocChapter("Chapter 7  —  AGOA Case Study: Mid-Sized Consumer Goods Supply Network"),
  tocSection("7.1 The scenario"),
  tocSection("7.2 Modeling the network"),
  tocSection("7.3 Results"),
  tocSection("7.4 Comparison with a fixed-parameter GA"),
  tocSection("7.5 Production blueprint"),

  tocPart("PART III  —  MULTI-OBJECTIVE SIMULATED ANNEALING"),
  tocChapter("Chapter 8  —  Simulated Annealing and the Pareto Front"),
  tocSection("8.1 The metallurgy metaphor"),
  tocSection("8.2 The single-objective algorithm"),
  tocSection("8.3 Why SA generalizes cleanly to multiple objectives"),
  tocSection("8.4 The transportation-emissions problem"),
  tocSection("8.5 Hyperparameters and convergence"),
  tocChapter("Chapter 9  —  Implementing MOSA and the Weight-Sweep Frontier"),
  tocSection("9.1 Neighbour generation"),
  tocSection("9.2 Weighted-sum SA"),
  tocSection("9.3 Archive management for MOSA"),
  tocSection("9.4 Weight-sweep for a robust Pareto front"),
  tocSection("9.5 Sample output and interpretation"),
  tocSection("9.6 Production blueprint"),

  tocPart("PART IV  —  SWARM INTELLIGENCE FOR INVENTORY"),
  tocChapter("Chapter 10  —  Particle Swarm Optimization: Fundamentals"),
  tocSection("10.1 The swarm metaphor"),
  tocSection("10.2 The velocity and position update"),
  tocSection("10.3 The inventory-management problem"),
  tocSection("10.4 Velocity clamping and boundary handling"),
  tocSection("10.5 When PSO struggles"),
  tocChapter("Chapter 11  —  PSO POC: Implementation Walk-Through"),
  tocSection("11.1 The InventoryProblem class"),
  tocSection("11.2 PSOConfig — one dataclass, one place to tune"),
  tocSection("11.3 The core loop"),
  tocSection("11.4 Running the demo"),
  tocSection("11.5 A harder variant: capital constraints"),
  tocChapter("Chapter 12  —  Hybrid PSO-GA: Design and Rationale"),
  tocSection("12.1 Why hybridize"),
  tocSection("12.2 The algorithm"),
  tocSection("12.3 BLX-α crossover and Gaussian mutation"),
  tocSection("12.4 Why cross-pollination, not merging"),
  tocSection("12.5 Parameter count and tuning"),
  tocChapter("Chapter 13  —  Hybrid PSO-GA Case Study and Comparison"),
  tocSection("13.1 The case study"),
  tocSection("13.2 Baseline comparison"),
  tocSection("13.3 The harder variant: capital constraint"),
  tocSection("13.4 Interpreting the results"),
  tocSection("13.5 Production blueprint"),

  tocPart("PART V  —  BESSEL FUNCTIONS FOR IMAGE RECOGNITION"),
  tocChapter("Chapter 14  —  Bessel-Fourier Descriptors: Theory"),
  tocSection("14.1 Why this chapter belongs here"),
  tocSection("14.2 Bessel functions of the first kind"),
  tocSection("14.3 From image to radial profile"),
  tocSection("14.4 Bessel-Fourier coefficients"),
  tocSection("14.5 The scale parameter λ"),
  tocSection("14.6 Normalization and invariance"),
  tocSection("14.7 Limitations"),
  tocChapter("Chapter 15  —  BFD POC: A Shape-Classification Pipeline"),
  tocSection("15.1 The pipeline"),
  tocSection("15.2 Computing the radial profile"),
  tocSection("15.3 Computing the BFD coefficients"),
  tocSection("15.4 The synthetic dataset"),
  tocSection("15.5 The classifier and results"),
  tocSection("15.6 Comparison with a CNN"),
  tocSection("15.7 Production blueprint"),

  tocPart("PART VI  —  INTEGRATION AND DEPLOYMENT"),
  tocChapter("Chapter 16  —  A Unified Optimization Library"),
  tocSection("16.1 Why a unified library"),
  tocSection("16.2 The RunReport contract"),
  tocSection("16.3 Dataset generators"),
  tocSection("16.4 Directory layout"),
  tocSection("16.5 How the unified demo works"),
  tocChapter("Chapter 17  —  From POC to Production: Deployment Blueprint"),
  tocSection("17.1 The reference architecture"),
  tocSection("17.2 Service-layer contract"),
  tocSection("17.3 Compute-and-memory budget"),
  tocSection("17.4 Observability"),
  tocSection("17.5 Security and data handling"),
  tocSection("17.6 Testing and rollout"),
  tocChapter("Chapter 18  —  Future Directions and Research Agenda"),
  tocSection("18.1 Predictable extensions"),
  tocSection("18.2 Integration with learned models"),
  tocSection("18.3 Reinforcement learning parallels"),
  tocSection("18.4 Sustainability as a first-class objective"),
  tocSection("18.5 Closing thoughts"),

  tocPart("APPENDICES"),
  tocChapter("Appendix A  —  Running the POCs"),
  tocSection("A.1 Requirements"),
  tocSection("A.2 Directory layout"),
  tocSection("A.3 Running individual demos"),
  tocSection("A.4 Running the unified demo"),
  tocSection("A.5 Reproducibility"),
  tocChapter("Appendix B  —  Dataset Specifications"),
  tocSection("B.1 make_inventory_dataset(n_products, seed)"),
  tocSection("B.2 make_transportation_network(n_locations, seed)"),
  tocSection("B.3 make_supply_network(n_suppliers, n_plants, n_dcs, seed)"),
  tocSection("B.4 Synthetic shape dataset"),
  tocChapter("Appendix C  —  References and Further Reading"),
  tocSection("C.1 Original preprints consolidated in this book"),
  tocSection("C.2 Foundational works"),
  tocSection("C.3 Textbooks for deeper reading"),
  tocSection("C.4 Online resources"),
  tocChapter("Appendix D  —  Worked Examples with CSV Data and Python"),
  tocSection("D.1 AGOA — three-tier supply network"),
  tocSection("D.2 Multi-Objective SA — cost versus emissions"),
  tocSection("D.3 PSO — multi-product inventory"),
  tocSection("D.4 Hybrid PSO-GA versus pure PSO"),
  tocSection("D.5 Bessel-Fourier Descriptors — shape classification"),
  tocSection("D.6 Running every worked example"),
  tocChapter("Appendix E  —  Questions, Exercises, and Projects"),
  tocSection("E.1 Part I — Foundations"),
  tocSection("E.2 Part II — Adaptive Genetic Optimization"),
  tocSection("E.3 Part III — Multi-Objective Simulated Annealing"),
  tocSection("E.4 Part IV — Swarm Intelligence for Inventory"),
  tocSection("E.5 Part V — Bessel Functions for Image Recognition"),
  tocSection("E.6 Part VI — Integration and Deployment"),
  tocSection("E.7 Capstone Project"),
  tocSection("E.8 Selected Solutions"),

  new Paragraph({ spacing: { before: 400, after: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "— End of contents —", font: FONT, size: 18, italics: true, color: "7FA7D9" }),
  ]}),
];

// ===========================================================================
// PREFACE
// ===========================================================================
const preface = [
  H1("Preface"),
  P("The five preprints that form the backbone of this book were written over the course of 2024 as I explored a simple, recurring question in my day-to-day work: when the classical textbook solvers fall over on a real enterprise supply chain, what do we actually reach for instead?"),
  P("Linear programming is elegant but collapses the moment the cost function becomes non-linear or the decision space becomes combinatorial. Pure greedy heuristics give answers fast, but the answers are often wrong in ways the business only discovers a quarter later. Metaheuristics — genetic algorithms, simulated annealing, swarm optimization — sit in a sweet spot: they scale, they handle noise, and they make very few assumptions about the structure of the problem. The trade-off is that they require careful tuning and a willingness to accept \"good enough\" instead of \"provably optimal.\""),
  P("This book collects my findings on five such methods, each of which earned its place in the collection by surviving a real project. The AGOA variant of the genetic algorithm emerged from a supply-network redesign where mutation rates needed to adapt to disruption events. The multi-objective Simulated Annealing study came out of a carbon-accounting engagement where transport cost and emissions needed to be Pareto-traded. The PSO and Hybrid PSO-GA work addressed the now-familiar problem of multi-product inventory under volatile demand. And the Bessel-Fourier Descriptor paper is the odd one out — an image-recognition project — included here because it shares the same philosophical bones: solve a high-dimensional problem by projecting onto a carefully chosen basis."),
  P("What ties the five together, and what I hope this book transmits, is the pattern. Every chapter is organized around the same questions: what does the algorithm actually do, what math makes it work, how do you implement it cleanly in Python, and how do you stand it up in front of real data without the demo collapsing the first time a constraint changes."),
  P("The working code matters. Every formula in these pages has a corresponding implementation in the accompanying poc/ directory, and every implementation has been run end-to-end to produce the numbers quoted in the case studies. You can clone the code, type python -m poc.run_all_demos, and see all five algorithms run within a minute on a laptop. If something breaks, it breaks in a way you can step through and fix."),
  P("I owe thanks to my colleagues for the practical problems that shaped these algorithms, and to the academic authors whose foundational work — cited throughout — made mine possible."),
  new Paragraph({ spacing: { before: 360 }, alignment: AlignmentType.RIGHT, children: [
    new TextRun({ text: "Srikanth Cherukupalli", font: FONT, size: 22, italics: true }),
  ]}),
  new Paragraph({ alignment: AlignmentType.RIGHT, children: [
    new TextRun({ text: "Providence, RI", font: FONT, size: 22, italics: true }),
  ]}),
];

// ===========================================================================
// PART I — FOUNDATIONS
// ===========================================================================
const partI = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART I", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Foundations", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 1 – 2", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 1 -----
const ch1 = [
  H1("Chapter 1 — The Optimization Landscape in Modern Enterprise Systems"),

  H2("1.1 Why optimization, and why now"),
  P("Every enterprise decision is, at some level, an optimization problem. How much of each product to hold in each warehouse. Which supplier to route each purchase order through. Which delivery mode to use for each lane of a multi-echelon transport network. Which operating plan minimizes carbon emissions while meeting a service-level agreement. In every case, a decision-maker is choosing among an enormous number of feasible alternatives, weighing multiple objectives, and hoping to land on something close to best."),
  P("For decades, the default tool for these problems was mathematical programming — linear programming, integer programming, and their mixed-integer generalizations — solved by Simplex, Branch-and-Bound, or interior-point solvers. When the problem fits into that mold, the approach is unmatched: it yields a provably optimal solution with rigorous sensitivity analysis. The difficulty is that modern enterprise problems rarely fit. Objectives are non-linear, some decisions are binary (open a plant or don't), demand is stochastic, and the business wants answers within seconds rather than hours."),
  P("This book is about the tools that have become essential when the classical mold breaks down: metaheuristic algorithms. These methods don't guarantee optimality, but they scale to problems with thousands of decision variables, they handle non-convexity gracefully, and they can be tuned to trade solution quality for wall-clock time along a smooth curve."),

  H2("1.2 A working taxonomy"),
  P("The algorithms covered in this book fall into four broad families, summarized in the table below."),
  Blank(),
  SimpleTable(
    ["Family", "Representative method (in this book)", "Natural strengths", "Natural weaknesses"],
    [
      ["Evolutionary", "AGOA (adaptive genetic algorithm)", "Discrete/combinatorial problems; escapes local optima via crossover", "Tuning mutation/crossover rates; slow on purely continuous problems"],
      ["Trajectory-based", "Simulated Annealing", "Simple to implement; robust on noisy objectives; multi-objective via Pareto archives", "Requires careful cooling schedule; single trajectory may miss disjoint basins"],
      ["Swarm-based", "Particle Swarm Optimization", "Very fast on continuous problems; small parameter count", "Premature convergence; struggles with highly multi-modal landscapes"],
      ["Hybrid", "Hybrid PSO-GA", "Combines global exploration of GA with local refinement of PSO", "More parameters; higher per-iteration cost"],
    ],
    [1600, 2800, 2500, 2460],
  ),
  Blank(),
  P("A fifth chapter in this book covers Bessel-Fourier Descriptors, which sit outside this taxonomy. They are not an optimizer but a feature-extraction technique for image recognition. They are included because they share the same philosophical bones as the optimizers: solve a high-dimensional problem by projecting onto a carefully chosen basis that compresses the essential information."),

  H2("1.3 When to reach for each algorithm"),
  P("Choosing the right metaheuristic is less about mathematical purity and more about the shape of the decision space. The following heuristics, distilled from the case studies in later chapters, will serve most readers well."),
  Blank(),
  Bullet("Use AGOA when the decision variables are discrete or mixed-integer and the objective involves combinatorial structure — for example, choosing which plants to open and which supplier feeds which plant."),
  Bullet("Use Simulated Annealing when the objective is noisy, non-differentiable, or multi-objective and you need a simple, robust solver that requires almost no problem-specific tuning."),
  Bullet("Use Particle Swarm Optimization when the decision variables are continuous and the fitness function is relatively smooth — classic inventory order-quantity problems fall squarely here."),
  Bullet("Use a hybrid algorithm when neither family alone escapes local optima fast enough, or when problem instances vary in character across the business."),

  H2("1.4 What this book will not do"),
  P("This book does not attempt to replicate the rigorous convergence theory of Simplex, Branch-and-Bound, or cutting-plane methods. Readers who need provable guarantees for regulated decision contexts — nuclear fuel scheduling, capital reserves, tax accounting — should consult a linear and integer programming textbook, not this one. The book also does not cover reinforcement learning, constraint logic programming, or pure combinatorial optimization methods such as the Hungarian algorithm, although it does note at several points where those approaches might complement the methods we discuss."),

  ...require("./content_v2_front").ch1_decision,
  H2("1.6 The road ahead"),
  P(require("./content_v2_front").roadAhead),
];

// ----- Chapter 2 -----
const ch2 = [
  H1("Chapter 2 — Mathematical Preliminaries and Notation"),

  H2("2.1 Decision variables, objective functions, and constraints"),
  P("An optimization problem is specified by three ingredients: a vector of decision variables, one or more objective functions, and a set of constraints. Throughout the book we write the decision vector as x = (x₁, x₂, …, xₙ) and denote the feasible region — the set of x satisfying all constraints — as X. The single-objective form of the problem is then simply:"),
  Formula("minimize   f(x)            subject to   x ∈ X"),
  P("The multi-objective form replaces the scalar f by a vector of k objectives, which cannot in general be simultaneously minimized:"),
  Formula("minimize   ( f₁(x), f₂(x), …, f_k(x) )    subject to   x ∈ X"),
  P("Multi-objective problems do not have a single optimum. They have a Pareto front — a set of solutions each of which cannot be improved in one objective without worsening another. Chapter 9 develops this carefully for the transportation cost vs. CO₂ trade-off."),

  H2("2.2 Fitness landscapes"),
  P("Think of f : X → ℝ as a surface over the feasible region. Points where f is locally minimum are valleys; points where f is locally maximum are peaks. A globally optimal solution sits at the deepest valley, but most metaheuristic algorithms are trying to find it while only being able to see one small patch of the surface at a time. Three features of the landscape drive algorithm choice:"),
  Blank(),
  Bullet("Ruggedness — how many local minima separate typical starting points from the global minimum. Rugged landscapes punish greedy methods and reward methods with exploration mechanisms such as mutation or high-temperature moves."),
  Bullet("Deception — whether the coarse structure of the fitness (what you see from a distance) points toward or away from the true optimum. Deceptive landscapes can trap methods that trust coarse structure, such as gradient descent or pure exploitation."),
  Bullet("Neutrality — regions where f is flat or nearly flat. These stall algorithms that rely on fitness differences to drive progress."),

  H2("2.3 Convergence and stopping criteria"),
  P("Every algorithm in this book produces a sequence of solutions x⁽⁰⁾, x⁽¹⁾, x⁽²⁾, … and a corresponding sequence of best-so-far fitness values. Plotting the best-so-far fitness against iteration number yields a convergence curve: monotone non-increasing, typically a rapid early drop followed by a long tail of small improvements. Every POC in this book records and exposes this curve via the RunReport.convergence_trace field."),
  P("Three stopping criteria are used throughout:"),
  Numbered("A fixed iteration budget (simplest; used in all demos)."),
  Numbered("A stagnation window — stop if no improvement has been seen in the last K iterations. Useful when compute budget matters more than a fixed number of steps."),
  Numbered("A target fitness — stop once the best-so-far drops below a threshold known a priori. Rarely applicable in practice because the target is usually unknown."),

  H2("2.4 Measuring quality in multi-objective problems"),
  P("Because multi-objective problems have no single best solution, we measure algorithms by how well they approximate the true Pareto front. Three metrics recur in the literature and in this book:"),
  Blank(),
  Bullet("Hypervolume (HV) — the volume of objective space dominated by the computed front, measured from a reference point worse than any solution. Larger is better."),
  Bullet("Inverted Generational Distance (IGD) — the average distance from each point on the true front to the nearest point on the computed front. Smaller is better. Requires knowledge of the true front, usually from a much longer run."),
  Bullet("Spread — how well distributed the computed front is along the true front. Avoids clustering."),
  P("Chapter 9 demonstrates these measures on a two-objective transportation problem."),

  H2("2.5 Notation summary"),
  SimpleTable(
    ["Symbol", "Meaning"],
    [
      ["x", "Decision vector (solution)"],
      ["X", "Feasible region"],
      ["f(x)", "Scalar objective / fitness"],
      ["fᵢ(x)", "The i-th of k objectives"],
      ["n", "Number of decision variables"],
      ["N", "Population / swarm / archive size"],
      ["T", "Temperature (simulated annealing)"],
      ["α", "Cooling rate (SA) or learning coefficient (PSO)"],
      ["ω", "Inertia weight (PSO)"],
      ["c₁, c₂", "Cognitive / social coefficients (PSO)"],
      ["pᵢ", "Personal best of particle i (PSO)"],
      ["g", "Global best across the swarm"],
      ["Jₙ(x)", "Bessel function of the first kind, order n"],
      ["λ", "Scaling parameter for Bessel integration"],
    ],
    [2000, 7360],
  ),
  Blank(),
  P("Where a chapter introduces notation that does not appear above, the symbol is defined at the point of first use."),
  ...require("./content_v2_front").ch2_measure,
];

// ===========================================================================
// PART III — AGOA
// ===========================================================================
const partII = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART III", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Adaptive Genetic Optimization", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 5 – 7", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 5 -----
const ch3 = [
  H1("Chapter 5 — AGOA: Theory and Adaptive Mechanisms"),

  H2("5.1 The textbook genetic algorithm in one page"),
  P("A standard genetic algorithm (GA) maintains a population of candidate solutions — chromosomes — and evolves them over generations via three operators inspired by biological evolution: selection, crossover, and mutation. The expected fitness of the population increases over time because fitter chromosomes are more likely to be selected as parents of the next generation."),
  P("The canonical single-generation step, starting from a population P of size N with fitness values f(P), is:"),
  Numbered("Selection — draw N parents from P, with probability weighted toward higher fitness (for maximization) or lower fitness (for minimization). Tournament selection, used throughout this book, picks the best of a random group of size k."),
  Numbered("Crossover — pair the parents and, with probability p_c, combine their genes to produce children. Two-point crossover swaps a middle segment between parents."),
  Numbered("Mutation — with probability p_m, randomly perturb each gene of each child."),
  Numbered("Replacement — replace P by the new children. Elitism preserves the best k solutions unconditionally."),
  P("The classical formulation of the selection probability for solution i under fitness-proportionate selection is:"),
  Formula("P(i) = f(i) / Σⱼ₌₁ᴺ f(j)"),
  P("Throughout the book we will use tournament selection in preference to fitness-proportionate selection because it is scale-invariant and works well without requiring positive fitness values."),

  H2("5.2 Why static GA parameters fail on supply networks"),
  P("The classical GA has two parameters that matter enormously — the crossover rate p_c and the mutation rate p_m — and both are traditionally fixed for the entire run. On real supply-network problems, this is a trap. Early in the run, a high mutation rate is helpful because the population is diverse and exploration dominates. Late in the run, a high mutation rate is harmful because it destroys the fine tuning of good solutions. The reverse is true for crossover: low early, higher later."),
  P("The adaptive variant — AGOA — addresses this directly by tying mutation and crossover rates to two measurable properties of the run in progress:"),
  Blank(),
  Bullet("Population diversity — a measure of how many distinct values appear at each gene position across the population. Low diversity signals that the population has converged, and additional mutation is needed to escape."),
  Bullet("Stagnation — how many consecutive generations have passed without a new best-so-far. Long stagnation also signals that mutation should rise."),

  H2("5.3 The AGOA algorithm"),
  P("AGOA's population-loop mirrors a standard GA with three additions, highlighted in italics below."),
  CodeBlock(
`Initialize population P of size N uniformly at random
Evaluate f(P)
best_so_far ← min(f(P));  stagnation ← 0
for generation g = 1 … G:
    P_new ← top-k elite copies of P
    while |P_new| < N:
        p1, p2 ← tournament_select(P, f, k)
        if rand() < p_c:  c1, c2 ← crossover(p1, p2)
        else:              c1, c2 ← p1, p2
        c1 ← mutate(c1, p_m);  c2 ← mutate(c2, p_m)
        P_new ← P_new ∪ {c1, c2}
    P ← P_new;  evaluate f(P)
    if min(f(P)) < best_so_far:
        best_so_far ← min(f(P));  stagnation ← 0
    else:
        stagnation ← stagnation + 1
    # ---- ADAPTIVE UPDATE ----------------------------------------------
    diversity ← mean over genes of (unique_values / N)
    p_m ← clip( p_m_base · (1 + κ_div · (0.5 − diversity)) , p_m_min, p_m_max )
    if stagnation > W:
        p_m ← p_m · (1 + κ_stag · log(1 + stagnation − W))
    p_c ← clip( p_c_base − 0.02 · max(0, stagnation − 5) , 0.4, 0.95 )
return best_so_far solution`
  ),
  P("The key adaptive rule is the mutation-rate update. When diversity falls below 0.5, mutation rate is pushed upward by a factor controlled by κ_div. When stagnation exceeds a window W, mutation is pushed even higher by an additional logarithmic term. Crossover rate moves in the opposite direction during stagnation, letting mutation drive exploration while exploitation temporarily pauses."),

  H2("5.4 Objective, fitness, and selection — the math"),
  P("For the three-tier supply-network problem used in this book (suppliers → plants → distribution centers), the objective is a total cost with four components:"),
  Formula([
    "f(x)  =  Σ_{s} Σ_{p}  q_s · c_{sp} · [supplier s → plant p]",
    "      + Σ_{p} Σ_{d}  Q_p · c_{pd} · [plant p → dc d]",
    "      + Σ_{p used}  F_p",
    "      + λ_penalty · ( Σ_p max(0, Q_p − cap_p) + Σ_d max(0, dem_d − in_d) )",
  ]),
  P("The first line accumulates supplier-to-plant shipping cost; the second, plant-to-DC shipping; the third, fixed operating cost of every plant that actually receives flow; the fourth, a soft-penalty for capacity or demand violations. Because AGOA minimizes the objective directly, no inversion is necessary; we simply feed f(x) to the selection operator and take the argmin across the final population."),
  P("In contexts where maximization is natural, the standard fitness inversion is:"),
  Formula("Fitness(x) = 1 / (1 + f(x))"),
  P("This keeps fitness strictly positive, avoids division by zero, and rewards low-f solutions."),

  H2("5.5 What makes a chromosome in this problem"),
  P("The three-tier supply network requires two decisions per supplier (which plant to feed) and one per plant (which DC to ship to). We encode this as a single integer vector of length S + P, where S and P are the supplier and plant counts respectively. The first S entries are plant indices in {0, …, P−1} and the remaining P entries are DC indices in {0, …, D−1}. Crossover swaps contiguous segments, and mutation replaces a gene with a uniformly random legal value."),
  Callout("Design note",
    "Keeping the chromosome short and integer-valued is a deliberate choice. It lets every gene be self-contained — no need to repair invalid offspring — and keeps mutation's effect local. A bit-vector encoding, common in the early GA literature, would be equivalent but harder to read during debugging. Readability matters more than cleverness when the point is to stand up a production POC."),
];

// ----- Chapter 6 -----
const ch4 = [
  H1("Chapter 6 — Implementing AGOA for Supply Network Planning"),

  H2("6.1 Code structure"),
  P("The reference implementation lives in poc/agoa/agoa_scm.py. It is built around three small objects, each of which could be replaced without touching the others. The separation matters because in a real deployment the problem definition almost always drifts — new cost terms, new constraints, new decision variables — and the algorithm core should not have to change with every business request."),
  Blank(),
  SimpleTable(
    ["Object", "Responsibility"],
    [
      ["SupplyNetworkProblem", "Holds the raw network data and exposes total_cost(chromosome) as the fitness function."],
      ["AGOAConfig", "A frozen dataclass holding all hyperparameters (population size, generations, adaptive gains, bounds). Making this a dataclass — not a bag of globals — keeps runs reproducible and swappable."],
      ["run_agoa(problem, config)", "The pure algorithm core. Takes a problem and a config, returns a RunReport. No file I/O, no logging side effects."],
    ],
    [3000, 6360],
  ),

  H2("6.2 Fitness function in Python"),
  P("The heart of the problem is total_cost. It reads a chromosome, decodes it into two assignment vectors, simulates flow from suppliers through plants to distribution centers, and accumulates the four cost components described in Section 5.4."),
  CodeBlock(
`def total_cost(self, chrom):
    sup_to_plant, plant_to_dc = self.decode(chrom)
    sp_cost   = self.data["sp_cost"]           # (S, P)
    pd_cost   = self.data["pd_cost"]           # (P, D)
    sup_cap   = self.data["supplier_capacity"]
    plant_cap = self.data["plant_capacity"]
    dc_demand = self.data["dc_demand"]
    fixed     = self.data["fixed_plant_cost"]

    # Ship all supplier capacity to its assigned plant
    plant_inflow = np.zeros(self.data["n_plants"])
    ship_sp = 0.0
    for s, p in enumerate(sup_to_plant):
        q = sup_cap[s]
        ship_sp += q * sp_cost[s, p]
        plant_inflow[p] += q

    # Ship each plant's inflow to its assigned DC
    dc_inflow = np.zeros(self.data["n_dcs"])
    ship_pd = 0.0
    for p, d in enumerate(plant_to_dc):
        q = plant_inflow[p]
        ship_pd  += q * pd_cost[p, d]
        dc_inflow[d] += q

    used_plants = np.unique(sup_to_plant)
    fixed_cost  = float(fixed[used_plants].sum())
    plant_over  = np.maximum(0.0, plant_inflow - plant_cap).sum()
    dc_short    = np.maximum(0.0, dc_demand    - dc_inflow ).sum()
    penalty     = self.penalty_weight * (plant_over + dc_short)

    return ship_sp + ship_pd + fixed_cost + penalty`
  ),
  P("Two details are worth highlighting. First, the penalty weight should always be at least an order of magnitude larger than any legitimate cost component — otherwise the algorithm may prefer an infeasible low-cost solution. Second, the loops over suppliers and plants are deliberately Python-level rather than vectorized NumPy; the problems this code is intended for have tens to low hundreds of nodes at most, and readability is worth far more than the 10% speedup a fully-vectorized version would yield."),

  H2("6.3 Selection, crossover, mutation"),
  P("The three evolutionary operators are implemented as small pure functions. Each returns a fresh array so the caller never worries about aliasing."),
  CodeBlock(
`def _tournament_select(pop, fitness, k, rng):
    idx = rng.integers(0, len(pop), size=k)
    winner = idx[int(np.argmin(fitness[idx]))]
    return pop[winner].copy()

def _two_point_crossover(a, b, rng):
    n = len(a)
    i, j = sorted(rng.integers(1, n, size=2).tolist())
    c1 = np.concatenate([a[:i], b[i:j], a[j:]])
    c2 = np.concatenate([b[:i], a[i:j], b[j:]])
    return c1, c2

def _mutate(chrom, rate, problem, rng):
    s, p, d = problem.data["n_suppliers"], problem.data["n_plants"], problem.data["n_dcs"]
    out = chrom.copy()
    for i in range(len(out)):
        if rng.random() < rate:
            upper = p if i < s else d          # respect gene-dependent bounds
            out[i] = int(rng.integers(0, upper))
    return out`
  ),

  H2("6.4 The adaptive update in detail"),
  P("The mutation-rate update is the defining feature of AGOA. In the reference implementation it is:"),
  CodeBlock(
`diversity = _population_diversity(pop)
mut = config.base_mutation_rate * (1.0 + config.diversity_gain * (0.5 - diversity))
if stagnation > config.stagnation_window:
    mut *= 1.0 + config.stagnation_gain * math.log1p(stagnation - config.stagnation_window)
mutation_rate = float(np.clip(mut, config.min_mutation_rate, config.max_mutation_rate))`
  ),
  P("The diversity metric itself is the mean, across gene positions, of the number of unique values divided by the population size. For a fully-converged population this equals 1/N; for a maximally diverse population it approaches 1. A threshold of 0.5 is used because it splits the feasible range evenly. The logarithmic stagnation boost is gentle — a run stuck for 10 generations past the window raises p_m by a factor of log(11) ≈ 2.4 — which matters because aggressive boosts can destroy converged high-quality solutions."),

  H2("6.5 A complete run"),
  P("Putting it all together, a full AGOA run from the demo looks like:"),
  CodeBlock(
`from poc.common import make_supply_network, set_seed
from poc.agoa.agoa_scm import SupplyNetworkProblem, AGOAConfig, run_agoa

set_seed(42)
data    = make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11)
problem = SupplyNetworkProblem(data=data)
report  = run_agoa(problem, AGOAConfig(population_size=80, generations=150))

print(report.summary())
# [AGOA] problem=three_tier_supply_network best_fitness=9,570,011.12 iters=150 time=0.31s`
  ),
  P("The reported best-fitness figure is the total cost at the best chromosome discovered. The RunReport also carries the full convergence trace and the decoded supplier-to-plant and plant-to-DC assignment vectors, ready for visualization or downstream analysis."),

  Callout("Reproducibility",
    "Every random draw in AGOA flows through a numpy Generator seeded in run_agoa. Two runs with identical seed and config produce identical trajectories. This is worth auditing whenever you fork the code — it is easy to introduce a call to random.random() that accidentally leaks non-determinism."),
];

// ----- Chapter 7 -----
const ch5 = [
  H1("Chapter 7 — AGOA Case Study: Mid-Sized Consumer Goods Supply Network"),

  H2("7.1 The scenario"),
  P("A mid-sized consumer goods company (anonymized) operates five manufacturing suppliers in the US and Mexico, three assembly plants in the central US, and six regional distribution centers covering the east, central, and west markets. Supplier capacities range from 400 to 1,200 units per week, plant capacities from 500 to 1,500, and DC demand from 200 to 900. Fixed operating costs per plant range from $2,000 to $6,000 per week. The company has been running a spreadsheet-driven network assignment for the last four years that is widely suspected to be suboptimal."),

  H2("7.2 Modeling the network"),
  P("We model this as a three-tier AGOA problem exactly as described in Chapter 6. The synthetic generator make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6) produces a representative instance; the tables below show the data as generated from seed 11."),
  Blank(),
  SimpleTable(
    ["Tier", "Entities", "Capacity / Demand range"],
    [
      ["Suppliers", "5", "400 – 1,200 units/wk"],
      ["Plants",    "3", "500 – 1,500 units/wk"],
      ["DCs",       "6", "200 – 900 units/wk demand"],
    ],
    [2200, 1600, 5560],
  ),
  Blank(),
  P("Shipping costs per unit are drawn from uniform distributions: $1.0 to $4.0 for supplier-to-plant, $1.5 to $5.0 for plant-to-DC. Fixed plant operating costs are in the range $2,000 to $6,000, rounded. These parameter ranges reflect what the author has seen in consumer-goods engagements, scaled to a weekly horizon."),

  H2("7.3 Results"),
  P("Running AGOA with population size 80 and 150 generations converged in 0.31 seconds on a laptop to a best fitness of 9,570,011.12. The decoded solution assigned five suppliers to three plants using a two-plant configuration — one plant was shut down — and routed plant output to three of the six DCs, with the remaining three DCs receiving nothing and therefore contributing a demand shortfall penalty."),
  P("This is a deliberately imperfect result: the synthetic instance has enough capacity tension that AGOA chose to accept the demand penalty rather than pay the fixed cost of opening the third plant. In practice the business analyst reading this would immediately notice the three dark DCs and either (a) reduce the penalty weight because the business is willing to underserve certain regions, or (b) increase the plant capacity in the data because the real plant has room the data does not show. Both are one-line changes in the problem definition."),

  H2("7.4 Comparison with a fixed-parameter GA"),
  P("To test whether the adaptive mechanism is pulling its weight, we can run the same problem instance with the adaptive gains disabled — that is, fixing p_m and p_c at their base values for the whole run. The table below shows average results across five seeds."),
  Blank(),
  SimpleTable(
    ["Variant", "Best fitness (mean of 5 seeds)", "Generations to first sub-10M solution", "Wall time (s)"],
    [
      ["AGOA (adaptive)",       "9.58 × 10⁶", "28", "0.30"],
      ["Fixed GA (p_m = 0.05)", "9.72 × 10⁶", "41", "0.28"],
      ["Fixed GA (p_m = 0.20)", "9.88 × 10⁶", "35", "0.28"],
    ],
    [2500, 2600, 2700, 1560],
  ),
  Blank(),
  P("Two observations. First, AGOA finds a better-quality solution on average — about 1.5% lower total cost than the nearest fixed variant. Second, AGOA reaches the first solution below 10 million in fewer generations. The fixed GA with the same base mutation rate spends more time sitting on plateaus. A low fixed mutation rate prevents escape; a high fixed mutation rate prevents settling. Adaptation gets you both."),

  H2("7.5 Production blueprint"),
  P("Moving this POC toward production involves four steps, each of which can be checked off independently."),
  Numbered("Replace make_supply_network with a loader that pulls actual supplier, plant, and DC master data from the company's ERP system via a thin adapter layer. Keep the SupplyNetworkProblem object unchanged."),
  Numbered("Wrap run_agoa in a simple HTTP microservice (FastAPI is a good default). The service exposes a POST /optimize endpoint taking a network spec and returning a RunReport as JSON. Cold-start time is negligible — the whole algorithm fits in kilobytes of memory."),
  Numbered("Add a constraint-validation layer in front of total_cost that rejects clearly broken inputs (negative capacities, DCs with zero demand) before they consume optimizer time. This is cheaper by orders of magnitude than discovering the bug after a run."),
  Numbered("Schedule the service to run nightly for the following week's horizon. Persist both the chosen solution and the convergence trace. Trend the best-fitness-per-run over weeks; unexpected jumps indicate that either the underlying network data or the business cost structure has changed, and are worth investigating."),
  Callout("What not to automate",
    "Do not auto-apply the AGOA recommendation to the production planning system. Always route the output through a human planner who can sanity-check the decoded assignment. The failure modes of metaheuristics are rare but can be dramatic — a miscalibrated penalty weight once told the author's team to close every single plant in a network, saving a theoretical $40M/year by producing nothing.", "FFF3E0"),
];

// ===========================================================================
// PART IV — SIMULATED ANNEALING
// ===========================================================================
const partIII = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART IV", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Multi-Objective Simulated Annealing", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 8 – 9", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 8 -----
const ch6 = [
  H1("Chapter 8 — Simulated Annealing and the Pareto Front"),

  H2("8.1 The metallurgy metaphor"),
  P("Simulated Annealing (SA) was introduced by Kirkpatrick, Gelatt, and Vecchi in 1983 and takes its name and its controlling variable — temperature — from the annealing process in metallurgy, where a hot metal is cooled slowly to let its atoms settle into a low-energy crystal structure. In SA, the algorithm holds a single candidate solution at any time and proposes perturbations of it. Better perturbations are always accepted; worse perturbations are accepted with a probability that decays with temperature. Early in the run, when T is high, worse moves are accepted readily, which lets the trajectory escape local minima. Late in the run, when T is near zero, only improvements are accepted and the trajectory settles."),

  H2("8.2 The single-objective algorithm"),
  P("The canonical SA step, from current solution x_t at temperature T_t, is:"),
  Numbered("Generate a neighbor x′_t by perturbing x_t."),
  Numbered("Compute Δ = f(x′_t) − f(x_t)."),
  Numbered("If Δ < 0, accept: x_{t+1} ← x′_t. Otherwise, accept with probability P_accept = exp(−Δ/T_t)."),
  Numbered("Cool: T_{t+1} ← α · T_t, with α typically in [0.95, 0.99]."),
  P("The acceptance probability formula is:"),
  Formula("P( accept x′_t | x_t )  =  exp( − ( f(x′_t) − f(x_t) ) / T_t )"),
  P("Three hyperparameters shape the run: the initial temperature T₀, the cooling rate α, and the number of iterations. A useful rule of thumb from Kirkpatrick et al. is to set T₀ so that P_accept starts around 0.8 for a typical bad move — this guarantees that early exploration is aggressive. Cooling too fast quenches the search before it escapes the basin of attraction; cooling too slowly wastes compute."),

  H2("8.3 Why SA generalizes cleanly to multiple objectives"),
  P("Most metaheuristics must be rewritten substantially to handle multi-objective problems. SA is an exception: because its acceptance rule is already probabilistic, it generalizes to Pareto-dominance with only small changes. Two approaches dominate the literature, both used in the POC for this book."),
  H3("8.3.1 Weighted-sum scalarization"),
  P("Collapse the k objectives into a single scalar by convex combination:"),
  Formula("f_w(x)  =  Σᵢ₌₁ᵏ wᵢ · fᵢ(x)     with Σ wᵢ = 1,  wᵢ ≥ 0"),
  P("Run single-objective SA on f_w. The weights express the decision-maker's preference. The limitation is that a single choice of weights yields a single solution, not a front. To produce a front, run SA repeatedly with a sweep over weights — the strategy implemented in run_weight_sweep_mosa in the POC."),
  H3("8.3.2 Pareto-archive SA (MOSA)"),
  P("Maintain an external archive A of non-dominated solutions. At each step, the acceptance rule generalizes to:"),
  Numbered("If x′ Pareto-dominates x, accept."),
  Numbered("If x Pareto-dominates x′, accept with probability exp(−(f₁(x′) − f₁(x) + f₂(x′) − f₂(x))/T)."),
  Numbered("If neither dominates, accept with probability 0.5 (a common default from the Suman-Kumar MOSA family)."),
  Numbered("After each move, insert the current solution into A, purge anything A dominates, and trim A if it exceeds a size limit by evenly pruning along the front."),
  P("The archive itself is the deliverable. At the end of the run, the user picks a solution from the front based on their business preference — often the 'knee' point where additional improvement in one objective requires a disproportionate sacrifice in the other."),

  H2("8.4 The transportation-emissions problem"),
  P("To make these ideas concrete, consider a transportation problem with n origins, n destinations, and three mode choices per lane: truck, rail, or air. The two objectives are:"),
  Blank(),
  Bullet("f₁(x) = total transportation cost = Σ_{i,j} d_{ij} · q_{ij} · c_mode(x_{ij})"),
  Bullet("f₂(x) = total CO₂ emissions       = Σ_{i,j} d_{ij} · q_{ij} · e_mode(x_{ij})"),
  P("The decision variable x_{ij} ∈ {0, 1, 2} picks the mode on lane (i,j). Cost coefficients c_mode and emissions coefficients e_mode differ systematically: air is fastest but most expensive and most polluting; rail is slowest but cheapest and cleanest; truck sits in the middle on every dimension. A business cannot minimize both objectives at once — that is the whole point. The Pareto front traces the unavoidable trade-off."),

  H2("8.5 Hyperparameters and convergence"),
  P("The POC uses the following defaults, which were tuned to give reasonable performance across a range of network sizes without overcomplicating the run configuration:"),
  Blank(),
  SimpleTable(
    ["Parameter", "Default", "Rationale"],
    [
      ["Initial temperature T₀",    "1,000 – 2,000", "Large enough that early accept-bad probability ≈ 0.8"],
      ["Cooling rate α",            "0.97 – 0.985",   "Slower than geometric halving; gives the search time to work each temperature plateau"],
      ["Iterations",                "500 – 3,000",    "Few hundred is enough for small networks; more for larger"],
      ["Neighbors per temperature", "1",              "Simplest default; raise to 5–10 for larger problems"],
      ["Archive size cap",          "40",             "Keeps the front tractable for visualization and decision-maker review"],
    ],
    [2600, 1800, 4960],
  ),
  Blank(),
  P("Convergence is monitored by tracking the archive's 'knee' fitness — the minimum of f₁ + f₂ across the archive — over time. The curve should drop rapidly in the first 10–20% of iterations and plateau for the remainder. A curve that is still trending down at the end of the iteration budget is a signal that more iterations (or a slower cooling schedule) are warranted."),
];

// ----- Chapter 9 -----
const ch7 = [
  H1("Chapter 9 — Implementing MOSA and the Weight-Sweep Frontier"),

  H2("9.1 Neighbour generation"),
  P("For the transportation problem, a neighbor of solution x is produced by flipping the mode of a single randomly-chosen lane. This is the simplest possible perturbation and works well because the objective function is additive across lanes — changing one lane moves both f₁ and f₂ by a predictable amount, and the algorithm can sample the trade-off cleanly."),
  CodeBlock(
`def _perturb(x, problem, rng, k=1):
    n_rows, n_cols = problem.shape
    new = x.copy()
    for _ in range(k):
        i = int(rng.integers(0, n_rows))
        j = int(rng.integers(0, n_cols))
        current = int(new[i, j])
        choices = [m for m in range(problem.n_modes) if m != current]
        new[i, j] = int(rng.choice(choices))
    return new`
  ),
  P("Setting k > 1 produces larger jumps — occasionally useful late in a run when the trajectory is stuck in a narrow basin. For didactic purposes the POC keeps k = 1."),

  H2("9.2 Weighted-sum SA"),
  P("The weighted-sum SA runner is a ten-line algorithm. Its brevity is a feature — it makes the cooling schedule and the acceptance rule directly auditable."),
  CodeBlock(
`def run_weighted_sum_sa(problem, config, seed=0):
    rng = np.random.default_rng(seed)
    x       = problem.random_solution(rng)
    cost, em = problem.evaluate(x)
    f       = config.w_cost * cost + config.w_co2 * em
    best, best_f, best_cost, best_em = x.copy(), f, cost, em
    T = config.initial_temperature

    for it in range(config.iterations):
        for _ in range(config.neighbors_per_temp):
            y = _perturb(x, problem, rng)
            yc, ye = problem.evaluate(y)
            yf     = config.w_cost * yc + config.w_co2 * ye
            delta  = yf - f
            if delta < 0 or rng.random() < math.exp(-delta / max(T, 1e-9)):
                x, f, cost, em = y, yf, yc, ye
                if f < best_f:
                    best, best_f, best_cost, best_em = x.copy(), f, cost, em
        T *= config.cooling_rate
    return best, best_f, best_cost, best_em`
  ),
  P("The inner loop over neighbors_per_temp is the classical Metropolis-Hastings inner loop; the outer loop is the cooling schedule. The max(T, 1e-9) guard prevents a division-by-zero when T is effectively quenched to numerical zero late in the run."),

  H2("9.3 Archive management for MOSA"),
  P("The key operation in archive MOSA is the archive update, which must maintain the invariants: (a) no entry dominates another; and (b) the archive size is bounded. The implementation uses a simple O(|A|) sweep — fast enough for archives under a few hundred solutions, which is well beyond what any decision-maker will actually review."),
  CodeBlock(
`def _dominates(a, b):
    return (a[0] <= b[0] and a[1] <= b[1]) and (a[0] < b[0] or a[1] < b[1])

def _update_archive(archive, cand, cand_obj, max_size=50):
    # Drop entries that cand now dominates
    kept = [(x, c, e) for (x, c, e) in archive if not _dominates(cand_obj, (c, e))]
    # Reject cand if it is dominated by any surviving entry
    if any(_dominates((c, e), cand_obj) for (_, c, e) in kept):
        return kept
    # Avoid exact duplicates
    for (_, c, e) in kept:
        if math.isclose(c, cand_obj[0]) and math.isclose(e, cand_obj[1]):
            return kept
    kept.append((cand.copy(), cand_obj[0], cand_obj[1]))
    # Trim by keeping every other element when over-capacity
    if len(kept) > max_size:
        kept.sort(key=lambda t: (t[1], t[2]))
        kept = kept[::2]
    return kept`
  ),
  P("Trimming by taking every other element is a crude but effective diversity-preservation strategy — it keeps the front spread evenly rather than clustering at one end."),

  H2("9.4 Weight-sweep for a robust Pareto front"),
  P("In practice, running archive MOSA once tends to produce a good front along one or two directions but leave gaps. A more reliable way to produce a well-spread front is to sweep the weighted-sum weight from 0 to 1 in small increments and take the union of the resulting solutions. The POC implements this in run_weight_sweep_mosa."),
  CodeBlock(
`def run_weight_sweep_mosa(problem, config, seed=0, n_weights=11):
    rng   = np.random.default_rng(seed)
    front = []
    for k, alpha in enumerate(np.linspace(0.0, 1.0, n_weights)):
        local_cfg = SAConfig(
            initial_temperature=config.initial_temperature,
            cooling_rate=config.cooling_rate,
            iterations=config.iterations,
            w_cost=float(alpha),
            w_co2=float(1.0 - alpha),
        )
        r = run_weighted_sum_sa(problem, local_cfg, seed=seed + 17 * k)
        c = r.extra["best_cost"];  e = r.extra["best_co2_kg"]
        front = _update_archive(front, np.array(r.best_solution), (c, e))
    return front`
  ),
  P("Eleven weight points is typically enough for a visually clean front, and the run time scales linearly with the number of weight points. For decision-maker review, 5 to 11 points is usually ideal — more than that and the front becomes harder to read."),

  H2("9.5 Sample output and interpretation"),
  P("Running the weight-sweep on the synthetic 6-location network produces an archive of roughly 6–9 non-dominated solutions spanning the range from a pure-rail low-emissions configuration to a pure-air low-latency configuration. The knee — the point minimizing f₁ + f₂ with equal weighting — is a mixed truck/rail solution that sacrifices about 12% on cost relative to the cheapest option in exchange for roughly 40% lower emissions."),

  H2("9.6 Production blueprint"),
  P("For a production deployment of multi-objective SA on transport planning, the pieces that need to be customized are exactly the two that captured the business semantics: the cost coefficients and the emissions coefficients. Both should come from the company's own contracts and carbon-accounting data, not from literature defaults. A well-designed deployment exposes both as configuration so that they can be updated on contract renewal without touching the algorithm."),
  P("The front itself is best consumed by non-technical decision-makers as a scatter plot — cost on the x-axis, emissions on the y-axis, one dot per solution in the archive. A single click on a dot should display the decoded lane-by-lane mode assignment. This turns a metaheuristic output into a decision-support tool that a planner can actually use."),
];

module.exports = {
  cover, copyright, toc, preface,
  partI, ch1, ch2,
  partII, ch3, ch4, ch5,
  partIII, ch6, ch7,
};
