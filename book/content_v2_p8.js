// content_v2_p8.js — Part VIII: Capstone (Chapters 18–19)
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank, Figure,
} = require('./helpers');

const ch18 = [
  H1("Chapter 18 — Margin Leak Finder: Deterministic Detection"),

  H2("18.1 The question"),
  P("The capstone brings the book's threads together on one business question: where did we lose money this week that we should not have lost? The Margin Leak Finder is a micro-application from the author's Value Lens work on SAP-based order-to-cash data. It examines every sales-order line in a reporting week, explains any margin shortfall against what the line should have earned, and turns material shortfalls into cases a commercial reviewer can act on: an excessive discount, an unjustified manual price override, a cost increase that was not passed on, an absorbed freight charge, a price that ignored a valid customer agreement, or a price taken from an expired or wrong-customer agreement."),
  P("This chapter describes the deterministic core that decides whether money was lost. Chapter 19 turns to the computational-intelligence question the core leaves open: how strict its detection thresholds should be. The financial rules below are a demonstration policy — not customer-approved accounting logic — and are labeled as such throughout, exactly as the design itself requires."),

  H2("18.2 Design principles"),
  P("Four principles, fixed before any code was written, shape everything else:"),
  Numbered("Authoritative numbers come from deterministic code. Every amount is computed in integer cents by versioned, testable functions; no language model performs arithmetic, evaluates a threshold or assigns a severity."),
  Numbered("Missing is not zero. A missing cost, a failed read or an ambiguous agreement blocks the line with an explicit issue; it never becomes a silent zero loss or an empty success."),
  Numbered("Every number is traceable. Cases keep their canonical inputs, signed results and source references, together with the versions of the policy and rules that produced them."),
  Numbered("Access is read-only and narrow. The system reads business facts through a small set of named tools; it never writes to SAP, posts, deletes or executes a recommendation."),

  H2("18.3 Architecture"),
  ...Figure("fig_18_1_trust_architecture.png", "Figure 18.1 — The Margin Leak Finder's trust architecture. Shaded steps form the deterministic core; the agent can explain a detected case but cannot change any number."),
  P("Source facts reach the application only through five read-only business tools exposed over the Model Context Protocol (MCP): sales_order.search, sales_order.get, pricing.get, cost.get and price_agreement.get. In the demonstration build they sit on a mock SAP adapter over synthetic fixtures; replacing the adapter with a real connector leaves everything above it unchanged. Retrieved facts are normalized and validated, the calculation and detection engines run, and cases are persisted with an audit trail for review."),
  P("A bounded AI agent may investigate a case after it exists. It can make at most three additional authorized tool reads, with one retry. Its output is restricted to hypotheses, observations and suggested review actions that cite verified evidence, and any numeric claim it makes must bind to a value the deterministic engine has already computed. The agent explains; the code decides."),

  H2("18.4 Reference price and the price waterfall"),
  P("Each line's expected unit price comes from reference-price selection. A price agreement is eligible when its customer, material and currency match the line and the transaction instant falls within its validity window, start inclusive and end exclusive. Exactly one eligible agreement sets the expected price. If none is eligible, the demonstration fallback applies: list price less an authorized 10% discount. If more than one is eligible, the line is blocked as ambiguous."),
  P("The charged price is then traced through a waterfall of four stages:"),
  SimpleTable(
    ["Stage", "Symbol", "Definition"],
    [
      ["Expected (reference) price", "P_ref", "Eligible agreement price, or list × (1 − 10%)"],
      ["After recorded discount", "P_disc", "List × (1 − recorded discount), rounded to the cent"],
      ["After manual override", "P_ovr", "The override price if one was entered, else P_disc"],
      ["Final charged price", "P_fin", "The unit price actually charged"],
    ],
    [2300, 900, 3640],
  ),
  Blank(),

  H2("18.5 The signed margin bridge"),
  P("With quantity q, reference cost C_ref, current cost C_cur, and the line's charge cost and charge recovery, the expected and actual margins are"),
  Formula(["E = (P_ref − C_ref) · q", "A = (P_fin − C_cur) · q − (charge cost − charge recovery)"]),
  P("and their difference splits exactly into five signed components — discount, override, residual price, cost and charge:"),
  Formula([
    "E − A = (P_ref − P_disc)·q + (P_disc − P_ovr)·q + (P_ovr − P_fin)·q",
    "        + (C_cur − C_ref)·q + (charge cost − charge recovery)",
  ]),
  P("The identity holds by construction, and the code asserts it to the cent on every line. Components are signed, so a favorable cost movement offsets an adverse discount. Only the final net is clamped: leakage = max(0, E − A). Summing only the positive components would double-count, and the design explicitly forbids it; the negative control GC-N01 in Section 18.7 exists to prove that the engine does not."),
  P("Arithmetic follows the demonstration policy exactly: integer cents, integer quantities, percentage prices rounded to the cent before multiplication with ties rounded away from zero, and an illustrative annualized exposure of 52 times the weekly leakage — labeled as an illustration, never as recovered money or a forecast."),

  H2("18.6 Rules, severity, coverage and patterns"),
  SimpleTable(
    ["Rule", "Triggers when (demonstration thresholds)"],
    [
      ["MLF-R-01 Net leakage", "Net leakage ≥ $50; creates the financial case"],
      ["MLF-R-02 Excessive discount", "Discount component ≥ $50"],
      ["MLF-R-03 Manual override", "Override component ≥ $50"],
      ["MLF-R-04 Cost increase", "Cost component ≥ $50"],
      ["MLF-R-05 Charge absorption", "Charge component ≥ $50"],
      ["MLF-R-06 Wrong customer price", "Residual component ≥ $50 although an eligible agreement set the reference"],
      ["MLF-R-07 Invalid agreement applied", "Residual component ≥ $50 and the applied agreement is expired or out of scope"],
      ["MLF-R-08 Repeated customer", "Three or more flagged lines for one customer in the week"],
      ["MLF-R-09 Repeated material", "Three or more flagged lines for one material in the week"],
    ],
    [2700, 4140],
  ),
  Blank(),
  P("R-01 decides whether a financial case exists; R-02 to R-07 attach causes to it; R-08 and R-09 link cases into patterns after the complete scan, without adding their exposure to any total a second time. Severity follows the leakage: LOW from $50, MEDIUM from $100 and HIGH from $200. Coverage records how much of the expected evidence is present — order line, pricing trace, cost snapshot, and a supporting event or justification — multiplied by the share of applicable rule checks completed, rounded half up. The review queue sorts by severity, then leakage, then transaction date, then a stable identifier, so the same inputs always produce the same order."),

  H2("18.7 The golden catalogue"),
  P("The design fixes its expected results before implementation: a golden catalogue of fifteen synthetic order lines and two negative controls, each with its exact expected margins, leakage, rules and severity. Every line is 10 units at a $100 list price with a $60 reference cost, and differs from that default in one respect:"),
  SimpleTable(
    ["Case", "Scenario", "E", "A", "Leakage", "Rules", "Severity"],
    [
      ["GC-01", "Normal profitable line", "$300", "$300", "$0", "—", "—"],
      ["GC-02", "Excessive discount (20%)", "$300", "$200", "$100", "R-01, R-02", "MEDIUM"],
      ["GC-03", "Override without justification", "$300", "$200", "$100", "R-01, R-03", "MEDIUM"],
      ["GC-04", "Cost rose to $70", "$300", "$200", "$100", "R-01, R-04", "MEDIUM"],
      ["GC-05", "Freight charge absorbed", "$300", "$240", "$60", "R-01, R-05", "LOW"],
      ["GC-06", "Charged below valid agreement", "$350", "$250", "$100", "R-01, R-06", "MEDIUM"],
      ["GC-07", "Expired agreement applied", "$300", "$150", "$150", "R-01, R-07", "MEDIUM"],
      ["GC-08", "Other customer's agreement", "$300", "$100", "$200", "R-01, R-07", "HIGH"],
      ["GC-09 ×3", "Repeated customer, discount", "$300", "$200", "$100 each", "R-01, R-02; R-08", "MEDIUM"],
      ["GC-10 ×3", "Repeated material, cost", "$300", "$200", "$100 each", "R-01, R-04; R-09", "MEDIUM"],
      ["GC-11", "Legitimate low-margin agreement", "$20", "$20", "$0", "—", "—"],
      ["GC-N01", "Discount offset by cheaper cost", "$300", "$300", "$0", "—", "—"],
      ["GC-N02", "Current cost missing", "—", "—", "—", "Blocked", "—"],
    ],
    [880, 2000, 600, 600, 850, 1110, 800],
  ),
  Blank(),
  P("Across the fifteen business lines the run must produce exactly 13 cases, an expected margin of $4,270, an actual margin of $2,860, flagged leakage of $1,410 and an illustrative annualized exposure of $73,320; one HIGH, eleven MEDIUM and one LOW case; two patterns of three cases and $300 each; and full coverage for every case except GC-03, whose missing justification leaves it at 75%. The controls matter as much as the cases: GC-11 is a genuinely low margin that must not be flagged, GC-N01 must net to zero rather than report $100, and GC-N02 must block rather than report a zero loss."),
  ...Figure("fig_18_2_bridge.png", "Figure 18.2 — Signed bridge components of every flagged golden case, and of the offset control GC-N01, whose adverse discount and favorable cost cancel."),

  H2("18.8 The reference implementation"),
  P("poc/value_lens/margin_leak.py implements the core in a few hundred lines of standard-library Python, including the golden fixtures and an automatic check against every expected value. The heart of it is the bridge, shown here condensed; all amounts are integer cents:"),
  CodeBlock(
`p_disc = pct_price(line.list_price, line.recorded_discount_bp)
p_ovr = (line.override_price
         if line.override_price is not None else p_disc)
q = line.qty
charge_net = line.charge_cost - line.charge_recovery
bridge = {
    "discount":       (p_ref - p_disc) * q,
    "override":       (p_disc - p_ovr) * q,
    "residual_price": (p_ovr - line.final_price) * q,
    "cost":           (line.current_cost - line.ref_cost) * q,
    "charge":         charge_net,
}
expected = (p_ref - line.ref_cost) * q
actual = ((line.final_price - line.current_cost) * q
          - charge_net)
assert expected - actual == sum(bridge.values())
leakage = max(0, sum(bridge.values()))`
  ),
  P("python -m poc.value_lens.margin_leak prints the review queue — GC-08 first as the only HIGH case, GC-05 last as the only LOW — both patterns and the run totals, and finishes by confirming that every golden check passes. The whole run takes well under a hundredth of a second. The production application is planned in TypeScript; a small independent implementation like this one is valuable precisely because it shares no code with the production build and can serve as a second oracle for its golden tests."),
];

const ch19 = [
  H1("Chapter 19 — Calibrating Detection with Multi-Objective Search"),

  H2("19.1 The calibration question"),
  P("The detection core of Chapter 18 flags every line whose leakage reaches $50. That threshold is a demonstration default, and in production it embodies a trade-off. Set it low and reviewers drown in small cases, many of which they dismiss as legitimate — an approved concession not yet in the agreement data, a one-off goodwill gesture. Set it high and real leakage slips through. Different customers and causes deserve different thresholds: a strategic account's discount exceptions are often pre-approved, while a cost increase that was not passed on is rarely anything but leakage. Choosing the thresholds is a two-objective optimization problem."),

  H2("19.2 Formulation"),
  P("The decision variables are eight thresholds on a $25 grid from $50 to $500: a minimum net leakage for each customer tier (strategic, key, standard) and a minimum component for each cause (discount, override, cost, charge, agreement price). A line in tier t whose leakage has cause c is flagged when its leakage clears both of its thresholds, that is, when it reaches max(T_t, T_c). Given a history of reviewed cases, two objectives are minimized:"),
  Bullet("f₁, the number of cases that reviewers dismissed as legitimate but that the thresholds would still raise — wasted review effort;"),
  Bullet("f₂, the confirmed leakage, in dollars, that the thresholds would miss."),
  P("The grid holds 19^8 ≈ 17 billion settings. Because a line's flag depends on the larger of two thresholds, tiers and causes are coupled: the problem does not split into independent pieces the way the freight lanes of Chapter 9 did."),

  H2("19.3 A reviewed history"),
  P("Real review outcomes are confidential, so the chapter uses a synthetic history built to have realistic structure. Over 52 weeks, 400 order lines a week are drawn across three tiers — 20% strategic, 30% key and 50% standard — of which 12%, 9% and 7% respectively carry an adverse variance. Causes are drawn with tier-specific probabilities and amounts from a skewed distribution starting at $50. Each case's chance of being legitimate follows a logistic model: highest for strategic customers and for discounts and overrides, lowest for cost increases, and falling as the amount grows. The result is 1,873 lines a year that the current $50 policy flags, of which reviewers dismiss 33%. Weeks 1–39 are used for calibration and weeks 40–52 are held out."),

  H2("19.4 An exact front by decomposition"),
  P("Coupled does not mean hopeless. Fix the three tier thresholds, and the five cause thresholds become independent: each cause's contribution to f₁ and f₂ depends only on its own threshold. For each of the 19³ = 6,859 tier settings the five causes can therefore be merged exactly, as the lanes were in Chapter 9, and the union of the resulting fronts, cleaned of dominated points, is the exact Pareto front over all 17 billion settings. It has 227 points and takes about four seconds to compute. In outline:"),
  CodeBlock(
`fronts = []
for tiers in itertools.product(range(K), repeat=3):
    F = np.zeros((1, 2))                 # (dismissed, missed)
    for cause in range(5):
        opts = option_table(cause, tiers)  # K x 2 table
        merged = (F[:, None, :] + opts[None]).reshape(-1, 2)
        F = merged[nondominated(merged)]
    fronts.append(F)
exact_front = nondominated_union(fronts)`
  ),

  H2("19.5 MOSA on the same problem"),
  P("Archive MOSA from Part IV, run over the eight thresholds with 20,000 evaluations, finds fronts of 70–76 points that cover 90–96% of the exact front's hypervolume in under a second, over three seeds. On this formulation the exact method is the one to ship. MOSA becomes necessary as soon as the model grows couplings that break the decomposition: per-customer thresholds, pattern rules that count cases across causes, or a weekly reviewer-capacity limit whose peak depends on every threshold at once. Having the exact front for the simpler version is what makes it possible to trust MOSA on the richer one."),

  H2("19.6 Results and a decision rule"),
  P("A front of 227 settings is a menu, not a decision. A simple business rule picks from it: accept missing at most a given share of confirmed leakage, and among the settings that satisfy it, choose the one with the fewest dismissed cases."),
  SimpleTable(
    ["Missed leakage allowed", "Dismissed cases, training", "Dismissed cases, hold-out", "Missed on hold-out"],
    [
      ["2%", "−15%", "−12%", "2.9%"],
      ["5%", "−28%", "−28%", "7.1%"],
      ["10%", "−45%", "−43%", "10.8%"],
      ["20%", "−66%", "−58%", "21.7%"],
    ],
    [1700, 1750, 1750, 1640],
  ),
  Blank(),
  ...Figure("fig_19_1_calibration_front.png", "Figure 19.1 — The exact front of detection settings on the training weeks, the archive MOSA front, the current $50 policy and the settings chosen by three decision rules."),
  P("Under the 5% rule, the chosen setting raises the strategic-tier floor to $100 and the key-tier floor to $75, keeps standard customers at $50, and sets cause floors of $75 for discounts, overrides, charges and agreement prices while leaving cost increases at $50. On the held-out weeks it removes 28% of dismissed cases at the price of missing 7.1% of confirmed leakage — somewhat more than the 5% it was calibrated for, as out-of-sample results usually are. That gap between training and hold-out is the reason to always report both."),

  H2("19.7 Governance"),
  P("Calibration never runs inside the detection path. It runs offline on reviewed history and produces candidate configurations with their measured trade-offs. A named business owner chooses one, and it becomes a new, versioned detection configuration with new golden expectations — exactly what Chapter 18's design demands of any change to thresholds. No model selects thresholds at run time, and no calibration result changes a number on an existing case. Re-calibrate on a fixed cadence — quarterly is a sensible default — and monitor the dismissal rate in between: a rising rate is the signal that the thresholds have drifted away from the business."),

  H2("19.8 What the capstone teaches"),
  P("The Margin Leak Finder is small, but it carries the book's argument in miniature. Deterministic code owns every number that matters, and AI is confined to explanation. Computational intelligence is applied where judgment is genuinely required — how strict detection should be — and it is measured against an exact answer before anyone trusts it. And the tool is chosen honestly: an exact decomposition where the problem allows it, a metaheuristic where it does not."),
];

module.exports = { ch18, ch19 };
