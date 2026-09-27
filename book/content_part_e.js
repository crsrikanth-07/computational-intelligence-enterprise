// content_part_e.js — new Part II (Mathematical Machinery): Ch 3 (Metaheuristics) + Ch 4 (Stochastic Foundations)
const {
  P, PRich, H1, H2, H3, H4,
  Formula, CodeBlock, Callout,
  Bullet, Numbered, SimpleTable,
  Blank, HR, FONT, ACCENT,
} = require('./helpers');
const { Paragraph, TextRun, AlignmentType } = require('docx');

// ===========================================================================
// PART II — MATHEMATICAL MACHINERY  (NEW)
// ===========================================================================
const partII_new = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART II", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Mathematical Machinery", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 3 – 4", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 3 — Metaheuristics, a unified framework -----
const ch3_meta = [
  H1("Chapter 3 — Metaheuristics: A Unified Framework"),

  P("The algorithms in Parts II through V — AGOA, Simulated Annealing, Particle Swarm Optimization, Hybrid PSO-GA, and Bessel-Fourier Descriptors — share structural DNA even though they look superficially different. Four of them (AGOA, SA, PSO, and Hybrid PSO-GA) are metaheuristics; the fifth (BFD) is a feature-extraction technique that plugs into a metaheuristic-adjacent learning pipeline. Before we look at them one by one, it is worth stepping back to ask what the four metaheuristics have in common. They share more than a literature and a flavor. They share a philosophy, a vocabulary, and a set of design trade-offs. This chapter makes those commonalities explicit so that when a new algorithm appears later in the book, or in your own reading, you can place it on a map you already know."),

  H2("3.1 What is a metaheuristic?"),
  P("The word metaheuristic combines the Greek prefix meta — meaning 'above' or 'beyond' — with heuristic, a problem-solving rule of thumb. A heuristic is a specific rule: 'always move to the neighbor with the lowest cost,' or 'pick the next city that is closest.' A metaheuristic is a strategy one level up: a general framework for deciding when to apply which heuristic, when to accept a worse solution in exchange for escape from a local optimum, when to stop. Metaheuristics are algorithms for coordinating heuristics."),

  P("Four properties together define a metaheuristic. First, it is general-purpose: the same algorithm applies across problem domains with only small changes (mostly to the fitness function). Second, it is stochastic: at least one step of the algorithm uses randomness. Third, it is iterative: it repeatedly improves a current solution or population until a stopping condition fires. Fourth, and most importantly, it treats the objective function as a black box: it assumes nothing about differentiability, continuity, or convexity. If you can evaluate f(x), the algorithm can work with it."),

  P("This black-box property is what makes metaheuristics so practical for enterprise problems. When the cost of a supply-chain configuration involves a simulation that takes seconds per evaluation, or when the objective is the output of a non-linear forecasting model you do not control, classical optimization simply cannot start. A metaheuristic only asks for the ability to try a candidate and see the score — a requirement essentially every enterprise system can meet."),

  Callout("A non-example",
    "Linear programming is not a metaheuristic. It exploits the specific structure of a linear objective under linear constraints to solve problems in polynomial time with provable optimality. It is a precisely-tuned tool for a precisely-shaped problem — the opposite of the general-purpose black-box approach. When a problem fits the LP mold, use LP. When it does not, metaheuristics become the pragmatic choice."),

  H2("3.2 The exploration-exploitation trade-off"),
  P("Every metaheuristic, no matter its inspiration or its operators, answers the same central question: given a finite budget of evaluations, how should I spend them? Two competing pressures shape every choice."),
  Blank(),
  Bullet("Exploration means sampling new regions of the search space in the hope of discovering a better basin of attraction than the one currently known. Random moves, mutations, velocity inertia, and high-temperature jumps all serve exploration."),
  Bullet("Exploitation means refining the best solution found so far, working within a known-promising region to squeeze out additional improvement. Gradient-like pulls toward personal or global bests, low-temperature acceptance rules, and elitist selection all serve exploitation."),
  P("Pure exploration is a random search — statistically unbiased but appallingly slow. Pure exploitation is hill-climbing — fast but trapped in the first local optimum it finds. Every useful algorithm must blend them. More than that, the blend must shift over the course of a run: exploration high early, when we know little, and exploitation high late, when we are trying to crystallize a good answer."),
  P("The strategies each algorithm uses to manage this shift are as follows."),
  Blank(),
  SimpleTable(
    ["Algorithm", "Exploration mechanism", "Exploitation mechanism", "How the balance shifts"],
    [
      ["AGOA",             "High mutation rate, diverse population",     "Elite preservation, low mutation", "Mutation rate adapts to diversity and stagnation"],
      ["Simulated Annealing", "Accept worse moves with P = exp(−Δ/T)", "Reject almost all worse moves",    "Temperature decays geometrically"],
      ["PSO",              "Inertia term, wide initial velocities",      "Cognitive and social pulls",       "Inertia weight ω decays linearly"],
      ["Hybrid PSO-GA",    "GA mutation + BLX-α crossover",              "PSO swarm dynamics",               "Cross-pollination injects GA diversity into a converging swarm"],
    ],
    [1800, 2400, 2400, 2760],
  ),
  Blank(),
  P("If you remember one thing from this chapter, remember this table. The central theoretical content of each algorithm is the answer to two questions — how do I explore, and how do I exploit? — plus the schedule for moving from one to the other."),

  H2("3.3 Common building blocks"),
  P("Under the specific operators, every metaheuristic has the same five-ingredient skeleton."),
  Numbered("A solution representation — the data structure that encodes a candidate answer. AGOA uses integer vectors (chromosomes). SA uses raw decision matrices. PSO uses real-valued position vectors. The choice of representation determines what the other operators can do."),
  Numbered("An objective function f(x) that maps any representation to a real number. This is the only domain-specific component; it is where the business problem lives. Everything else is reusable."),
  Numbered("A neighborhood structure — a way to generate a candidate neighbor from a current solution. Mutation, crossover, velocity updates, and SA perturbations are all neighborhood operators in disguise."),
  Numbered("An acceptance rule — the logic that decides whether a new candidate replaces the current one. Deterministic in hill-climbing, probabilistic in SA, implicit in PSO (personal-best and global-best updates)."),
  Numbered("A set of parameters with a tuning schedule — population size, temperature, inertia weight, mutation rate, and their decay or adaptation over time."),
  P("Every algorithm in this book can be read off this checklist. When you encounter a new metaheuristic in the literature — Tabu Search, Differential Evolution, Cuckoo Search, Harmony Search — running down this list and filling in the five blanks is the fastest way to understand it."),

  H2("3.4 Single-point versus population-based methods"),
  P("Metaheuristics divide cleanly into two families along one structural axis. Single-point methods, also called trajectory methods, carry one solution at a time and move it through the search space. Simulated Annealing and Tabu Search are the textbook examples. Population methods — genetic algorithms, PSO, differential evolution — carry a collection of solutions that evolve together."),
  P("The two families have complementary strengths. Trajectory methods are easier to implement, have fewer parameters, and use less memory. Population methods exploit parallelism naturally — every member of the population can be evaluated independently on a separate CPU core — and their diversity gives them a built-in resistance to premature convergence. A good practitioner chooses the family that matches the problem, not the family that happened to be in the last paper they read."),
  Blank(),
  SimpleTable(
    ["Property", "Single-point (SA, TS)", "Population (GA, PSO)"],
    [
      ["Memory per run",     "O(1) solutions",            "O(N) solutions"],
      ["Parallelism",        "Hard (sequential trajectory)", "Easy (evaluate each member in parallel)"],
      ["Hyperparameters",    "Few (2–3)",                 "Many (5–10)"],
      ["Premature convergence", "Common on rugged landscapes", "Rare if diversity is maintained"],
      ["Warm-start friendly", "Yes",                      "Less so (need to seed a diverse population)"],
    ],
    [2400, 3200, 3760],
  ),

  H2("3.5 The No Free Lunch theorem"),
  P("In 1997, David Wolpert and William Macready proved a theorem that has become the quiet backbone of the metaheuristics field. Averaged over all possible objective functions, no algorithm outperforms any other algorithm — including random search. The theorem is sometimes called the No Free Lunch (NFL) theorem because it formalizes a simple and uncomfortable fact: if your algorithm is good at a particular class of problems, it is only because it is bad at another class in exactly the offsetting amount."),

  P("The practical implication is not nihilism. It is humility. The NFL theorem does not say that AGOA is no better than random search on supply-network problems. It says that AGOA is better on supply-network problems because supply-network problems have structure — combinatorial decisions with soft constraints and moderate dimensionality — that AGOA's operators exploit. On a different problem class — say, continuous convex optimization — the same algorithm would be dominated by gradient descent."),
  P("The takeaway is that choice of algorithm is implicitly a choice of inductive bias. A good practitioner does not pick an algorithm because it is the most recent; they pick it because its operators match the structure of the problem. This book presents five algorithms because five different problem classes are common in enterprise optimization, not because five is a magic number."),

  H2("3.6 What convergence means (and does not mean)"),
  P("In gradient descent, convergence has a clean meaning: the parameter vector stops changing, the gradient is zero, and we are at a (local) minimum. In metaheuristics, the situation is subtler. Three distinct notions of convergence appear in the literature, and a careful practitioner uses all three."),

  H3("3.6.1 Convergence in probability"),
  P("For some algorithms — Simulated Annealing with a sufficiently slow cooling schedule is the prototypical case — one can prove that the probability of the current solution being at the global optimum tends to 1 as the run length tends to infinity. Formally, letting x_t be the solution at step t and x* the global optimum:"),
  Formula("P( x_t = x* )  →  1     as     t  →  ∞"),
  P("This is a weaker guarantee than gradient-descent's determinism — you might be unlucky on any finite run — but it is stronger than nothing. Algorithms with this property are in some sense provably correct; you can always run them longer to increase your confidence."),

  H3("3.6.2 Convergence in expectation"),
  P("A more practical notion is that the expected best-so-far fitness decreases (for a minimization problem) as the number of iterations grows. Formally:"),
  Formula("E[ f(x_t^{best}) ]  monotone non-increasing in t,  with  E[ f(x_t^{best}) ]  →  f*  possible but not guaranteed"),
  P("Every algorithm in this book satisfies the first part of this statement — the best-so-far trace never goes up, because we always keep the best found. The second part — that the expectation reaches the true optimum — depends on the algorithm and the problem."),

  H3("3.6.3 Empirical convergence"),
  P("In practice, the notion most useful to the engineer is empirical convergence: the best-so-far trace plateaus. No further improvement is seen in K consecutive iterations. This is not a theorem; it is an observation. It is also the only stopping criterion that survives contact with a real compute budget. Every POC in this book can be run to empirical convergence by tracking the convergence_trace field of the RunReport and stopping when a sliding window of recent improvements drops below a threshold."),

  Callout("A warning about proofs",
    "Published convergence proofs for metaheuristics typically require conditions — infinitely slow cooling, infinitely large population, infinitely many iterations — that no real deployment can satisfy. Treat proofs as mathematical reassurance, not production guarantees. Your real job is to observe empirical convergence on your actual problem, with your actual compute budget, and to reason about variance across seeds."),

  H2("3.7 Why hybrids work"),
  P("Chapters 12 and 13 introduce the Hybrid PSO-GA algorithm. The motivation for hybridizing is a direct consequence of the No Free Lunch theorem: different algorithms have different strengths, and on a problem whose landscape contains both smooth continuous regions and multi-modal discrete choices, no single-paradigm algorithm dominates. Running two algorithms concurrently on the same fitness, and exchanging promising solutions between them, gives you the strengths of both with little of either weakness."),
  P("This hybridization pattern is general. GA with Tabu Search, PSO with differential evolution, SA with local refinement — any two metaheuristics can be hybridized if they share a representation. The cost is more parameters and more compute per iteration. The benefit is robustness across problem instances you have not yet seen. For a production system that will run unattended on changing data, that robustness is often worth the cost."),

  H2("3.8 A reading map for the rest of the book"),
  P("With this chapter's framework in mind, the rest of the book reads as a series of specific choices within a common design space."),
  Blank(),
  SimpleTable(
    ["Algorithm",        "Family",          "Representation",   "Exploration mechanism",   "Exploitation mechanism"],
    [
      ["AGOA (Part III)",        "Population",      "Integer vectors",   "Adaptive mutation",       "Elitist selection"],
      ["SA / MOSA (Part IV)", "Single-point", "Mode per lane", "High-T probabilistic acceptance", "Low-T near-greedy acceptance"],
      ["PSO (Part V)",           "Population",      "Real vectors",      "Inertia + random coefficients", "Cognitive + social pulls"],
      ["Hybrid PSO-GA (Part V)", "Population",      "Real vectors",      "GA mutation + BLX-α",     "PSO + cross-pollination"],
      ["BFD (Part VI)",          "Not an optimizer","Coefficient vector","N/A (feature extraction)", "N/A"],
    ],
    [1800, 1400, 1800, 2200, 2160],
  ),
  Blank(),
  P("Every row of this table fits on the common skeleton from Section 3.3. When you encounter an algorithm not listed here, the exercise is to add its row. If you can, you understand it."),
];

// ----- Chapter 4 — Stochastic Foundations -----
const ch4_stoch = [
  H1("Chapter 4 — Stochastic Foundations: A Working Primer"),

  P("Every metaheuristic in this book uses randomness — mutation rolls, Metropolis acceptance, swarm coefficients, noise in BFD's training images. Randomness in these algorithms is not a flaw we have to tolerate; it is the load-bearing feature that lets the algorithms escape local optima and explore high-dimensional spaces. To reason about them clearly, we need a small vocabulary of probability and a handful of ideas from stochastic processes. This chapter provides exactly that. The level of rigor is deliberately practitioner-friendly — enough to analyze every claim made elsewhere in the book, no more."),

  P("Readers who have taken a rigorous probability course can skim this chapter for notation. Readers whose probability is rusty or informal should read it carefully; the conceptual bedrock of Simulated Annealing, PSO, and hybrid methods all sits on top of what follows."),

  H2("4.1 Random variables and distributions"),
  P("A random variable X is a rule that assigns a real number to each outcome of a random experiment. 'The fitness of a random starting chromosome' and 'the result of a coin flip' and 'the velocity of a particle after one PSO step' are all random variables. The probability distribution of X describes, in full, the probabilities of X taking each possible value or range of values."),
  P("Three distributions appear throughout this book and deserve naming:"),
  Blank(),
  Bullet("Uniform distribution U(a, b) — every value between a and b equally likely; the default for NumPy's rng.uniform. PSO's r₁ and r₂ coefficients are Uniform(0, 1). The initial population of AGOA is drawn from uniform distributions on each gene's valid range."),
  Bullet("Normal (Gaussian) distribution N(μ, σ²) — the bell curve; used in hybrid PSO-GA's Gaussian mutation operator, in image-classification noise models (Chapter 15 on BFD), and in virtually all convergence theorems via the Central Limit Theorem."),
  Bullet("Bernoulli distribution Bernoulli(p) — a coin flip with probability p of heads. Each individual gene mutation in AGOA is a Bernoulli trial; the number of mutations per chromosome is a sum of Bernoullis, which follows a Binomial distribution."),

  H3("4.1.1 Expected value and variance"),
  P("The expected value of a random variable is its long-run average — the value you would see if you sampled X many times and averaged the results. Formally, for a discrete RV:"),
  Formula("E[X]  =  Σ_k  k · P(X = k)"),
  P("and for a continuous RV with density f(x):"),
  Formula("E[X]  =  ∫  x · f(x) · dx"),
  P("The variance measures how spread out the distribution is around the mean:"),
  Formula("Var(X)  =  E[ (X − E[X])² ]  =  E[X²] − (E[X])²"),
  P("In algorithm analysis, E[X] is what we want to estimate (e.g., the expected best-fitness after 100 iterations) and Var(X) is what tells us how many seeds we need to run to estimate it reliably. A rule of thumb: reporting metaheuristic results with fewer than 5 random seeds is underpowered; 20 seeds is typical for a research paper; 100 or more seeds are used when claims must be robust."),

  H2("4.2 Independence and the Central Limit Theorem"),
  P("Two random variables X and Y are independent if knowing the value of X tells you nothing about Y. The Central Limit Theorem (CLT) is the single most important consequence of independence in all of probability: if X₁, X₂, …, Xₙ are independent and identically distributed random variables with mean μ and variance σ², then their average S_n = (X₁ + X₂ + … + Xₙ) / n has, for large n, a distribution very close to a Normal:"),
  Formula("S_n  ≈  N( μ ,  σ² / n )     for large n"),
  P("Two practical consequences for metaheuristic work. First, when we average the best-fitness across n independent seeds, the error in our estimate shrinks like 1/√n. Doubling n reduces the error by only √2 ≈ 1.41. This is why halving variance requires four times the compute. Second, any quantity in an algorithm that is a sum or average of many random contributions — the total velocity accumulated over many PSO steps, the number of mutations in a long GA run — is approximately Normally distributed, which makes its behavior predictable and analyzable."),

  H2("4.3 Markov chains"),
  P("A Markov chain is the simplest useful model of a random process that evolves over time. It is defined by two ingredients: a set of states, and a transition probability P(x → y) that specifies the chance of moving from state x to state y in one step. The defining property — the Markov property — is that this transition probability depends only on the current state, not on the full history of how we got there."),
  Formula("P( x_{t+1} = y  |  x_t, x_{t-1}, …, x_0 )  =  P( x_{t+1} = y  |  x_t )"),
  P("Markov chains are the mathematical engine behind Simulated Annealing. The state of an SA run at step t is the current solution x_t. The transition probability from x_t to a candidate y has two parts: the probability that the neighborhood operator generates y, multiplied by the probability that the acceptance rule keeps it. This product is entirely determined by x_t — the history of where the trajectory has been does not enter, which is exactly the Markov property."),

  H3("4.3.1 Stationary distributions"),
  P("A Markov chain has a stationary distribution π if, once the chain has been running long enough, the probability of being in each state settles down and stops changing. The stationary distribution satisfies:"),
  Formula("π(y)  =  Σ_x  π(x) · P(x → y)     for every state y"),
  P("For the SA Markov chain at a fixed temperature T, the stationary distribution is the celebrated Boltzmann distribution:"),
  Formula("π_T(x)  ∝  exp( − f(x) / T )"),
  P("Read this formula: at fixed temperature T, after a long run, the SA chain is most likely to be in low-f states. As T approaches zero, the Boltzmann distribution concentrates on the global minimum. The SA cooling schedule slowly reduces T so that the chain has time to equilibrate at each temperature; in the limit, with infinitely slow cooling, the chain ends up at the global optimum with probability 1. This is the convergence-in-probability result mentioned in Section 3.6 — and now you have seen why it is true."),

  Callout("Why the Boltzmann distribution",
    "The Metropolis acceptance rule — accept worse moves with probability exp(−Δ/T) — was chosen historically because it exactly produces the Boltzmann distribution as the chain's stationary distribution. This is not a coincidence. The acceptance rule was designed so that the mathematics would work out cleanly. The reason SA is elegant is that it is, at heart, a Markov Chain Monte Carlo method for sampling from a specific, well-understood distribution."),

  H2("4.4 Random walks and diffusion"),
  P("The simplest Markov chain on a continuous space is a random walk: at each step, move left or right by a random amount. Let Z₁, Z₂, … be independent Normal(0, 1) random variables; then the position after n steps is"),
  Formula("X_n  =  X_0  +  Z₁  +  Z₂  +  …  +  Z_n     (one-dimensional random walk)"),
  P("By the CLT, X_n − X_0 is approximately Normal(0, n). The position spreads out — diffuses — at a rate proportional to √n. This √n diffusion rate is a deep feature of stochastic processes and explains why metaheuristic search takes longer than gradient descent: gradient descent converges linearly or better, while pure random-walk exploration only covers √n of the search space in n steps."),
  P("Brownian motion is the continuous-time limit of a random walk — imagine the walk taking infinitely many infinitely small steps per second. Brownian motion is the foundational object of stochastic calculus proper, and it is the limit object that appears in convergence analyses of essentially every stochastic optimization algorithm, including Stochastic Gradient Descent for neural networks."),

  H2("4.5 Monte Carlo estimation"),
  P("Monte Carlo is the name given to any method that estimates a quantity of interest by sampling. If you want to compute an expectation E[g(X)] that is too hard to evaluate analytically, you can instead generate n independent samples x₁, x₂, …, xₙ from the distribution of X, and average the resulting values:"),
  Formula("E[g(X)]  ≈  (1/n) · Σᵢ g(xᵢ)     (Monte Carlo estimator)"),
  P("By the CLT again, this estimator has error of order 1/√n — surprisingly slow compared to numerical integration in low dimensions, but also surprisingly robust compared to numerical integration in high dimensions. Monte Carlo is often the only viable estimator when the dimension is above 4 or 5."),
  P("Every multi-seed experiment in this book is an implicit Monte Carlo estimator: the mean best-fitness across N seeds estimates the expected best-fitness of the algorithm on the problem, and the standard deviation of those N values estimates how much a single run might vary. When you read Appendix D.4 — 'Mean PSO 3451.63, Mean Hybrid 3451.63' — you are reading a five-sample Monte Carlo estimator of each algorithm's expected best-fitness."),

  H2("4.6 Bringing it back to the algorithms"),
  P("The abstract material of the previous sections pays off immediately once you look at the algorithms through its lens. Four observations:"),
  Numbered("The mutation operator in AGOA and Hybrid PSO-GA is a small random walk in the solution space. Its per-step variance is the mutation rate times the gene-range variance. A run of T generations therefore diffuses roughly √T · mutation_radius in gene space — which is why AGOA's adaptive mutation matters: too-low mutation rates give √T too small to escape a basin."),
  Numbered("SA is a Markov chain sampling from a Boltzmann distribution at temperature T_t. The cooling schedule is a slow decrease of T. If you cool too fast, you quench the chain before it equilibrates; the chain never reaches the global optimum."),
  Numbered("PSO velocities are not a Markov chain in the pure sense — the next velocity depends on both the current position and the global best, which depends on the whole swarm's history. But each particle is a random walk pulled toward attractors, and the mathematics of random walks with drift applies. The inertia weight ω controls the random-walk component; c₁ and c₂ control the drift."),
  Numbered("Monte Carlo reasoning applies to every multi-seed comparison. When we say 'hybrid outperforms PSO 85% of the time,' we mean that in a Monte Carlo estimator across many problem instances, the probability that the hybrid's best-fitness beats PSO's is approximately 0.85. This is a probability, not a deterministic claim. Reporting it without acknowledging its variance is an elementary error."),

  ...require("./content_v2_front").ch4_fair,

  H2("4.8 What the practitioner actually needs to remember"),
  P("This has been a lot. If you remember only five things from this chapter, remember these:"),
  Numbered("Every run of a metaheuristic is a single sample from a distribution of possible runs. Report mean and standard deviation across multiple seeds, not single-run numbers."),
  Numbered("The Monte Carlo estimator error shrinks like 1/√n. To halve your error bars, run four times as many seeds."),
  Numbered("Simulated Annealing is a Markov chain sampling from the Boltzmann distribution at its current temperature. If you understand this, you understand why the cooling schedule matters."),
  Numbered("Mutation operators are random walks. A long run diffuses like √T. This is both how mutation escapes local optima (given enough time) and why it needs to be large enough (so √T covers useful distances in finite time)."),
  Numbered("Everything you claim about an algorithm's behavior is a probabilistic claim. Reporting it without variance is reporting it without rigor."),

  Callout("A reading order for deeper study",
    "Readers who want to go deeper can follow a clean progression: (1) Grimmett & Stirzaker, Probability and Random Processes, for a thorough undergraduate treatment. (2) Norris, Markov Chains, for a focused introduction to Markov chain theory. (3) Robert & Casella, Monte Carlo Statistical Methods, for sampling and estimation. (4) Karatzas & Shreve or Øksendal for stochastic calculus. Each can be read in sequence; the first covers prerequisites for the others."),
];

module.exports = {
  partII_new,
  ch3_meta,
  ch4_stoch,
};
