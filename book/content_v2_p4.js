// content_v2_p4.js — Part IV: Multi-Objective Simulated Annealing (Chapters 8–9)
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank, Figure,
} = require('./helpers');

const ch8 = [
  H1("Chapter 8 — Simulated Annealing and the Pareto Front"),

  H2("8.1 The metallurgy metaphor"),
  P("Simulated annealing (SA) was introduced by Kirkpatrick, Gelatt and Vecchi in 1983 and borrows its name and its control variable — temperature — from metallurgy. A metal cooled slowly settles into a low-energy crystal; cooled quickly, it freezes into a disordered, higher-energy state. SA searches the same way. At high temperature it accepts many worse moves and wanders freely; as the temperature falls it becomes increasingly greedy and settles into a good solution."),

  H2("8.2 The single-objective algorithm"),
  P("From the current solution x_t at temperature T_t, one SA step is:"),
  Numbered("Generate a neighbor x′ by a small random change to x_t."),
  Numbered("Compute Δ = f(x′) − f(x_t)."),
  Numbered("If Δ < 0, accept x′. Otherwise accept it with probability exp(−Δ / T_t)."),
  Numbered("Cool: T_t+1 = α · T_t, with 0 < α < 1."),
  P("Accepting worse moves with a probability that shrinks as Δ grows and T falls is what lets SA escape local optima that trap a greedy search. With a slow enough cooling schedule SA provably converges to a global optimum (Section 4.3 explains why), but the schedules that guarantee it are far too slow for practice; the geometric schedule above is the standard compromise."),

  H2("8.3 From one objective to many"),
  P("Most enterprise decisions trade several objectives against each other; in freight planning the two that matter most are cost and CO₂. A plan x dominates a plan y if it is no worse on both objectives and strictly better on at least one. The plans that no other plan dominates form the Pareto front. There are three ways to make SA produce it:"),
  Bullet("Weighted sum: minimize w · cost + (1 − w) · CO₂ for one weight w, after normalizing both objectives to the range 0 to 1. One run gives one point."),
  Bullet("Weight sweep: repeat the weighted-sum run for many weights and keep the non-dominated results."),
  Bullet("Pareto archive (MOSA): accept moves by dominance rather than by a single score, and keep an external archive of every non-dominated solution seen."),
  P("SA extends to the archive form with little change because its acceptance rule is already probabilistic. A move that improves both objectives is always accepted; a move that is worse on both is accepted with the usual Boltzmann probability, using the sum of the normalized deteriorations as Δ; and a move that trades one objective for the other is accepted half of the time."),

  H2("8.4 The freight problem"),
  P("The problem is weekly mode selection on a network of freight lanes. Each lane ℓ has a distance d_ℓ, a weekly volume v_ℓ in tonnes and a delivery-time limit. Each mode m — truck, intermodal rail or air — has a cost and a CO₂ intensity per tonne-kilometer, a handling cost and CO₂ per tonne (terminal lifts and the drayage legs of intermodal rail), a speed and a fixed dwell time. Choosing mode m for lane ℓ gives"),
  Formula([
    "cost_ℓm = v_ℓ · ( d_ℓ · c_m + h_m )",
    "CO₂_ℓm = v_ℓ · ( d_ℓ · e_m + g_m )",
    "hours_ℓm = t_m + d_ℓ / speed_m   ≤  the lane's limit",
  ]),
  P("The parameters below are illustrative, with orders of magnitude consistent with published freight emission factors; production use should substitute contracted carrier rates and an accepted methodology such as the GLEC Framework."),
  SimpleTable(
    ["Mode", "$ / t·km", "kg CO₂ / t·km", "Handling $ / t", "Handling kg / t", "km / h", "Dwell h"],
    [
      ["Truck", "0.090", "0.090", "0", "0", "65", "2"],
      ["Rail (intermodal)", "0.035", "0.025", "45", "12", "40", "30"],
      ["Air", "0.950", "0.800", "80", "5", "700", "8"],
    ],
    [1540, 850, 1000, 950, 950, 750, 800],
  ),
  Blank(),
  P("Rail's per-kilometer advantage is offset by its fixed handling overhead, so rail only pays off beyond a break-even distance — and the break-even differs for each objective:"),
  Formula(["cost:   d* = 45 / (0.090 − 0.035) ≈ 818 km", "CO₂:   d* = 12 / (0.090 − 0.025) ≈ 185 km"]),
  ...Figure("fig_8_1_mode_economics.png", "Figure 8.1 — Per-tonne cost and CO₂ of truck and rail by lane distance. In the shaded band, 185–818 km, truck is cheaper but rail is cleaner."),
  P("Lanes shorter than 185 km are best by truck on both counts, and lanes longer than 818 km are best by rail on both counts — unless the delivery-time limit rules rail out, since a rail move needs at least 30 hours. Lanes in between present a genuine choice: pay more to emit less. Air is dominated on both objectives and appears only where a time limit leaves no alternative. This mix of lanes with a real trade-off, lanes with an obvious answer and lanes constrained by time is what makes the front worth computing."),

  H2("8.5 Why weighted sums miss part of the front"),
  P("A weighted-sum run can only return points that lie on the convex hull of the front, the so-called supported points. Points in the hull's dents, which may be perfectly good compromises, minimize no weighted sum for any weight (Das and Dennis, 1997). A weight sweep therefore samples the corners of the front and misses much of its interior, however many weights it tries. Chapter 9 measures how much this matters on real lanes."),

  H2("8.6 Hyperparameters and convergence"),
  P("Both objectives are normalized to the range 0 to 1 using their best and worst achievable values, so a temperature means the same thing on any network. The defaults are an initial temperature of 0.05, geometric cooling with α = 0.997 and 3,000 iterations per weighted-sum run. For comparisons, the weight sweep uses 11 weights of 1,500 iterations each and archive MOSA a single run of 16,500 iterations — the same budget of evaluations. The archive holds at most 60 points; when it overflows, the most crowded interior point, the one whose neighbors on the front are closest, is dropped."),
];

const ch9 = [
  H1("Chapter 9 — Implementing MOSA and the Weight-Sweep Frontier"),

  H2("9.1 The problem object"),
  P("TransportProblem in poc/simulated_annealing/mosa_scm.py precomputes, for every lane and mode, the weekly cost, the CO₂ and the transit time, and records which modes meet each lane's time limit. A solution is simply one mode index per lane, and evaluating it takes two table lookups:"),
  CodeBlock(
`cost_lm = tonnes * (dist * d["mode_cost_per_tkm"]
                    + d["mode_handling_cost_per_t"])
co2_lm = tonnes * (dist * d["mode_co2_kg_per_tkm"]
                   + d["mode_handling_co2_kg_per_t"])
hours_lm = d["mode_fixed_hours"] + dist / d["mode_speed_kmh"]
feasible = hours_lm <= max_transit_hours[:, None]

def evaluate(self, x):
    idx = np.arange(self.n_lanes)
    return (float(self.cost_lm[idx, x].sum()),
            float(self.co2_lm[idx, x].sum()))`
  ),

  H2("9.2 Neighbour generation"),
  P("A neighbor switches one lane that has a real choice to a different feasible mode. Infeasible modes are never proposed, so every solution SA visits meets every time limit — simpler and cheaper than penalizing violations."),
  CodeBlock(
`def _perturb(x, problem, rng):
    new = x.copy()
    for _ in range(10):
        lane = int(rng.integers(0, problem.n_lanes))
        opts = problem.options[lane]
        if len(opts) > 1:
            others = opts[opts != new[lane]]
            new[lane] = int(rng.choice(others))
            return new
    return new`
  ),

  H2("9.3 Weighted-sum SA"),
  CodeBlock(
`def score(c, e):
    nc, ne = problem.normalized(c, e)
    return config.w_cost * nc + config.w_co2 * ne

for _ in range(config.iterations):
    y = _perturb(x, problem, rng)
    yc, ye = problem.evaluate(y)
    yf = score(yc, ye)
    delta = yf - f
    if delta < 0 or rng.random() < math.exp(
            -delta / max(T, 1e-12)):
        x, f, cost, co2 = y, yf, yc, ye
        if f < best_f:
            best, best_f = x.copy(), f
    T *= config.cooling_rate`
  ),

  H2("9.4 Archive management for MOSA"),
  P("Archive MOSA keeps its current solution moving by dominance-based acceptance and records every non-dominated solution it meets. The archive update maintains two invariants — no entry dominates another, and the archive never exceeds its size limit:"),
  CodeBlock(
`def _update_archive(archive, cand, obj, max_size):
    if any(_dominates((c, e), obj)
           or (math.isclose(c, obj[0])
               and math.isclose(e, obj[1]))
           for (_, c, e) in archive):
        return archive                   # nothing new
    archive = [(x, c, e) for (x, c, e) in archive
               if not _dominates(obj, (c, e))]
    archive.append((cand.copy(), obj[0], obj[1]))
    return _crowding_trim(archive, max_size)`
  ),

  H2("9.5 The exact front: merging lanes"),
  P("A plan's cost and CO₂ are sums over lanes, and each lane's choice affects no other lane. The exact Pareto front can therefore be built one lane at a time. Start from the single point (0, 0); for each lane, add every feasible option of that lane to every point of the current front, then discard dominated points. A partial plan that is dominated after one lane can never become non-dominated later, because every later lane adds the same options to all partial plans — so the pruning loses nothing:"),
  CodeBlock(
`def exact_pareto_front(problem):
    front = np.zeros((1, 2))
    for lane, opts in enumerate(problem.options):
        pts = np.stack([problem.cost_lm[lane, opts],
                        problem.co2_lm[lane, opts]], axis=1)
        merged = (front[:, None, :]
                  + pts[None, :, :]).reshape(-1, 2)
        front = _nondominated(merged)
    return front`
  ),
  P("On the 20-lane network the exact front takes milliseconds. The same idea — exact decomposition wherever a problem separates — returns in the capstone (Chapter 19), where it handles 17 billion threshold settings."),

  H2("9.6 Measuring quality: hypervolume"),
  P("The hypervolume of a front is the area of objective space it dominates, bounded by a reference point (Zitzler and Thiele, 1999). With the reference point placed just beyond the exact front's worst cost and worst CO₂, the ratio of an approximate front's hypervolume to the exact front's hypervolume says what share of the true trade-off an algorithm recovered; 100% means all of it."),

  H2("9.7 Results"),
  P("The benchmark suite runs both approaches on two networks — a synthetic eight-site network with 28 lanes and the 20-lane CSV network of Appendix D — over 10 seeds each, with an equal budget of 16,500 evaluations:"),
  SimpleTable(
    ["Network", "Method", "Points found", "On the exact front", "Hypervolume: mean (worst)"],
    [
      ["Synthetic, 28 lanes; exact front 59 points", "Weight sweep", "8.3", "4.2", "81.2% (73.1%)"],
      ["", "Archive MOSA", "43.0", "21.6", "96.9% (94.3%)"],
      ["CSV, 20 lanes; exact front 31 points", "Weight sweep", "6.7", "6.1", "89.8% (85.7%)"],
      ["", "Archive MOSA", "29.6", "25.8", "99.5% (98.3%)"],
    ],
    [2100, 1250, 950, 1100, 1440],
  ),
  Blank(),
  ...Figure("fig_9_1_pareto_front.png", "Figure 9.1 — The CSV network's exact front (31 points), the archive MOSA and weight-sweep fronts from one seed, and the knee point."),
  P("The weight sweep does exactly what Section 8.5 predicted: it finds the corners of the front and little else, recovering 81–90% of the hypervolume. On the same budget, archive MOSA finds most of the front's points exactly and 97–99.5% of its hypervolume. For decision support the difference matters, because the interesting compromises sit in the interior."),
  P("The front also carries a business message. On the CSV network the cheapest plan costs $26,636 a week and emits 21,333 kg of CO₂; the cleanest costs $29,606 and emits 16,772 kg. The knee point — the plan closest to both ideals after normalization — costs $27,577 and emits 18,328 kg. Moving from the cheapest plan to the knee avoids about 3.0 tonnes a week at roughly $313 per tonne; going all the way to the cleanest plan avoids another 1.6 tonnes at roughly $1,300 per tonne. The front turns “how green should we be?” into a menu of priced options."),
  P("Single weighted runs land where their weights point. With w_cost = 0.9 the plan costs $26,696 a week and uses 12 truck, 7 rail and 1 air lanes; the balanced w_cost = 0.5 costs $28,732 with 6 truck and 13 rail lanes; the green w_cost = 0.1 reaches the cleanest plan, $29,606 with 4 truck and 15 rail lanes. The one air lane is Atlanta–Dallas, whose 12-hour limit no ground mode can meet."),

  H2("9.8 Production blueprint"),
  Numbered("Replace the illustrative mode table with contracted carrier rates and an accepted emission-factor methodology, and load lanes, volumes and delivery windows from the transport-management system."),
  Numbered("Compute the exact front whenever lanes remain independent; switch to archive MOSA once lane choices interact — shared capacity on a rail corridor, minimum volume commitments, or consolidation across lanes."),
  Numbered("Present planners with the front, the knee and the marginal cost per tonne between neighboring points, rather than a single recommended plan."),
  Numbered("Re-run weekly and version the mode table, so that every reported emission figure can be traced to the factors that produced it."),
];

module.exports = { ch8, ch9 };
