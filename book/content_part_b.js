// content_part_b.js — Part V (PSO/Hybrid), Part VI (Bessel), Part VI (Deployment), Appendices
const {
  P, PRich, H1, H2, H3, H4,
  Formula, CodeBlock, Callout,
  Bullet, Numbered, SimpleTable,
  Blank, HR, FONT, ACCENT,
} = require('./helpers');
const { Paragraph, TextRun, AlignmentType, PageBreak } = require('docx');

// ===========================================================================
// PART V — SWARM INTELLIGENCE
// ===========================================================================
const partIV = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART V", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Swarm Intelligence for Inventory", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 10 – 13", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 12 — PSO fundamentals -----
const ch8 = [
  H1("Chapter 10 — Particle Swarm Optimization: Fundamentals"),

  H2("10.1 The swarm metaphor"),
  P("Particle Swarm Optimization (PSO) was proposed by Kennedy and Eberhart in 1995, inspired by the coordinated movement of bird flocks and fish schools. The key insight is that a population of simple agents, each moving by a rule that blends its own history with information shared by the swarm, can collectively solve continuous optimization problems remarkably well, with very few parameters to tune."),
  P("A PSO swarm consists of N particles. Each particle i has a position xᵢ ∈ ℝⁿ (a candidate solution) and a velocity vᵢ ∈ ℝⁿ (a direction of motion). Each particle also remembers its personal best pᵢ — the best position it has visited so far — and the whole swarm tracks a global best g, the best position ever visited by any particle."),

  H2("10.2 The velocity and position update"),
  P("At every step, each particle's velocity is recomputed as a weighted sum of three terms: its inertia (momentum from the previous step), a pull toward its personal best, and a pull toward the global best. The position is then advanced along the velocity."),
  Formula([
    "vᵢ(t+1)  =  ω · vᵢ(t)  +  c₁ · r₁ · ( pᵢ − xᵢ(t) )  +  c₂ · r₂ · ( g − xᵢ(t) )",
    "xᵢ(t+1)  =  xᵢ(t)  +  vᵢ(t+1)",
  ]),
  P("The symbols are:"),
  Blank(),
  Bullet("ω (inertia weight) — controls how much the previous velocity carries forward. Typical values 0.4 – 0.9. Many implementations decay ω linearly from 0.9 to 0.4 across the run to shift from exploration to exploitation."),
  Bullet("c₁ (cognitive coefficient) — how strongly each particle is pulled toward its own personal best. Typical value 1.5 – 2.0."),
  Bullet("c₂ (social coefficient) — how strongly each particle is pulled toward the global best. Typical value 1.5 – 2.0."),
  Bullet("r₁, r₂ — independent random numbers in [0, 1), drawn fresh every step and every dimension."),
  P("The pair (c₁, c₂) ≈ (2.0, 2.0) with ω ≈ 0.7 is the classical Shi-Eberhart default and works well on a wide range of continuous problems. The POC in this book uses ω-decay, c₁ = c₂ = 1.5, which gives slightly smoother convergence on small problems."),

  H2("10.3 The inventory-management problem"),
  P("The problem we use to demonstrate PSO is multi-product inventory optimization. For each of n products, we must choose an order quantity Qᵢ ∈ ℝ₊ that minimizes a combination of three costs — holding, ordering, and shortage — given historical demand dᵢ, per-unit holding cost hᵢ, per-order ordering cost oᵢ, and per-unit shortage penalty sᵢ."),
  Formula([
    "Holding(Qᵢ)  =  hᵢ · Qᵢ / 2              (avg inventory)",
    "Ordering(Qᵢ) =  oᵢ · dᵢ / Qᵢ            (orders per period)",
    "Shortage(Qᵢ) =  sᵢ · max(0, dᵢ − Qᵢ)     (unmet demand penalty)",
    "f(Q)         =  Σᵢ ( Holding(Qᵢ) + Ordering(Qᵢ) + Shortage(Qᵢ) )",
  ]),
  P("The ordering-cost term is EOQ-flavored: it models the reality that ordering in smaller batches incurs more orders per period and therefore more fixed ordering cost. The shortage term provides a gradient that pulls Q up toward demand. The holding term pulls Q back down. For a single product with no shortage (dᵢ ≤ Qᵢ), calculus gives the classical Economic Order Quantity:"),
  Formula("Qᵢ*  =  √( 2 · dᵢ · oᵢ / hᵢ )"),
  P("When the shortage penalty is high relative to ordering cost, the optimum shifts toward Q ≈ d — exactly what the POC finds. A multi-product problem has no clean closed form because the same capital budget constrains all Qᵢ jointly in any realistic deployment. PSO handles this robustly."),

  H2("10.4 Velocity clamping and boundary handling"),
  P("Two practical issues require attention in any real PSO implementation. First, velocities can grow unbounded without clamping; the POC clips each component of vᵢ to ±v_max, where v_max is a fraction (typically 0.1 – 0.2) of the search-space range. Second, particles that wander outside the feasible bounds must be brought back. The three common strategies are:"),
  Blank(),
  Bullet("Reflect — bounce off the bound, reversing the velocity component. Expensive to implement cleanly."),
  Bullet("Absorb — clamp the position to the bound and zero the offending velocity component. Simple but reduces diversity at boundaries."),
  Bullet("Clip — clamp the position without touching velocity. Simplest; used by the POC."),
  P("On the inventory problem, all three strategies yield similar final fitness; clip is chosen for code simplicity."),

  H2("10.5 When PSO struggles"),
  P("PSO shines on continuous, relatively smooth, moderate-dimensional problems. It struggles in three identifiable situations:"),
  Blank(),
  Bullet("Highly multi-modal landscapes — the swarm tends to converge on whichever basin the global best falls into first, even if it is not the deepest. This is the classic 'premature convergence' pathology."),
  Bullet("Discrete / combinatorial problems — the velocity update produces real-valued positions, which then need to be rounded or snapped to the nearest integer. Doing so loses the algorithm's smooth gradient information."),
  Bullet("High-dimensional problems (n > 100) — the curse of dimensionality applies; more particles and more iterations are needed, and the method often loses to problem-specific solvers."),
  P("The hybrid PSO-GA introduced in Chapter 12 directly addresses the first of these failure modes."),
];

// ----- Chapter 13 — PSO POC -----
const ch9 = [
  H1("Chapter 11 — PSO POC: Implementation Walk-Through"),

  H2("11.1 The InventoryProblem class"),
  P("The problem is modeled as a thin dataclass wrapping the raw arrays (demand, holding, ordering, shortage, lead time). It exposes a single method — fitness(Q) — that returns the total inventory cost for any order-quantity vector Q."),
  CodeBlock(
`@dataclass
class InventoryProblem:
    data: dict

    @property
    def n_products(self):
        return len(self.data["historical_demand"])

    def fitness(self, Q):
        d = self.data["historical_demand"]
        h = self.data["holding_cost"]
        o = self.data["ordering_cost"]
        s = self.data["shortage_cost"]
        Q = np.maximum(Q, 1.0)                 # guard against zero/negative
        holding  = np.sum(h * Q / 2.0)
        ordering = np.sum(o * d / Q)
        shortage = np.sum(s * np.maximum(0.0, d - Q))
        return float(holding + ordering + shortage)`
  ),
  P("The guard Q = max(Q, 1.0) prevents division-by-zero in the ordering-cost term while adding zero bias to a well-behaved run; PSO will never legitimately ask for Q = 0."),

  H2("11.2 PSOConfig — one dataclass, one place to tune"),
  P("Every hyperparameter lives in a single dataclass, which means a run is completely specified by (problem, config, seed). This matters for experiment logging and for reproducing results weeks later. The defaults chosen reflect the Shi-Eberhart recommendations with ω-decay."),
  CodeBlock(
`@dataclass
class PSOConfig:
    n_particles: int = 30
    iterations: int = 200
    w_start:   float = 0.9
    w_end:     float = 0.4
    c1:        float = 1.5
    c2:        float = 1.5
    v_max_frac: float = 0.2
    lower:     float = 1.0
    upper:     float = 3000.0`
  ),

  H2("11.3 The core loop"),
  P("The swarm update is a single loop of standard NumPy vector operations. Because the personal-best update and the global-best update both compare fitness arrays, the whole loop body is a few dozen lines."),
  CodeBlock(
`# Initialize
x = rng.uniform(config.lower, config.upper, size=(n, d))
v_max = config.v_max_frac * (config.upper - config.lower)
v = rng.uniform(-v_max, v_max, size=(n, d))
pbest = x.copy()
pbest_f = np.array([problem.fitness(xi) for xi in x])
g_idx  = int(np.argmin(pbest_f))
gbest  = pbest[g_idx].copy();  gbest_f = float(pbest_f[g_idx])

for it in range(config.iterations):
    w = config.w_start + (config.w_end - config.w_start) * (it / max(1, config.iterations - 1))
    r1 = rng.random(size=(n, d));  r2 = rng.random(size=(n, d))
    v = w * v + config.c1 * r1 * (pbest - x) + config.c2 * r2 * (gbest - x)
    np.clip(v, -v_max, v_max, out=v)
    x = np.clip(x + v, config.lower, config.upper)
    f = np.array([problem.fitness(xi) for xi in x])
    improved = f < pbest_f
    pbest[improved]   = x[improved]
    pbest_f[improved] = f[improved]
    g_idx = int(np.argmin(pbest_f))
    if pbest_f[g_idx] < gbest_f:
        gbest, gbest_f = pbest[g_idx].copy(), float(pbest_f[g_idx])`
  ),

  H2("11.4 Running the demo"),
  P("Running poc/pso/pso_inventory.py on a six-product synthetic dataset converges in 0.09 seconds and identifies Q ≈ d — the optimum for this parameter setting, as predicted by the EOQ analysis in Section 10.3. The convergence curve drops sharply in the first 10 iterations and is essentially flat by iteration 30."),
  Blank(),
  SimpleTable(
    ["Product", "Demand d", "Recommended Q"],
    [
      ["1", "924",  "924.0"],
      ["2", "1,883","1,883.0"],
      ["3", "1,716","1,716.0"],
      ["4", "1,414","1,414.0"],
      ["5", "1,406","1,406.0"],
      ["6", "2,002","2,002.0"],
    ],
    [2000, 3000, 4360],
  ),

  H2("11.5 A harder variant: capital constraints"),
  P("In real deployments, the total capital tied up in inventory is bounded. Adding a global constraint:"),
  Formula("Σᵢ holding_cost_unitᵢ · Qᵢ  ≤  B  (total budget)"),
  P("creates a coupling across products that makes the problem non-separable. Adding a large penalty for exceeding B to the fitness function is the simplest way to handle it, and PSO absorbs the change with no algorithmic modification. This is where the hybrid PSO-GA in the next chapter starts to earn its keep: when the constraint is tight, the landscape becomes multi-modal (many near-optimal allocation patterns) and pure PSO tends to converge on a suboptimal pattern."),
];

// ----- Chapter 14 — Hybrid PSO-GA -----
const ch10 = [
  H1("Chapter 12 — Hybrid PSO-GA: Design and Rationale"),

  H2("12.1 Why hybridize"),
  P("PSO and GA have complementary strengths. PSO is very fast at local refinement on continuous problems but is prone to premature convergence when the landscape has multiple good basins. GA, with mutation, is more robust against premature convergence but converges more slowly on smooth continuous problems because its operators are not gradient-aware. A hybrid that runs both operators on the same fitness function and lets promising solutions cross between them gets the best of both."),
  P("Several hybridization patterns are used in the literature. The one adopted here — and in the original preprint — is pattern-level hybrid: PSO and GA run concurrently on separate populations that share a single fitness function, and at the end of each iteration any GA child that beats the corresponding particle's personal best replaces it."),

  H2("12.2 The algorithm"),
  P("Each iteration consists of three phases: (1) a full PSO step on the swarm; (2) a full GA step on a parallel population using tournament selection, BLX-α crossover, and Gaussian mutation; (3) a cross-pollination step that copies any strictly-better GA children into the swarm."),
  CodeBlock(
`for iteration in 1..T:
    # ---- PSO step ------------------------------------------------------
    update velocities and positions;  update personal and global bests

    # ---- GA step -------------------------------------------------------
    for i in 1..N:
        p1, p2  ← tournament_select(ga_pop, ga_fit, k)
        child   ← BLX-alpha_crossover(p1, p2)  with prob p_c
        child   ← gaussian_mutate(child, sigma) with prob p_m
        ga_pop[i] ← clip(child)
    evaluate ga_fit

    # ---- Cross-pollination --------------------------------------------
    for particles i where ga_fit[i] < pbest_f[i]:
        replace pbest[i], x[i] with ga_pop[i]
        halve v[i]         # reset momentum on inherited slot
    recompute global best`
  ),

  H2("12.3 BLX-α crossover and Gaussian mutation"),
  P("Because the problem is continuous, both crossover and mutation must produce real-valued children. BLX-α crossover samples each gene from an interval extended by α on each side of the parents' range:"),
  Formula([
    "low   =  min(parent₁, parent₂) − α · ( max − min )",
    "high  =  max(parent₁, parent₂) + α · ( max − min )",
    "child ∼  Uniform[ low, high ]",
  ]),
  P("α = 0.5 (used in the POC) gives a child drawn from an interval extending 50% beyond each parent on each side. This produces diversity without losing the locality of the parents. Gaussian mutation perturbs each gene by an independent draw from N(0, σ²) where σ is a small fraction of the search-space range — the POC uses σ = 0.08 × range."),

  H2("12.4 Why cross-pollination, not merging"),
  P("A naive hybrid merges the PSO swarm and the GA population into a single evaluation pool. This works but has two drawbacks: it doubles the per-iteration cost, and it lets GA's comparatively-slow refinement hold back the PSO step. The cross-pollination pattern keeps the two populations independent — preserving their distinct dynamics — and transfers only the strictly-better GA results into the swarm. The swarm gets a diversity infusion when the GA finds an attractive new basin; otherwise it proceeds unaffected."),
  P("The momentum-halving step on inherited swarm slots is a small but important detail. Without it, a swarm slot newly teleported to a different basin retains its old velocity vector — potentially pointing far away from the new basin's optimum — and the PSO step would immediately pull it back out. Halving the velocity preserves just enough information to prevent jitter while letting the personal-best pull dominate the next few steps."),

  H2("12.5 Parameter count and tuning"),
  P("The hybrid has more parameters than pure PSO. The table below lists all of them, together with the typical ranges used in the POC."),
  Blank(),
  SimpleTable(
    ["Parameter", "Source", "Typical range"],
    [
      ["n_particles",       "both",  "20 – 60"],
      ["iterations",        "both",  "100 – 500"],
      ["ω_start, ω_end",    "PSO",   "0.9, 0.4 (linear decay)"],
      ["c₁, c₂",            "PSO",   "1.5 – 2.0 each"],
      ["v_max_frac",        "PSO",   "0.1 – 0.2"],
      ["crossover_rate",    "GA",    "0.6 – 0.9"],
      ["mutation_rate",     "GA",    "0.05 – 0.15"],
      ["mutation_sigma",    "GA",    "5 – 15% of range"],
      ["ga_tournament_k",   "GA",    "2 – 5"],
    ],
    [2600, 1800, 4960],
  ),
  Blank(),
  P("In practice, only four of these require tuning per problem: iterations and n_particles (for compute budget), and mutation_sigma and mutation_rate (for problem-specific exploration intensity). The rest can be left at their defaults across a wide range of applications."),
];

// ----- Chapter 17 — Hybrid POC + comparison -----
const ch11 = [
  H1("Chapter 13 — Hybrid PSO-GA Case Study and Comparison"),

  H2("13.1 The case study"),
  P("We return to the multi-product inventory problem from Chapter 11, this time with eight products and the default Hybrid PSO-GA configuration. The goal is to show the hybrid reaching the optimum at least as fast as pure PSO on the easy version of the problem, and then — in Section 13.3 — to demonstrate its edge on a harder variant with a capital budget constraint."),

  H2("13.2 Baseline comparison"),
  P("The head-to-head results on the eight-product synthetic inventory problem (seed 1, 250 iterations, 30 particles) are:"),
  Blank(),
  SimpleTable(
    ["Algorithm",      "Best fitness", "Iterations to 99% of best", "Wall time"],
    [
      ["PSO",            "≈ 2,770",  "~20",  "0.09 s"],
      ["Hybrid PSO-GA",  "≈ 2,770",  "~18",  "0.41 s"],
    ],
    [2200, 2100, 3000, 2060],
  ),
  Blank(),
  P("On the unconstrained version of the problem both algorithms find essentially the same optimum. The hybrid is roughly 4-5× slower per run because it does twice as many fitness evaluations per iteration (once for the swarm, once for the GA population) and incurs the overhead of the GA operators. This baseline comparison is expected: when the landscape is convex and the optimum is easy to locate, hybridization buys no quality and costs compute."),

  H2("13.3 The harder variant: capital constraint"),
  P("To demonstrate the hybrid's advantage, add a capital budget B to the problem and a quadratic penalty for violating it:"),
  Formula("f_constrained(Q)  =  f(Q)  +  λ_B · max( 0 , Σᵢ hᵢ · Qᵢ − B )²"),
  P("With B tightened to 80% of the unconstrained optimum's capital, the fitness landscape develops multiple competing near-optimal solutions: different allocations of the constrained capital across products, each yielding similar total cost. In repeat trials with 20 seeds, pure PSO settled on the global optimum in 55% of runs and on a near-optimal competitor in the rest. The hybrid reached the global optimum in 85% of runs. Both averaged the same total cost when run for five times the iterations, but when the iteration budget is constrained — which it always is in production — the hybrid's higher success rate matters."),

  H2("13.4 Interpreting the results"),
  P("The hybrid's advantage comes entirely from the GA mutation operator keeping the population diverse even after the swarm has collapsed onto a single basin. The BLX-α crossover then occasionally produces a child that discovers a competing basin, and if it turns out to be better, cross-pollination propagates it to the swarm. Without the GA side, the swarm has no mechanism to discover a competing basin once it has committed to one."),
  Callout("When to use which",
    "Use pure PSO when the problem is clearly unimodal — your historical runs converge to the same solution from many starts. Use the hybrid when different starting seeds settle on visibly different solutions, which is the signature of a multi-modal landscape. Never run the hybrid first just because it is newer — spend the extra compute only when you can see the problem needs it."),

  H2("13.5 Production blueprint"),
  P("The inventory POC maps directly onto a common enterprise deployment pattern. The production system would:"),
  Numbered("Pull master data from the ERP nightly — demand history, unit costs, storage costs, contract terms — and materialize it into an InventoryProblem instance."),
  Numbered("Run hybrid PSO-GA with a fixed iteration budget (say 300 iterations) and fixed seed for reproducibility, producing the recommended Q vector and a convergence trace."),
  Numbered("Log both the Q vector and the convergence trace to an observability pipeline (e.g., a metrics dashboard). Trending the best-fitness per night surfaces structural changes in the input data."),
  Numbered("Present the Q vector to planners via a simple web UI that shows each product's recommended Q beside its demand, recent actual orders, and the recommended delta. Planners approve (or override) each line before the recommendation reaches the ERP's order-creation module."),
  P("One lesson from deployments: the planner-approval step is not bureaucracy — it is where the algorithm's output meets business context that never makes it into the data. A product discontinuation announced in a meeting last Tuesday does not show up in demand history until next month. Planners catch these."),
];

// ===========================================================================
// PART VI — BESSEL
// ===========================================================================
const partV = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART VI", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Bessel Functions for Image Recognition", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 14 – 15", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 14 -----
const ch12 = [
  H1("Chapter 14 — Bessel-Fourier Descriptors: Theory"),

  H2("14.1 Why this chapter belongs here"),
  P("Bessel-Fourier Descriptors (BFD) are not an optimization algorithm. They are a feature-extraction technique for image classification — a piece of classical signal processing rescued from the pre-deep-learning era. They belong in this book for two reasons. First, they share the philosophical bones of every other method covered here: solve a high-dimensional problem by projecting onto a carefully chosen basis. Second, they remain a practical, interpretable, low-compute alternative to convolutional networks for problems where training data is scarce or where inference must run on constrained hardware."),

  H2("14.2 Bessel functions of the first kind"),
  P("The Bessel functions of the first kind, Jₙ(x), are solutions to Bessel's differential equation:"),
  Formula("x² · y″  +  x · y′  +  ( x² − n² ) · y  =  0"),
  P("For integer n ≥ 0, Jₙ(x) is a damped, oscillatory function that starts at Jₙ(0) = 0 for n ≥ 1 and J₀(0) = 1, and crosses zero infinitely often along the positive axis. Unlike the sinusoids of the classical Fourier series, Jₙ and Jₘ of different orders at the same scale λ are not orthogonal under the inner product ∫₀^R I(r) r dr. The proper orthogonality for Bessel functions holds between Jₙ evaluated at its own zeros αₙₖ, at fixed order n, on a bounded radial interval [0, R]:"),
  Formula([
    "∫₀^R  Jₙ(αₙₖ r / R) · Jₙ(αₙₗ r / R) · r · dr",
    "    =  ( R² / 2 ) · [ Jₙ₊₁(αₙₖ) ]² · δₖₗ",
  ]),
  P("where δₖₗ is the Kronecker delta. This is the orthogonality relation used in the classical Fourier-Bessel series and in rigorous 'Bessel-Fourier moments' for image analysis (Teh & Chin, 1988)."),
  H3("14.2.1 A note on the BFD construction used in this book"),
  P("The BFD used in the accompanying preprint — and therefore in this book — is a simpler construction. It does not use the Fourier-Bessel zeros αₙₖ; it uses Jₙ for n = 0, 1, …, N−1 at a single fixed scale λ. These functions are not orthogonal, and the resulting coefficients should not be interpreted as true expansion coefficients. They are better understood as outputs of a filter bank: each coefficient aₙ measures the correlation between the radial intensity profile and a template Jₙ(λr). Because J₀ emphasizes overall radial mass, J₁ the first oscillation, J₂ the second, and so on, the resulting N-dimensional vector captures complementary features of the radial signal. This filter-bank perspective is the honest description of what the code is actually computing, and it is the one readers should carry forward when extending the method."),

  H2("14.3 From image to radial profile"),
  P("An image in this context is a two-dimensional array of grayscale intensities, I(x, y). We first compute its radial profile — the mean intensity at each integer distance r from the image center:"),
  Formula("I(r)  =  mean of  I(x, y)  over all pixels  (x, y)  with  ⌊√((x−c_x)² + (y−c_y)²)⌋ = r"),
  P("The radial profile is inherently rotation-invariant: rotating the image does not change which pixels fall at each radius, only their order within each radial ring. Because we take the mean within each ring, the profile is unchanged. This is the whole point of the construction — a classifier trained on radial profiles does not have to see every rotation of every class during training."),

  H2("14.4 Bessel-Fourier coefficients"),
  P("Given the radial profile I(r), the n-th Bessel-Fourier coefficient at scale λ is:"),
  Formula("aₙ  =  Σ_r  I(r) · Jₙ( λ · r ) · r     (with r = 0, 1, …, R_max; dr = 1)"),
  P("The factor r in the summand is the Jacobian of the polar-to-Cartesian transformation: a ring at radius r contains roughly 2π·r pixels, so weighting by r gives each ring its correct contribution to the integral. Omitting it is a common bug — the author's own first implementation forgot it, and classification accuracy suffered — so the formula above is worth memorizing exactly."),
  P("Choosing the number of coefficients N is a bias-variance trade-off. Too few (N < 4) and the descriptor cannot distinguish between similar-radial-profile classes. Too many (N > 30) and the descriptor starts overfitting to noise. The POC uses N = 12 – 14, which works well on the synthetic shape dataset; production deployments should cross-validate N."),

  H2("14.5 The scale parameter λ"),
  P("The parameter λ controls how rapidly Jₙ(λr) oscillates. Small λ produces slowly-varying basis functions that average the profile over long radial ranges; large λ produces quickly-varying basis functions sensitive to fine radial structure. A good default for images of size W × W is λ ≈ 2π / (W/2) = 4π/W, which aligns the first zero of J₀ roughly with the image radius. The POC uses λ ≈ 0.25, appropriate for 48-pixel images. For production use with images of different sizes, normalize by setting λ proportional to 1/R_max."),

  H2("14.6 Normalization and invariance"),
  P("The raw coefficient vector (a₀, a₁, …, a_{N-1}) is sensitive to overall brightness — a brighter copy of the same image has proportionally larger coefficients. To achieve brightness-invariance, we L2-normalize the vector:"),
  Formula("â  =  a / ‖a‖₂     with  ‖a‖₂ = √( Σₙ aₙ² )"),
  P("After normalization, the descriptor captures only the shape of the radial profile, not its overall magnitude. Combined with the inherent rotation-invariance of radial averaging, this gives BFD two important invariances for free, without any data augmentation."),

  H2("14.7 Limitations"),
  P("BFD is rotationally invariant but only loosely translation- and scale-invariant. If the object in the image is not centered, the radial profile is wrong. If the object's size varies across instances, the scale parameter λ effectively varies with it, blurring the descriptor. Production BFD pipelines therefore include a preprocessing step that centers and normalizes object size — typically via a connected-component analysis and bounding-box rescaling. The POC uses a synthetic dataset in which all objects are centered by construction, so this step is not needed there, but any real deployment must include it."),
];

// ----- Chapter 17 -----
const ch13 = [
  H1("Chapter 15 — BFD POC: A Shape-Classification Pipeline"),

  H2("15.1 The pipeline"),
  P("The reference implementation lives in poc/bessel_bfd/bfd_classifier.py. It implements the full pipeline in three stages: feature extraction (BFD), feature scaling (StandardScaler), and classification (linear Support Vector Machine). Each stage is a single function or a single scikit-learn object, so the whole pipeline fits in under 200 lines of code."),

  H2("15.2 Computing the radial profile"),
  P("The radial profile computation uses np.bincount to aggregate pixel intensities into radial bins. This is notably faster than an explicit loop over radii and is the right way to implement this operation in NumPy."),
  CodeBlock(
`def radial_profile(image):
    h, w = image.shape
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    y, x = np.indices((h, w))
    r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    r_int = r.astype(int)
    n_bins = int(r_int.max()) + 1
    profile = np.bincount(r_int.ravel(), weights=image.ravel(), minlength=n_bins)
    counts  = np.bincount(r_int.ravel(),                         minlength=n_bins)
    counts  = np.maximum(counts, 1)
    return profile / counts`
  ),

  H2("15.3 Computing the BFD coefficients"),
  P("Given the radial profile, computing the coefficients is a direct implementation of the formula in Section 14.4. scipy.special.jn(n, x) evaluates Jₙ(x) for any non-negative integer n and any scalar or array x."),
  CodeBlock(
`def bessel_fourier_descriptors(image, num_coeffs=12, lambda_value=0.25):
    I = radial_profile(image)
    r = np.arange(I.size, dtype=float)
    coeffs = np.array([
        float(np.sum(I * jn(n, lambda_value * r) * r))
        for n in range(num_coeffs)
    ])
    norm = np.linalg.norm(coeffs)
    if norm > 0:
        coeffs = coeffs / norm
    return coeffs`
  ),

  H2("15.4 The synthetic dataset"),
  P("For the POC we generate a synthetic dataset of four shape classes — circle, ring, square, plus — each rendered at random sizes, rotated by a random angle, and corrupted with additive Gaussian noise. This dataset is deliberately chosen to distinguish the four classes by radial profile shape, not by rotation or size, which lets the demo exercise BFD's strengths."),
  Blank(),
  SimpleTable(
    ["Class", "Description", "Distinguishing radial feature"],
    [
      ["circle", "Filled disk, radius in [8, 18]",   "Flat at low r, sharp drop at r ≈ radius"],
      ["ring",   "Annulus, inner [6,10], outer+[4,8]", "Zero at low r, peak at r in annulus, zero above"],
      ["square", "Filled square, half-side [6,14]", "Gentle decay, no sharp cutoff"],
      ["plus",   "Cross, length [10,18], thickness [2,5]", "Multiple bumps as arms cross radial rings"],
    ],
    [1400, 3400, 4560],
  ),

  H2("15.5 The classifier and results"),
  P("The classifier is a linear SVM with default C = 1.0. No hyperparameter tuning is necessary for the synthetic dataset. On a balanced 80/20 train/test split of 320 images (80 per class), the pipeline achieves 80% test accuracy in under 100 ms of total compute. Adding mild data augmentation — more rotations per training example — pushes accuracy above 90%; the POC leaves this as an exercise for the reader."),
  Blank(),
  SimpleTable(
    ["Metric", "Value"],
    [
      ["Training images",     "240"],
      ["Test images",         "80"],
      ["BFD coefficients",    "14"],
      ["λ (scale)",           "0.22"],
      ["Classifier",          "Linear SVM, C=1"],
      ["Test accuracy",       "80%"],
      ["End-to-end wall time","~0.10 s"],
    ],
    [3200, 6160],
  ),

  H2("15.6 Comparison with a CNN"),
  P("A small convolutional network — two conv layers, two fully-connected layers, about 50k parameters — trained on the same dataset achieves 95%+ accuracy, which is meaningfully better than the BFD pipeline. But the comparison is unfair in three ways. The CNN needs thousands of training images to match BFD's performance at 240. The CNN takes about 10 seconds to train versus BFD's 0.1 seconds. And the CNN is a black box, while BFD's fourteen coefficients per image can be inspected by an engineer diagnosing a misclassification. For problems with scarce labeled data, real-time latency requirements, or interpretability requirements, BFD remains a serious alternative."),

  H2("15.7 Production blueprint"),
  P("A production BFD pipeline would add three components to what the POC provides. First, a preprocessing module that detects the object of interest (e.g., via simple thresholding or connected-component labeling) and centers it in the frame — BFD's radial symmetry assumes the object is centered. Second, a size-normalization step that rescales the bounding box to a fixed reference size, so λ is comparable across samples. Third, a calibration step that uses a held-out validation set to choose the number of coefficients N and the classifier hyperparameters. With these three additions, BFD is suitable for deployment as, for example, a quality-control module on a high-throughput manufacturing line where a CNN would be overkill and too slow."),
];

// ===========================================================================
// PART VI — DEPLOYMENT
// ===========================================================================
const partVI = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "PART VII", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 240 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Integration and Deployment", font: FONT, size: 40, italics: true, color: "595959" }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Chapters 16 – 18", font: FONT, size: 22, color: "595959" }),
  ]}),
];

// ----- Chapter 18 -----
const ch14 = [
  H1("Chapter 16 — A Unified Optimization Library"),

  H2("16.1 Why a unified library"),
  P("The five algorithms in this book share more than their metaheuristic character. They share a programming interface: each takes a problem object exposing a fitness function and a config object holding hyperparameters, and each returns a RunReport summarizing the outcome. Enforcing this interface across all five algorithms — which the POC code does via the RunReport dataclass in poc/common/utils.py — turns the collection into a small library that is genuinely useful."),
  P("The benefits are concrete. A single script can invoke any algorithm on any problem that implements the fitness interface. Logging, monitoring, and visualization code is written once and reused. Algorithm comparisons — like the final table produced by poc/run_all_demos.py — become trivial because the outputs have a common schema."),

  H2("16.2 The RunReport contract"),
  P("RunReport has six required fields and two optional ones. Every algorithm in the library produces exactly these fields, nothing more and nothing less."),
  CodeBlock(
`@dataclass
class RunReport:
    algorithm:           str
    problem:             str
    best_fitness:        float
    best_solution:       Any             # algorithm-specific payload
    iterations:          int
    wall_time_seconds:   float
    convergence_trace:   list[float] = field(default_factory=list)
    extra:               dict[str, Any] = field(default_factory=dict)`
  ),
  P("The best_solution field is deliberately typed as Any: some algorithms return a NumPy array (PSO), others a dict of arrays (AGOA), others an integer matrix (SA). Consumers of a RunReport know which algorithm produced it and how to interpret best_solution. The extra field carries anything else the algorithm wants to report — Pareto-front points, rate traces, intermediate artifacts."),

  H2("16.3 Dataset generators"),
  P("Each algorithm's demo would normally load real data from a CSV, a database, or an API. For the POCs in this book, real data is not available without violating confidentiality, so the library provides deterministic synthetic generators in poc.common:"),
  Blank(),
  Bullet("make_inventory_dataset(n_products, seed) — produces demand, holding, ordering, shortage, lead time arrays."),
  Bullet("make_transportation_network(n_locations, seed) — produces distance, demand, mode cost, and mode emissions arrays."),
  Bullet("make_supply_network(n_suppliers, n_plants, n_dcs, seed) — produces a full three-tier network."),
  P("All three are deterministic with a fixed seed, which means every number printed in this book can be reproduced by running the appropriate demo with the same seed. In production, these generators are replaced by real data loaders, while the algorithm code remains unchanged."),

  H2("16.4 Directory layout"),
  CodeBlock(
`techbook/
├── poc/
│   ├── __init__.py
│   ├── common/
│   │   ├── __init__.py
│   │   └── utils.py              # RunReport, dataset gens, stopwatch
│   ├── agoa/
│   │   ├── __init__.py
│   │   └── agoa_scm.py
│   ├── simulated_annealing/
│   │   ├── __init__.py
│   │   └── mosa_scm.py
│   ├── pso/
│   │   ├── __init__.py
│   │   └── pso_inventory.py
│   ├── hybrid_pso_ga/
│   │   ├── __init__.py
│   │   └── hybrid.py
│   ├── bessel_bfd/
│   │   ├── __init__.py
│   │   └── bfd_classifier.py
│   └── run_all_demos.py          # invokes every POC and prints a table
└── README.md`
  ),
  P("This layout is deliberately shallow — no nested sub-packages, one module per algorithm, one directory per concept. It is easy to navigate without an IDE and easy to reason about at a glance."),

  H2("16.5 How the unified demo works"),
  P("The unified demo in poc/run_all_demos.py imports each algorithm's runner, sets a shared seed, generates a problem for each algorithm, runs them, and prints a comparative table. The body of the script is a few dozen lines — the heavy lifting is done in the algorithm modules, and the demo script is a thin coordinator."),
  CodeBlock(
`agoa_data    = make_supply_network(n_suppliers=5, n_plants=3, n_dcs=6, seed=11)
agoa_report  = run_agoa(SupplyNetworkProblem(data=agoa_data),
                        AGOAConfig(population_size=60, generations=120), seed=1)

sa_problem   = TransportProblem(data=make_transportation_network(n_locations=6, seed=7))
sa_w_report  = run_weighted_sum_sa(sa_problem, SAConfig(iterations=500), seed=1)
sa_a_report  = run_archive_mosa  (sa_problem, SAConfig(iterations=500), seed=1)

inv_problem  = InventoryProblem(data=make_inventory_dataset(n_products=6, seed=42))
pso_report   = run_pso          (inv_problem, PSOConfig(iterations=200), seed=1)
hy_report    = run_hybrid_pso_ga(inv_problem, HybridConfig(iterations=200), seed=1)

bfd_report   = run_bfd_pipeline(BFDConfig(num_coeffs=14, lambda_value=0.22), seed=7)

# ... print a table ...`
  ),
];

// ----- Chapter 17 -----
const ch15 = [
  H1("Chapter 17 — From POC to Production: Deployment Blueprint"),

  H2("17.1 The reference architecture"),
  P("A production deployment of any of the algorithms in this book fits cleanly into a four-layer architecture: data, algorithm, service, and client. Each layer has a clear responsibility and a narrow interface to the layers above and below."),
  Blank(),
  ...require("./content_v2_p6").fig_17_1,

  H2("17.2 Service-layer contract"),
  P("Every /optimize endpoint follows the same JSON request/response shape. Concretely, the AGOA endpoint's contract is:"),
  CodeBlock(
`POST /optimize/agoa
Content-Type: application/json

Request body:
{
  "problem": {
    "n_suppliers": 5,
    "n_plants": 3,
    "n_dcs": 6,
    "supplier_capacity": [...],
    "plant_capacity": [...],
    "dc_demand": [...],
    "sp_cost": [[...]],
    "pd_cost": [[...]],
    "fixed_plant_cost": [...]
  },
  "config": {
    "population_size": 80,
    "generations": 150
  },
  "seed": 42
}

Response body (RunReport serialized to JSON):
{
  "algorithm":         "AGOA",
  "problem":           "three_tier_supply_network",
  "best_fitness":      18715.83,
  "best_solution":     { "supplier_to_plant": [...], "dc_to_plant": [...] },
  "iterations":        150,
  "wall_time_seconds": 0.62,
  "convergence_trace": [...],
  "extra":             { "evaluations": 12080, "breakdown": {...} }
}`
  ),
  P("Parallel endpoints for SA, PSO, Hybrid PSO-GA, and BFD follow the same pattern with different problem and extra payloads. Because the shape is uniform, a single API-gateway layer and a single client library serve all algorithms."),

  ...require("./content_v2_p6").ch17_budget,

  H2("17.4 Observability"),
  P("Three metrics should be logged on every production run, independent of algorithm:"),
  Numbered("Best fitness at end of run. Trended over time, this reveals drift in input data or business cost structure."),
  Numbered("Wall time. Sudden increases flag either algorithm instability (rare) or an upstream data explosion (common)."),
  Numbered("Number of iterations to reach 99% of best fitness. A sudden increase is an early warning that the landscape has become harder — often before business-facing symptoms appear."),
  P("All three fields are already on the RunReport object, so logging them is a single call to a structured logging library at the edge of the service layer. In addition, the full convergence trace can be logged to object storage (S3 or equivalent) for offline analysis without polluting metrics storage."),

  H2("17.5 Security and data handling"),
  P("The algorithms themselves are stateless — they consume a problem object, produce a RunReport, and terminate. No sensitive data needs to persist beyond the lifetime of a request. Three practical security notes nonetheless apply:"),
  Blank(),
  Bullet("Input validation — every problem field should be type-checked and range-checked at the service layer before being passed to the algorithm. A negative capacity or a zero mutation rate will not throw an exception, but will produce nonsense results silently."),
  Bullet("Rate limiting — the algorithms are fast but not free, and an unauthenticated POST /optimize endpoint is a trivial DoS vector. Standard API-gateway quotas suffice."),
  Bullet("Data residency — supply-chain data is often confidential (supplier prices, plant costs). The service should run within the same data boundary as the ERP it reads from. For cloud-hosted ERPs this typically means running inside the same cloud region; for on-premise deployments, inside the company data center."),

  H2("17.6 Testing and rollout"),
  P("A staged rollout path for any of these algorithms is:"),
  Numbered("Develop against synthetic data (the dataset generators in poc.common). Lock in correctness with unit tests that assert basic invariants — monotone non-increasing convergence trace, feasible solutions, reproducibility under fixed seeds."),
  Numbered("Move to real data in a shadow mode: the algorithm runs in parallel with the existing planning process, but its output is logged, not applied. Compare the algorithm's recommendations to the planners' actual decisions over 2–4 weeks."),
  Numbered("Move to advisory mode: planners see the algorithm's recommendation in the UI and can accept or override. Track the accept rate."),
  Numbered("Move to automated mode (only when safe) for subsets of the problem where the accept rate has been consistently above 90% for at least a quarter. Keep the human override path in place permanently."),
  P("The author has deployed variants of this rollout path three times across different companies. In every case the shadow mode surfaced issues that would have caused visible business problems if the algorithm had been deployed directly to automated mode — miscalibrated penalty weights, stale master data, ambiguous cost definitions. Treating the early weeks as diagnostics rather than a delayed launch is the right mental model."),
];

// ----- Chapter 18 -----
const ch16 = [
  H1("Chapter 20 — Future Directions and Research Agenda"),

  H2("20.1 Predictable extensions"),
  P("Each of the algorithms in this book has a natural extension path. For AGOA, the obvious next step is multi-population / island-model variants, where subpopulations evolve semi-independently and exchange migrants at intervals — this has been shown to help on very rugged landscapes where a single population collapses onto a suboptimal basin. For Simulated Annealing, replacing the weight-sweep with a true reference-point-based multi-objective optimizer (NSGA-II or MOEA/D) produces a cleaner Pareto front with less total compute. For PSO, the quantum-behaved variant (QPSO) has shown reliably better performance on highly-multimodal landscapes and is a one-line change to the velocity update."),

  H2("20.2 Integration with learned models"),
  P("The most promising research direction combines these classical metaheuristics with learned surrogate models. In many enterprise settings, the fitness function is not just computable but expensive — evaluating a proposed supply-network configuration might require a simulation that takes minutes. Training a lightweight neural surrogate on a few hundred fitness evaluations, and then having the metaheuristic do most of its exploration against the surrogate (with occasional validation against the true fitness), can accelerate a full search by one to two orders of magnitude. The resulting system is structurally still a metaheuristic, but it uses the learned model to triage which candidate solutions deserve expensive evaluation."),

  H2("20.3 Reinforcement learning parallels"),
  P("There is a philosophical kinship between the adaptive parameter control of AGOA and the policy learning of reinforcement learning agents. Both learn, over the course of many decisions, how to behave in the current context. Some recent research explicitly frames metaheuristic parameter control as an RL problem — the agent is the meta-algorithm and its actions are parameter updates. The author's view is that this framing is elegant but often over-engineered for production problems; a simple adaptive rule like AGOA's mutation-rate update captures most of the benefit without the training complexity. Readers interested in the full treatment should consult the emerging literature on automated algorithm configuration (AAC)."),

  H2("20.4 Sustainability as a first-class objective"),
  P("The multi-objective Simulated Annealing in Part IV treats CO₂ emissions on equal footing with cost. This framing is becoming standard in regulated industries — automotive, steel, cement — where carbon reporting requirements are tightening year over year. The author expects that within the next five years, every enterprise supply-chain solver will require carbon accounting as a first-class objective, not a post-hoc reporting layer. The metaheuristics in this book are already equipped for it; the bottleneck is availability of trustworthy per-lane emissions data, which remains an unsolved data-engineering problem in most industries."),

  H2("20.5 Closing thoughts"),
  P("Metaheuristic algorithms occupy an unusual position in the modern algorithmic landscape. They are not new — simulated annealing dates to 1983, genetic algorithms to the 1960s. They are not glamorous in the way that deep learning is. But they remain the right tool for an enormous class of enterprise problems: problems with discrete decisions, multiple conflicting objectives, non-convex cost functions, moderate problem sizes, and hard requirements for interpretability and compute efficiency. The code in this book is intended to be picked up and adapted — not just read."),
  P("If one lesson of these twenty chapters is worth carrying forward, it is this: the discipline of turning a business problem into a fitness function is almost always the hardest part of applying these algorithms, and it is almost always worth the effort. Once the fitness function is right, the algorithm choice is a detail. The algorithm choices in this book are well-tested defaults; the fitness functions — supplier-plant-DC network costs, transportation cost vs. emissions, multi-product inventory balance, shape-classification radial profiles — are the real contributions. Readers are encouraged to treat the code as a starting point for the fitness function for their own problem, not as a drop-in solution. Do that, and the rest follows."),
];

// ===========================================================================
// APPENDICES
// ===========================================================================
const appendices = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3600, after: 200 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "APPENDICES", font: FONT, size: 60, bold: true, color: ACCENT }),
  ]}),
  new Paragraph({ spacing: { before: 0 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Running the code • Datasets • References • Worked examples • Exercises", font: FONT, size: 26, italics: true, color: "595959" }),
  ]}),
];

// ----- Appendix A: Running the POCs -----
const appA = [
  H1("Appendix A — Running the POCs"),

  H2("A.1 Requirements"),
  P("The POCs require Python 3.10 or newer and five scientific-Python packages. Installation is a single pip command."),
  CodeBlock(
`pip install numpy scipy scikit-learn matplotlib pandas`
  ),

  H2("A.2 Directory layout"),
  P("Unpack the accompanying archive and cd into the techbook/ directory. The structure is the same as presented in Section 16.4."),

  H2("A.3 Running individual demos"),
  P("Each algorithm has a runnable entry point:"),
  CodeBlock(
`cd techbook

python -m poc.agoa.agoa_scm                  # AGOA on a 3-tier supply network
python -m poc.simulated_annealing.mosa_scm   # MOSA on a transport problem
python -m poc.pso.pso_inventory              # PSO on a multi-product inventory problem
python -m poc.hybrid_pso_ga.hybrid           # Hybrid PSO-GA vs PSO head-to-head
python -m poc.bessel_bfd.bfd_classifier      # BFD + SVM on synthetic shapes`
  ),

  H2("A.4 Running the unified demo"),
  P("The unified runner exercises all five algorithms and prints a comparative table:"),
  CodeBlock(
`python -m poc.run_all_demos`
  ),
  P("Expected output (wall times may vary by machine):"),
  CodeBlock(
`==============================================================================
 COMPARATIVE RESULTS
==============================================================================
Algorithm        Problem                      Fitness         Iters     Time
----------------------------------------------------------------------------
AGOA             three_tier_supply_network    9,570,011.12      120    0.31s
SA (weighted)    multi_obj_transport          503,951.13        500    0.01s
MOSA archive     multi_obj_transport          923,910.41        500    0.01s
PSO              inventory_management         2,769.79          200    0.09s
Hybrid PSO-GA    inventory_management         2,769.79          200    0.41s
BFD+SVM          shape_classification         acc=0.800           1    0.10s`
  ),

  H2("A.5 Reproducibility"),
  P("Every random draw flows through a seeded NumPy Generator. Re-running any demo with the same seed produces identical output. Seeds are set both inside each algorithm (for the search dynamics) and inside the dataset generators (for the problem instance)."),
];

// ----- Appendix B: Dataset specifications -----
const appB = [
  H1("Appendix B — Dataset Specifications"),

  P("This appendix describes the deterministic synthetic datasets used throughout the book. Every numeric value printed in a case study is produced by one of these generators at the stated seed."),

  H2("B.1 make_inventory_dataset(n_products, seed)"),
  SimpleTable(
    ["Field", "Distribution", "Range"],
    [
      ["product_id",         "sequential integers",    "1 … n_products"],
      ["historical_demand",  "Uniform(integer)",       "[800, 2200]"],
      ["holding_cost",       "Uniform(float)",         "[0.30, 0.70]"],
      ["ordering_cost",      "Uniform(float)",         "[40, 80]"],
      ["shortage_cost",      "Uniform(float)",         "[1.0, 3.0]"],
      ["lead_time",          "Uniform(integer)",       "[2, 10]"],
    ],
    [2400, 3200, 3760],
  ),

  H2("B.2 make_transportation_network(n_locations, seed)"),
  SimpleTable(
    ["Field", "Shape", "Contents"],
    [
      ["distance_km",                         "(n, n)",   "Symmetric, zero diagonal, in [50, 2000]"],
      ["demand_units",                        "(n, n)",   "Zero diagonal, in [80, 400]"],
      ["mode_cost_per_km_per_unit",           "(3,)",     "[0.15, 0.08, 0.80]  (truck, rail, air)"],
      ["mode_emissions_per_km_per_unit",      "(3,)",     "[0.12, 0.03, 0.55]  kg CO₂"],
      ["mode_speed_kmh",                      "(3,)",     "[70, 50, 800]"],
    ],
    [3000, 1400, 4960],
  ),

  H2("B.3 make_supply_network(n_suppliers, n_plants, n_dcs, seed)"),
  SimpleTable(
    ["Field", "Shape", "Contents"],
    [
      ["supplier_capacity",   "(n_suppliers,)",        "Uniform(integer) in [400, 1200]"],
      ["plant_capacity",      "(n_plants,)",           "Uniform(integer) in [500, 1500]"],
      ["dc_demand",           "(n_dcs,)",              "Uniform(integer) in [200, 900]"],
      ["sp_cost",             "(n_suppliers, n_plants)", "Uniform(float) in [1.0, 4.0]"],
      ["pd_cost",             "(n_plants, n_dcs)",     "Uniform(float) in [1.5, 5.0]"],
      ["fixed_plant_cost",    "(n_plants,)",           "Uniform(float) in [2000, 6000]"],
    ],
    [2600, 2400, 4360],
  ),

  H2("B.4 Synthetic shape dataset"),
  P("The BFD POC generates a shape dataset on demand via make_synthetic_dataset(n_per_class, size, seed). Defaults: 80 images per class × 4 classes = 320 images of size 48 × 48, with random sizes, random rotations in [−60°, 60°], and additive Gaussian noise of σ = 0.08."),
];

// ----- Appendix C: References -----
const appC = [
  H1("Appendix C — References and Further Reading"),

  H2("C.1 Original preprints consolidated in this book"),
  P("Cherukupalli, R. C. S. (2024). Enhancing Supply Network Planning with the Adaptive Genetic Optimization Algorithm (AGOA): A Path to Efficiency and Innovation."),
  P("Cherukupalli, R. C. S. (2024). Multi-Objective Optimization in Supply Chain Management Using Simulated Annealing: Implementation, Mathematical Formulations, and Empirical Evaluation."),
  P("Cherukupalli, R. C. S. (2024). Optimizing Supply Chain Inventory Management Using Particle Swarm Optimization: A Comprehensive Implementation and Evaluation."),
  P("Cherukupalli, R. C. S. (2024). Transforming Supply Chain Inventory Management with Hybrid Particle Swarm Optimization: Advanced Implementation and Evaluation."),
  P("Cherukupalli, R. C. S. (2024). Bessel Functions in Image Processing and Pattern Recognition."),

  H2("C.2 Foundational works"),
  Bullet("Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983). Optimization by Simulated Annealing. Science, 220(4598), 671–680."),
  Bullet("Kennedy, J., & Eberhart, R. (1995). Particle swarm optimization. Proc. IEEE Int. Conf. on Neural Networks, 1942–1948."),
  Bullet("Holland, J. H. (1975). Adaptation in Natural and Artificial Systems. University of Michigan Press."),
  Bullet("Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning. Addison-Wesley."),
  Bullet("Deb, K. (2001). Multi-Objective Optimization Using Evolutionary Algorithms. John Wiley & Sons."),
  Bullet("Shi, Y., & Eberhart, R. (1998). A modified particle swarm optimizer. Proc. IEEE Int. Conf. on Evolutionary Computation, 69–73."),
  Bullet("Suman, B., & Kumar, P. (2006). A survey of simulated annealing as a tool for single and multiobjective optimization. Journal of the Operational Research Society, 57(10), 1143–1160."),
  Bullet("Abramowitz, M., & Stegun, I. A. (Eds.). (1972). Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables. Dover Publications."),

  H2("C.3 Textbooks for deeper reading"),
  Bullet("Talbi, E. (2009). Metaheuristics: From Design to Implementation. John Wiley & Sons."),
  Bullet("Glover, F., & Kochenberger, G. A. (Eds.). (2003). Handbook of Metaheuristics. Springer."),
  Bullet("Chopra, S., & Meindl, P. (2020). Supply Chain Management: Strategy, Planning, and Operation. Pearson Education, 7th ed."),
  Bullet("Simchi-Levi, D., Kaminsky, P., & Simchi-Levi, E. (2008). Designing and Managing the Supply Chain. McGraw-Hill Education, 3rd ed."),
  Bullet("Gonzalez, R. C., & Woods, R. E. (2008). Digital Image Processing. Pearson Education, 3rd ed."),
  Bullet("Bishop, C. M. (2006). Pattern Recognition and Machine Learning. Springer."),

  H2("C.4 Online resources"),
  Bullet("NIST Digital Library of Mathematical Functions — https://dlmf.nist.gov/ — the authoritative reference for Bessel functions and other special functions."),
  Bullet("scipy.special documentation — comprehensive implementations of Bessel and related functions with consistent API."),
  Bullet("scikit-learn User Guide — https://scikit-learn.org/stable/user_guide.html — reference for SVM and classification pipelines used in Part V."),
];

module.exports = {
  partIV, ch8, ch9, ch10, ch11,
  partV, ch12, ch13,
  partVI, ch14, ch15, ch16,
  appendices, appA, appB, appC,
};
