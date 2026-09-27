// content_v2_p3.js — Part III: Adaptive Genetic Optimization (Chapters 5–7)
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank, Figure,
} = require('./helpers');

const ch5 = [
  H1("Chapter 5 — AGOA: Theory and Adaptive Mechanisms"),

  H2("5.1 The textbook genetic algorithm in one page"),
  P("A genetic algorithm (GA) maintains a population of candidate solutions — chromosomes — and improves it over generations. Each generation applies the same five steps:"),
  Numbered("Evaluate every chromosome with the fitness function; here, the total weekly cost of a network design."),
  Numbered("Keep the best few chromosomes unchanged (elitism), so the best-so-far solution is never lost."),
  Numbered("Select parents by tournament: draw k chromosomes at random and keep the fittest."),
  Numbered("Recombine pairs of parents with probability p_c; two-point crossover swaps the segment between two random cut points."),
  Numbered("Mutate each gene of each child with probability p_m, replacing it with a random legal value."),
  P("Selection pushes the population toward good regions of the search space (exploitation); crossover and mutation keep proposing new combinations (exploration). The balance between the two is governed almost entirely by two numbers, p_c and p_m."),

  H2("5.2 Why static GA parameters fail on supply networks"),
  P("In a textbook GA, p_c and p_m stay fixed for the whole run. The difficulty is that the right values depend on the instance and on the phase of the search. Early on, while the population is diverse, a low mutation rate lets selection and crossover exploit good building blocks. Later, once the population has converged on one design, the same low rate leaves the search stuck and a higher rate is needed to escape. A rate that is high from the start wastes the early phase on random disruption."),
  P("Chapter 7 makes this concrete. On the same five-supplier network, a GA with the common default p_m = 0.05 finds the proven optimum in only 6 of 20 runs; the same GA with p_m = 0.20 finds it in 18 of 20. Nobody knows in advance that 0.20 is the right value for this instance — and on a different instance it may not be. Adaptive parameter control, an idea with a long history in evolutionary computation (Srinivas and Patnaik, 1994), removes that guess."),

  H2("5.3 The AGOA algorithm"),
  P("The Adaptive Genetic Optimization Algorithm keeps the loop of Section 5.1 and resets p_m and p_c after every generation from two signals that the population itself provides."),
  H3("Signal 1: diversity"),
  P("For each gene position j, count how often each of the K possible values appears across the population and compute the Shannon entropy H_j of those frequencies. Dividing by ln K scales it to the range 0 to 1, and averaging over the L gene positions gives the population diversity:"),
  Formula(["H_j = − Σ_v p_jv · ln p_jv", "D_t = (1/L) · Σ_j H_j / ln K ,   0 ≤ D_t ≤ 1"]),
  P("D_t = 0 means every chromosome is identical; D_t = 1 means every value is equally common at every position."),
  H3("Signal 2: stagnation"),
  P("The stagnation counter s is the number of generations since the best-so-far cost last improved."),
  H3("The update rule"),
  Formula([
    "p_m = p_m0 · ( 1 + g_d · (D* − D_t) / D* )",
    "if s > w:   p_m ← p_m · ( 1 + g_s · ln(1 + s − w) )",
    "p_m ← clip(p_m, p_min, p_max)",
    "p_c = clip( p_c0 − 0.02 · max(0, s − 5), 0.40, 0.95 )",
  ]),
  P("Below the diversity target D* the mutation rate rises — to 1.8 times its base value when the population has fully converged; above it the rate falls, to 0.2 times base when the population is spread uniformly. Long stagnation multiplies the rate further, and crossover gradually yields ground to mutation. The defaults used throughout the book are:"),
  SimpleTable(
    ["Parameter", "Symbol", "Default"],
    [
      ["Base mutation rate", "p_m0", "0.05"],
      ["Base crossover rate", "p_c0", "0.80"],
      ["Diversity gain and target", "g_d, D*", "0.8, 0.5"],
      ["Stagnation gain and window", "g_s, w", "1.5, 8 generations"],
      ["Mutation-rate bounds", "p_min, p_max", "0.01, 0.40"],
      ["Tournament size and elites", "k, e", "3, 2"],
    ],
    [3000, 1500, 2340],
  ),
  Blank(),
  Callout("Check that your adaptive signal moves", "An adaptive rule only helps if its inputs vary. An earlier version of this algorithm measured diversity as the number of distinct values per gene divided by the population size. With 80 chromosomes and three possible values that measure could never exceed a few percent, and the mutation rate stayed within about 0.001 of 0.068 for the whole run: adaptation had silently switched itself off. Plot the diversity and mutation traces of a run before trusting any adaptive scheme, as Figure 7.2b does."),
  H3("Long chromosomes"),
  P("On long chromosomes a per-gene rate of 0.05 disrupts many genes in every child. Setting per_gene_scaling = True reinterprets the base rate as the expected number of genes mutated per child — the classical 1/L rule — and Section 7.4 uses it for its larger network."),

  H2("5.4 Objective, fitness and selection — the math"),
  P("The case-study problem is single-sourcing network design. Suppliers s feed plants p, and plants serve distribution centers d. Each DC has weekly demand δ_d and is served entirely by one plant π(d); each supplier ships only to one plant, up to its capacity u_s. A plant is open when it serves at least one DC, and then incurs its weekly fixed cost F_p. With plant load L_p = Σ δ_d over the DCs assigned to p, the total weekly cost is"),
  Formula([
    "C = Σ_open F_p + Σ_s,p c^SP_sp · q_sp + Σ_d c^PD_π(d),d · δ_d",
    "      + λ · ( Σ_p max(0, L_p − U_p) + Σ_p shortfall_p )",
  ]),
  P("The inbound quantities q_sp are not part of the chromosome. Given the assignments, each plant buys its load from its own suppliers, cheapest first. Because every supplier serves only one plant, this greedy rule is exactly optimal — it is a fractional knapsack. U_p is plant capacity, shortfall_p is load that a plant's suppliers cannot cover, and λ = $5,000 per unit makes any infeasible design far costlier than every feasible one."),
  P("Fitness is simply C, to be minimized. Tournament selection compares costs only by rank, so the size of the penalty never distorts the selection pressure between two feasible designs."),

  H2("5.5 What makes a chromosome in this problem"),
  P("A chromosome is an integer vector of length S + D: the first S genes name each supplier's plant and the last D genes name each DC's plant. Every gene takes one of P values, so the search space holds P^(S+D) designs — 3^11 = 177,147 for the five-supplier, three-plant, six-DC case study, small enough to enumerate exactly, and 6^60 ≈ 4.9 × 10^46 for the 20-supplier network of Section 7.4."),
  P("Choosing the encoding is the most consequential modeling decision. Because every DC gene names a plant, every DC is served by construction and the algorithm only has to respect capacities. An encoding that instead gives each plant one destination can leave distribution centers unserved whenever there are fewer plants than DCs — and no amount of parameter tuning repairs an encoding that makes good designs unreachable."),
];

const ch6 = [
  H1("Chapter 6 — Implementing AGOA for Supply Network Planning"),

  H2("6.1 Code structure"),
  P("The implementation lives in poc/agoa/agoa_scm.py and is built from four pieces, each replaceable without touching the others:"),
  Bullet("SupplyNetworkProblem wraps the data and exposes breakdown() and total_cost()."),
  Bullet("AGOAConfig is one dataclass holding every parameter, including adaptive = False for a plain fixed-rate GA."),
  Bullet("run_agoa(problem, config, seed) runs the evolutionary loop and returns a RunReport."),
  Bullet("brute_force_optimum() and milp_optimum() provide the exact baselines against which every result is measured."),

  H2("6.2 Fitness function in Python"),
  P("breakdown() decodes a chromosome, routes demand through the network and returns every cost component, so that a planner can see why a design costs what it does. Condensed:"),
  CodeBlock(
`def breakdown(self, chrom):
    sup_to_plant, dc_to_plant = self.decode(chrom)
    d, P = self.data, self.n_plants
    demand = d["dc_demand"]
    load = np.bincount(dc_to_plant, weights=demand,
                       minlength=P)
    outbound = float(np.sum(demand * d["pd_cost"][
        dc_to_plant, np.arange(self.n_dcs)]))
    fixed = float(d["fixed_plant_cost"][load > 0].sum())
    inbound = shortfall = 0.0
    for p in range(P):
        if load[p] <= 0:
            continue
        sups = np.flatnonzero(sup_to_plant == p)
        order = sups[np.argsort(d["sp_cost"][sups, p])]
        remaining = load[p]
        for s in order:                  # cheapest first
            q = min(remaining, d["supplier_capacity"][s])
            inbound += q * d["sp_cost"][s, p]
            remaining -= q
        shortfall += max(0.0, remaining)
    overload = np.maximum(0.0,
                          load - d["plant_capacity"]).sum()
    penalty = self.penalty_weight * (overload + shortfall)
    return {"fixed": fixed, "inbound": inbound,
            "outbound": outbound, "penalty": penalty,
            "total": fixed + inbound + outbound + penalty}`
  ),

  H2("6.3 Selection, crossover, mutation"),
  CodeBlock(
`def _tournament_select(pop, fitness, k, rng):
    idx = rng.integers(0, len(pop), size=k)
    return pop[idx[int(np.argmin(fitness[idx]))]].copy()

def _two_point_crossover(a, b, rng):
    i, j = sorted(rng.integers(1, len(a), size=2))
    c1 = np.concatenate([a[:i], b[i:j], a[j:]])
    c2 = np.concatenate([b[:i], a[i:j], b[j:]])
    return c1, c2

def _mutate(chrom, rate, problem, rng):
    out = chrom.copy()
    mask = rng.random(len(out)) < rate
    out[mask] = rng.integers(0, problem.n_plants,
                             size=int(mask.sum()))
    return out`
  ),
  P("Every gene of this encoding takes values in the same range — a plant index — so mutation needs no gene-specific bounds, and crossover can never produce an illegal chromosome."),

  H2("6.4 The adaptive update in detail"),
  CodeBlock(
`def population_diversity(pop, n_values):
    ent = 0.0
    for j in range(pop.shape[1]):
        counts = np.bincount(pop[:, j], minlength=n_values)
        p = counts[counts > 0] / pop.shape[0]
        ent += float(-(p * np.log(p)).sum())
    return ent / (pop.shape[1] * math.log(n_values))

# after every generation:
div = population_diversity(pop, problem.n_plants)
mut = base_mut * (1 + cfg.diversity_gain
      * (cfg.diversity_target - div) / cfg.diversity_target)
if stagnation > cfg.stagnation_window:
    mut *= 1 + cfg.stagnation_gain * math.log1p(
        stagnation - cfg.stagnation_window)
mutation_rate = float(np.clip(mut, min_mut, max_mut))
crossover_rate = float(np.clip(cfg.base_crossover_rate
                 - 0.02 * max(0, stagnation - 5), 0.4, 0.95))`
  ),
  P("The run records the diversity and mutation rate of every generation in its RunReport, so the adaptation can be inspected after the fact."),

  H2("6.5 Exact baselines"),
  P("Two functions provide the exact answers against which AGOA is measured. brute_force_optimum() enumerates every chromosome of a small instance. It exploits the structure of the cost: DC assignments alone fix the plant loads, the outbound cost and the fixed cost, so the function loops over the P^S supplier assignments and evaluates all P^D DC assignments for each of them in one vectorized NumPy operation. For the 177,147 designs of the case study this takes a fraction of a second."),
  P("milp_optimum() states the same problem as a mixed-integer linear program and solves it with HiGHS through scipy.optimize.milp (Huangfu and Hall, 2018). With binary variables x_dp (DC d served by plant p), y_sp (supplier s feeds plant p) and z_p (plant p open), and continuous shipments f_sp ≥ 0:"),
  Formula([
    "min  Σ F_p z_p + Σ δ_d c^PD_pd x_dp + Σ c^SP_sp f_sp",
    "Σ_p x_dp = 1 ∀d ,   Σ_p y_sp = 1 ∀s ,   x_dp ≤ z_p",
    "f_sp ≤ u_s y_sp ,   Σ_s f_sp = Σ_d δ_d x_dp ,   Σ_d δ_d x_dp ≤ U_p z_p",
  ]),
  P("Whenever a feasible design exists, the MILP and the penalized AGOA objective share the same optimum, so the two can be compared directly. On the case-study network both return $18,715.83."),

  H2("6.6 A complete run"),
  CodeBlock(
`from poc.common import make_supply_network
from poc.agoa.agoa_scm import (SupplyNetworkProblem,
    AGOAConfig, run_agoa, brute_force_optimum)

data = make_supply_network(n_suppliers=5, n_plants=3,
                           n_dcs=6, seed=11)
problem = SupplyNetworkProblem(data=data)
report = run_agoa(problem, AGOAConfig(population_size=80,
                  generations=150), seed=0)
opt, _, n = brute_force_optimum(problem)`
  ),
  P("Running python -m poc.agoa.agoa_scm prints:"),
  CodeBlock(
`[AGOA] problem=three_tier_supply_network
       best_fitness=18715.8300 iters=150 time=0.62s
Supplier -> Plant: [0, 0, 1, 1, 0]
DC       -> Plant: [0, 0, 0, 1, 1, 0]
Open plants: 2  fixed=$4,935  inbound=$5,428.37
             outbound=$8,352.46  penalty=$0
Exhaustive optimum over 177,147 chromosomes: 18,715.83
(AGOA gap 0.000%)`
  ),
  P("AGOA's answer is the proven optimum: a feasible two-plant design with no penalty."),
];

const ch7 = [
  H1("Chapter 7 — AGOA Case Study: Mid-Sized Consumer Goods Supply Network"),

  H2("7.1 The scenario"),
  P("A mid-sized consumer-goods company operates five component suppliers, three assembly plants and six regional distribution centers, planned on a weekly horizon. Each supplier and each DC must be single-sourced — one plant per supplier, one plant per DC — because the company's contracts and warehouse systems are built that way. The question is which plants to run and how to wire the network."),
  P("The instance is synthetic but shaped by real engagements. It is produced by make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11):"),
  SimpleTable(
    ["Tier", "Units per week", "Notes"],
    [
      ["Suppliers S1–S5", "Capacity 607, 602, 1,137, 899, 972", "4,217 in total"],
      ["Plants P1–P3", "Capacity 1,601, 1,712, 1,028", "Fixed cost $2,000–6,000 per week"],
      ["DCs DC1–DC6", "Demand 539, 303, 481, 849, 583, 249", "3,004 in total"],
    ],
    [1700, 2900, 2240],
  ),
  Blank(),
  P("Shipping costs $1.00–4.00 per unit from supplier to plant and $1.50–5.00 per unit from plant to DC. Total capacity comfortably exceeds demand, but not every combination of assignments is feasible: plant P3, for instance, cannot serve DC4 and DC5 together."),

  H2("7.2 Results"),
  P("Exhaustive enumeration of all 177,147 designs, confirmed by the MILP solver, gives a proven optimum of $18,715.83 per week. AGOA with 80 chromosomes and 150 generations finds exactly this design (Figure 7.1)."),
  ...Figure("fig_7_1_network_design.png", "Figure 7.1 — The optimal design. Line widths are proportional to weekly flow; plant P3 is closed."),
  SimpleTable(
    ["Cost component", "$ per week"],
    [
      ["Fixed cost of open plants (P1, P2)", "4,935.00"],
      ["Inbound shipping", "5,428.37"],
      ["Outbound shipping", "8,352.46"],
      ["Capacity penalty", "0.00"],
      ["Total", "18,715.83"],
    ],
    [4400, 2440],
  ),
  Blank(),
  P("The optimal design consolidates production into two plants. P1 serves DC1, DC2, DC3 and DC6 — 1,572 units against 1,601 of capacity — from suppliers S1, S2 and S5; P2 serves DC4 and DC5 — 1,432 units against 1,712 — from S3 and S4. Closing P3 saves its fixed cost, and the extra shipping that consolidation causes costs less than that saving."),
  P("The design also runs P1 at 98% of capacity. A planner would want to know that before approving it, because a demand spike at any of P1's four DCs has almost nowhere to go. Surfacing such facts is why breakdown() reports every component rather than a single number."),

  H2("7.3 Adaptive versus fixed-rate GA"),
  P("Does the adaptive mechanism pull its weight? The benchmark suite (python -m poc.benchmarks) runs AGOA and two fixed-rate GAs — the same code with adaptive = False — on this instance over 20 paired seeds, each with 80 chromosomes and 150 generations:"),
  SimpleTable(
    ["Variant", "Runs at proven optimum", "Mean gap", "Worst gap", "Median gen. to optimum"],
    [
      ["AGOA (adaptive)", "18 / 20", "0.05%", "0.53%", "49.5"],
      ["Fixed-rate GA, p_m = 0.05", "6 / 20", "1.78%", "9.93%", "19"],
      ["Fixed-rate GA, p_m = 0.20", "18 / 20", "0.05%", "0.53%", "42"],
    ],
    [2140, 1300, 1000, 1000, 1400],
  ),
  Blank(),
  ...Figure("fig_7_2_agoa_convergence.png", "Figure 7.2 — (a) Share of the 20 runs that have reached the proven optimum, by generation. (b) Mutation rate and population diversity in one adaptive run."),
  P("Three observations follow. First, adaptation turns an unreliable default into a reliable algorithm: 18 successful runs out of 20 instead of 6, a difference that Section 4.7 shows is far too large to be luck. Second, a fixed rate of 0.20 does exactly as well on this instance; the two missed runs of each variant stop at the same local optimum, 0.53% above the best design. The honest pitch for AGOA is therefore robustness: it reaches the result of a well-tuned GA without anyone having to find the right rate first. Third, the low fixed rate finds the optimum sooner when it finds it at all. Adaptation spends generations exploring before it commits, which is exactly what the rising mutation rate in Figure 7.2b shows."),

  H2("7.4 How far does it scale? An honest benchmark against MILP"),
  P("The case study is small enough to enumerate. To see how AGOA behaves where enumeration is impossible, the benchmark suite also builds a network with 20 suppliers, 6 plants and 40 DCs — about 4.9 × 10^46 designs — and solves it exactly with the MILP of Section 6.5. Both GA variants use the per-gene scaling of Section 5.3, 100 chromosomes and 300 generations (30,100 evaluations), over 10 seeds:"),
  SimpleTable(
    ["Method", "Result against the proven optimum", "Time per run"],
    [
      ["MILP (HiGHS)", "Proven optimum, $131,233.82 per week", "0.9 s"],
      ["AGOA (adaptive)", "Mean gap 14.3% (best 7.8%, worst 19.7%)", "2.3 s"],
      ["Fixed-rate GA, p_m = 1/L", "Mean gap 11.7% (best 10.3%, worst 13.0%)", "2.3 s"],
    ],
    [2100, 3440, 1300],
  ),
  Blank(),
  P("On this linear model the verdict is unambiguous: the solver is faster and exact, and both GAs leave 8–20% on the table. The adaptive rule does not help at this scale either. This is not a flaw peculiar to AGOA. Plain GAs are weak on large capacity-coupled assignment problems, where good designs sit behind penalty cliffs that single-gene changes cannot cross."),
  P("So when does AGOA earn its place? When the cost model stops being linear: economies of scale in plant operating costs, tiered freight tariffs, service levels computed by a simulation, or constraints that live in another system and can only be checked by calling it. In those settings the MILP of Section 6.5 cannot be written without approximation, while AGOA needs only a function that returns a cost. The practical recipe is to write the linear core as a MILP first, keep its answer as the yardstick, and bring in AGOA for the parts of the model that the solver cannot express."),
  Callout("Lesson", "Before deploying a metaheuristic on a linear model, solve the model with a MILP solver. If the solver proves optimality within your time budget, use the solver."),
  Blank(),

  H2("7.5 Production blueprint"),
  P("Moving this proof of concept toward production involves five steps, each of which can be checked off independently."),
  Numbered("Replace make_supply_network with a loader that pulls supplier, plant and DC master data from the ERP (SAP, Oracle) through a thin adapter, keeping SupplyNetworkProblem unchanged."),
  Numbered("Solve the linear core with milp_optimum, keep its result as the baseline for every run, and log AGOA's gap to it."),
  Numbered("Wrap both behind an HTTP service (Chapter 17) with a POST /optimize endpoint that returns a RunReport as JSON."),
  Numbered("Validate inputs before they reach the optimizer: negative capacities, DCs with zero demand and total capacity below total demand should be rejected with a clear message."),
  Numbered("Schedule nightly runs; persist the chosen design, its cost breakdown and the convergence trace; and trend the best cost over weeks, because jumps signal changes in data or cost structure."),
  H3("What not to automate"),
  P("Do not apply the recommendation to the production planning system automatically. Route it through a planner who can sanity-check the decoded design, including utilization figures such as P1's 98%. Metaheuristic failure modes are rare but can be dramatic: a miscalibrated penalty weight once told the author's team to close every plant in a network, saving a theoretical $40 million a year by producing nothing."),
];

module.exports = { ch5, ch6, ch7 };
