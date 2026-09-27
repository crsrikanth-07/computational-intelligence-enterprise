// content_v2_p5.js — Part V: Swarm Intelligence for Inventory (Chapters 10–13)
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank, Figure,
} = require('./helpers');

const ch10 = [
  H1("Chapter 10 — Particle Swarm Optimization: Fundamentals"),

  H2("10.1 The swarm metaphor"),
  P("Particle swarm optimization (PSO) was proposed by Kennedy and Eberhart in 1995, inspired by the coordinated movement of bird flocks and fish schools. Each particle is a candidate solution with a position and a velocity. It remembers the best position it has visited — its personal best — and the swarm shares the best position any particle has found — the global best. At every step, each particle flies toward a blend of the two."),

  H2("10.2 The velocity and position update"),
  Formula(["v_i ← w · v_i + c₁ · r₁ ⊙ (p_i − x_i) + c₂ · r₂ ⊙ (g − x_i)", "x_i ← x_i + v_i"]),
  P("Here r₁ and r₂ are vectors of uniform random numbers, ⊙ is element-wise multiplication, the coefficients c₁ = c₂ = 1.5 weigh the pulls toward the personal and global bests, and the inertia w falls linearly from 0.9 to 0.4 over the run (Shi and Eberhart, 1998), so that the swarm explores early and refines late."),

  H2("10.3 The inventory problem: a (Q, r) policy"),
  P("The demonstration problem is multi-product inventory control under a continuous-review (Q, r) policy, the standard textbook model for items with steady but uncertain demand. Whenever a product's inventory position falls to its reorder point r, an order of Q units is placed, which arrives after the lead time L. Each product has annual demand D, weekly demand standard deviation σ, ordering cost K per order, holding cost h per unit per year and backorder cost p per unit short. Demand over the lead time has mean μ_L and standard deviation σ_L = σ · √(L in weeks). The expected annual cost is"),
  Formula([
    "C(Q, r) = K · D/Q  +  h · (Q/2 + r − μ_L)  +  p · (D/Q) · σ_L · G(z)",
    "z = (r − μ_L) / σ_L ,     G(z) = φ(z) − z · (1 − Φ(z))",
  ]),
  P("The three terms are the ordering cost, the holding cost of cycle and safety stock, and the expected backorder cost; G is the standard normal loss function, the expected shortfall per order cycle measured in units of σ_L. A larger Q means fewer orders and fewer exposures to stockout but more inventory; a larger r means more safety stock and fewer backorders. For n products the decision vector has 2n entries — 16 for eight products."),
  P("For a single product the optimum satisfies two classical conditions (Hadley and Whitin, 1963), which the exact solver of Chapter 11 uses:"),
  Formula(["P(stockout) = 1 − Φ(z) = h · Q / (p · D)", "Q = √( 2D · (K + p · σ_L · G(z)) / h )"]),
  P("Products are independent in this model, so the exact optimum can be found product by product. That is deliberate: it lets every PSO result be measured against the true optimum. In production, shared constraints — warehouse capacity, a working-capital budget, supplier minimums — couple the products, the product-by-product solution no longer applies, and a method that needs only the total cost becomes the practical tool."),

  H2("10.4 A harder variant: quantity discounts"),
  P("Suppliers often cut the unit price of every unit once an order reaches a break quantity. With two breaks per product, the price — and with it the purchase cost D · c and the holding cost, which is a percentage of price — drops at each break. The cost curve becomes saw-toothed (Figure 10.1): smooth within each price tier, but jumping down at every break."),
  ...Figure("fig_10_1_discount_curve.png", "Figure 10.1 — Annual cost of one product with two price breaks, relative to buying at list price, with the reorder point re-optimized for every Q. The star marks the optimum, at the second break."),
  P("Each product now has up to three local optima, one per tier, and which tier is best differs from product to product. With eight products the joint landscape has 3^8 = 6,561 combinations of tier basins, and a swarm that collapses into the wrong basin for even one product tends to stay there. This multimodal landscape is what the hybrid algorithm of Chapter 12 was designed for."),

  H2("10.5 Velocity clamping and boundary handling"),
  P("Two practical issues matter in any real implementation. Velocities can grow without limit, so each component is clamped to 20% of its dimension's range. Positions can leave the search box, so they are clipped back to it after every step. Because Q and r live on very different scales — Q up to ten times the economic order quantity (EOQ), r within a few standard deviations of μ_L — both limits are set per dimension from problem.bounds()."),

  H2("10.6 When PSO struggles"),
  P("PSO shines on continuous, reasonably smooth problems of moderate dimension. It struggles when the swarm converges before it has found the right basin — premature convergence — which becomes more likely as dimensions grow and the landscape fragments. On the eight-product base model, a swarm of 30 particles with 200 iterations finds the exact optimum in 15 of 20 runs; the other five stop short, one of them $4,251 a year above the optimum. On the discount variant it almost never finds the optimum exactly. Chapter 13 measures both in detail."),
];

const ch11 = [
  H1("Chapter 11 — PSO POC: Implementation Walk-Through"),

  H2("11.1 The InventoryProblem class"),
  P("The model lives in poc/pso/pso_inventory.py as a small dataclass. Its constructor derives the lead-time statistics and the EOQ from the raw data, and product_costs() evaluates the formula of Section 10.3 for every product at once:"),
  CodeBlock(
`def product_costs(self, Q, r):
    Q = np.maximum(Q, 1.0)
    z = (r - self.mu_L) / self.sigma_L
    disc = self.discount_rate(Q)        # 0 unless discounts
    h = self.h * (1.0 - disc)
    cost = (self.K * self.D / Q
            + h * (Q / 2.0 + r - self.mu_L)
            + self.p * (self.D / Q) * self.sigma_L
              * normal_loss(z))
    if self.use_discounts:
        cost = cost + self.D * self.price * (1.0 - disc)
    return cost

def fitness(self, x):
    n = self.n_products
    return float(self.product_costs(x[:n], x[n:]).sum())`
  ),
  P("bounds() defines the search box: Q from 1 to ten times the EOQ, which covers every price break, and r from μ_L − 2σ_L to μ_L + 5σ_L."),

  H2("11.2 PSOConfig — one dataclass, one place to tune"),
  CodeBlock(
`@dataclass
class PSOConfig:
    n_particles: int = 30
    iterations: int = 200
    w_start: float = 0.9
    w_end: float = 0.4
    c1: float = 1.5
    c2: float = 1.5
    v_max_frac: float = 0.2    # per-dimension clamp`
  ),
  P("A run is completely specified by the triple (problem, config, seed), which is what makes every result in this book reproducible."),

  H2("11.3 The core loop"),
  CodeBlock(
`lo, hi = problem.bounds()
x = rng.uniform(lo, hi, size=(n, d))
v_max = cfg.v_max_frac * (hi - lo)
for it in range(cfg.iterations):
    frac = it / max(1, cfg.iterations - 1)
    w = cfg.w_start + (cfg.w_end - cfg.w_start) * frac
    r1, r2 = rng.random((n, d)), rng.random((n, d))
    v = (w * v + cfg.c1 * r1 * (pbest - x)
               + cfg.c2 * r2 * (gbest - x))
    v = np.clip(v, -v_max, v_max)
    x = np.clip(x + v, lo, hi)
    f = np.array([problem.fitness(xi) for xi in x])
    better = f < pbest_f
    pbest[better], pbest_f[better] = x[better], f[better]
    g = int(np.argmin(pbest_f))
    if pbest_f[g] < gbest_f:
        gbest, gbest_f = pbest[g].copy(), float(pbest_f[g])`
  ),

  H2("11.4 The exact optimum"),
  P("exact_optimum() solves each product separately. For a given Q, the optimal reorder point follows directly from the first condition of Section 10.3; the remaining one-dimensional search over Q uses a bounded scalar minimizer. With discounts, the search runs once per price tier — with Q restricted to that tier and the tier's discounted holding cost — and the cheapest tier wins."),
  CodeBlock(
`def _best_r(problem, i, Q, h):
    ratio = min(h * Q / (problem.p[i] * problem.D[i]),
                1.0 - 1e-12)
    return (problem.mu_L[i]
            + problem.sigma_L[i] * norm.isf(ratio))`
  ),

  H2("11.5 Running the demo"),
  P("python -m poc.pso.pso_inventory runs a 30-particle swarm for 200 iterations on five synthetic products and compares its answer with the exact optimum:"),
  SimpleTable(
    ["Product", "EOQ", "Q exact", "Q PSO", "r exact", "r PSO"],
    [
      ["1", "397.6", "443.3", "443.3", "1,066.0", "1,066.0"],
      ["2", "453.3", "476.7", "476.7", "482.9", "482.9"],
      ["3", "493.0", "523.6", "523.6", "456.4", "456.4"],
      ["4", "764.2", "806.9", "806.9", "860.2", "860.2"],
      ["5", "361.5", "388.2", "388.2", "403.3", "403.3"],
    ],
    [1100, 1100, 1150, 1150, 1170, 1170],
  ),
  Blank(),
  P("The total annual cost is $38,410.83, identical to the exact optimum to within 0.0001%. Two features of the answer are worth noticing. Every optimal Q is 5–12% above the EOQ: backorders are risked once per order cycle, so fewer, larger orders reduce the exposure. And every reorder point sits above expected lead-time demand; the difference is the safety stock, sized by the trade-off between holding and backorder costs rather than by an arbitrary service-level target."),

  H2("11.6 When the swarm gets stuck"),
  P("The same code does not always do this well. Appendix D.3 runs it on the eight-product CSV dataset with seed 42 and 300 iterations. Seven products come out exactly right, but for Module-F the swarm settles on Q = 450 and r = 502 instead of the optimal 472 and 335, costing $1,774 a year more than necessary. Nothing in the run's convergence trace would have warned a planner; only the comparison with the exact optimum reveals it. Chapter 13 shows how the hybrid algorithm avoids this failure."),
];

const ch12 = [
  H1("Chapter 12 — Hybrid PSO-GA: Design and Rationale"),

  H2("12.1 Why hybridize"),
  P("PSO and genetic algorithms fail in complementary ways. A swarm refines quickly but tends to collapse onto one basin: once every particle is near the global best, velocities shrink and exploration stops. A GA refines slowly on continuous problems, but its mutation and crossover keep proposing points far from the current population. The No Free Lunch theorem (Section 3.5) says that no single method wins everywhere; a hybrid tries to inherit the strengths of both."),

  H2("12.2 The algorithm"),
  P("Each iteration of the hybrid runs three phases:"),
  Numbered("A PSO step: the swarm moves exactly as in Chapter 11, and the personal and global bests are updated."),
  Numbered("A GA step on a parallel population of the same size: tournament selection, BLX-α crossover with probability 0.7, and Gaussian mutation of each gene with probability 0.1. The GA population evolves independently of the swarm, which keeps it diverse after the swarm has converged."),
  Numbered("Cross-pollination: when the GA child in slot i beats particle i's personal best, it replaces that particle's position and personal best, and the particle's velocity is halved so that the newcomer is not flung away by momentum it did not earn."),
  P("The GA population starts from the same random points as the swarm but never receives the swarm's solutions. An option, ga_uses_swarm_bests = True, lets GA parents also be drawn from the swarm's personal bests. It converges faster but explores less, and on the discount problem of Chapter 13 it performs worse, so it is off by default."),

  H2("12.3 BLX-α crossover and Gaussian mutation"),
  P("Because the problem is continuous, both operators produce real-valued children. BLX-α crossover (Eshelman and Schaffer, 1993) samples each gene of the child uniformly from the interval spanned by the two parents, extended on each side by α times its width:"),
  Formula(["child_j ~ U( min(a_j, b_j) − α·Δ_j ,  max(a_j, b_j) + α·Δ_j ) ,   Δ_j = |a_j − b_j| ,  α = 0.5"]),
  P("Gaussian mutation then adds noise with a standard deviation of 8% of each dimension's range to a gene with probability 0.1. Children are clipped to the search box."),

  H2("12.4 Why cross-pollination, not merging"),
  P("A naive hybrid pools the swarm and the GA population into one population. That destroys what makes each useful: GA offspring replace particles wholesale, the swarm loses its momentum structure, and the pooled population converges as fast as the swarm alone. Slot-wise cross-pollination is conservative by design — a GA child enters the swarm only when it beats the particle it replaces — so good discoveries propagate while both populations keep their own dynamics."),

  H2("12.5 Evaluation budgets"),
  P("The hybrid evaluates two populations every iteration, the swarm and the GA children, so 30 particles for 200 iterations cost 12,030 fitness evaluations — twice as many as plain PSO with the same settings. Comparing the two at equal iterations would hand the hybrid a double budget and inflate its apparent advantage. Every comparison in Chapter 13 therefore pits the hybrid against PSO with twice as many particles (60 × 200, 12,060 evaluations), as Section 4.7 recommends."),

  H2("12.6 Parameter count and tuning"),
  SimpleTable(
    ["Parameter", "Default", "Typical range"],
    [
      ["Particles and GA population", "30 and 30", "20–60"],
      ["Iterations", "200", "100–500"],
      ["Inertia w", "0.9 falling to 0.4", "constant 0.7 to decreasing"],
      ["c₁, c₂", "1.5, 1.5", "1.0–2.0"],
      ["Velocity clamp", "20% of range", "10–30%"],
      ["Crossover rate", "0.7", "0.5–0.9"],
      ["BLX α", "0.5", "0.3–0.5"],
      ["Mutation rate and σ", "0.1 and 8% of range", "0.05–0.2 and 5–15%"],
      ["Tournament size", "3", "2–5"],
    ],
    [2600, 2000, 2240],
  ),
  Blank(),
  P("The hybrid has nine parameters to PSO's six, but the defaults above were used unchanged for every result in this book."),
];

const ch13 = [
  H1("Chapter 13 — Hybrid PSO-GA Case Study and Comparison"),

  H2("13.1 The case study"),
  P("The comparison uses eight synthetic products, make_inventory_dataset(8, seed=42), so the decision vector has 16 entries. Two versions of the problem are solved: the base (Q, r) model of Section 10.3, whose exact optimum is $59,798.23 a year, and the quantity-discount variant of Section 10.4, whose exact optimum is $5,490,829.20 a year including purchase cost. In the discount optimum, three products order at their first price break and five at their second — a mix that no single rule of thumb would produce."),
  P("Every algorithm runs on the same 20 seeds (paired, Section 4.7). Plain PSO appears twice: with its default budget (30 particles × 200 iterations, 6,030 evaluations) and with the hybrid's budget (60 × 200, 12,060 evaluations)."),

  H2("13.2 The base model at equal budgets"),
  SimpleTable(
    ["Algorithm", "Evaluations", "Runs at optimum (±$1)", "Mean excess", "Worst excess"],
    [
      ["PSO 30 × 200", "6,030", "15 / 20", "$494", "$4,251"],
      ["PSO 60 × 200", "12,060", "16 / 20", "$363", "$2,183"],
      ["Hybrid PSO-GA 30 × 200", "12,030", "20 / 20", "$0", "$0"],
    ],
    [2140, 1100, 1400, 1100, 1100],
  ),
  Blank(),
  P("Doubling PSO's budget barely helps — its failures are premature convergence, not lack of time — while the hybrid finds the exact optimum in every run. For a planner, the worst case matters more than the mean: with plain PSO, one run in twenty leaves thousands of dollars a year on the table without any visible sign that it has done so."),

  H2("13.3 Quantity discounts at equal budgets"),
  SimpleTable(
    ["Algorithm", "Evaluations", "Within $100 of optimum", "Mean excess", "Median", "Worst"],
    [
      ["PSO 30 × 200", "6,030", "1 / 20", "$3,968", "$2,931", "$14,161"],
      ["PSO 60 × 200", "12,060", "5 / 20", "$2,291", "$1,932", "$7,510"],
      ["Hybrid PSO-GA 30 × 200", "12,030", "7 / 20", "$837", "$184", "$2,734"],
    ],
    [1900, 1000, 1200, 950, 900, 890],
  ),
  Blank(),
  P("On the multimodal landscape no method is reliably exact within 12,000 evaluations. The excess costs are small beside $5.5 million of annual spend, but not beside the ordering and holding costs being optimized. At equal budgets the hybrid cuts PSO's mean excess by almost two-thirds and its median by 90%, and its worst run, $2,734, costs less than half of PSO's worst, $7,510."),

  H2("13.4 Interpreting the results"),
  ...Figure("fig_13_1_pso_vs_hybrid.png", "Figure 13.1 — Median excess over the exact optimum against fitness evaluations, over 20 seeds: (a) base model, (b) quantity-discount variant. Log scale, offset by $1 so that zero can be shown."),
  P("The convergence curves show where the difference comes from. All three methods improve at a similar rate early on. PSO then flattens: its particles have converged, some of them into the wrong price tier for one or more products. The hybrid keeps improving, because its GA population is still spread across tiers and cross-pollination keeps injecting children that land in better basins. The advantage comes from the GA's diversity, not from extra evaluations."),
  P("Single runs can mislead in either direction. In the unified demo of Chapter 16, seed 1 happens to leave PSO $3,807 above the optimum and the hybrid only $4.67 above it; with other seeds the gap is smaller or even reversed. The conclusions above rest on 20 paired seeds, not on any one run."),

  H2("13.5 When to use which"),
  Callout("When to use which", "Use plain PSO when the problem is smooth and unimodal, so that repeated runs from different seeds agree. Use the hybrid when different seeds settle on visibly different answers — the signature of a multimodal landscape — or when the cost of a bad run is high. When products are independent, as in this chapter's model, solve them exactly instead, and reserve the metaheuristics for the coupled problems that production brings."),
  Blank(),

  H2("13.6 Production blueprint"),
  Numbered("Pull demand history, lead times, costs and supplier price breaks from the ERP nightly and build an InventoryProblem."),
  Numbered("Solve independent products exactly with exact_optimum; run the hybrid on the coupled problem — shared budget, warehouse space, supplier minimums — and use the independent optimum as a reference point."),
  Numbered("Run several seeds and compare them; disagreement is a signal to lengthen the run or to review the data."),
  Numbered("Present each recommended Q and r beside the current policy and its expected annual saving, and let planners approve or override every line before it reaches the ERP's replenishment settings."),
  P("One lesson from deployments: the planner-approval step is not bureaucracy. It is where the algorithm meets context the data lacks — a product about to be discontinued, a supplier about to change its price breaks."),
];

module.exports = { ch10, ch11, ch12, ch13 };
