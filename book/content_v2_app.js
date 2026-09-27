// content_v2_app.js — Appendices A–E and back matter
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank,
} = require('./helpers');

// ---------------------------------------------------------------- Appendix A
const appA = [
  H1("Appendix A — Running the Code"),
  H2("A.1 Requirements"),
  P("The code needs Python 3.10 or newer and five scientific packages; SciPy must be version 1.9 or newer for its MILP solver. From the repository root:"),
  CodeBlock(`pip install -r requirements.txt`),
  P("requirements.txt sets minimum versions of numpy, scipy, scikit-learn, pandas and matplotlib, plus pytest for the test suite. Run every command from the repository root so that the poc package imports resolve."),
  H2("A.2 Directory layout"),
  P("The layout of the repository is shown in Section 16.4."),
  H2("A.3 Running individual demos"),
  SimpleTable(
    ["Chapters", "Command"],
    [
      ["5–7  AGOA", "python -m poc.agoa.agoa_scm"],
      ["8–9  Multi-objective SA", "python -m poc.simulated_annealing.mosa_scm"],
      ["10–11  PSO", "python -m poc.pso.pso_inventory"],
      ["12–13  Hybrid PSO-GA", "python -m poc.hybrid_pso_ga.hybrid"],
      ["14–15  Bessel-Fourier features", "python -m poc.bessel_bfd.bfd_classifier"],
      ["15  Descriptor tuning", "python -m poc.bessel_bfd.tuning"],
      ["18  Margin Leak Finder", "python -m poc.value_lens.margin_leak"],
      ["19  Threshold calibration", "python -m poc.value_lens.threshold_calibration"],
    ],
    [2500, 4340],
  ),
  Blank(),
  H2("A.4 The unified demo, worked examples and benchmarks"),
  CodeBlock(
`python -m poc.run_all_demos     # every method once
python -m poc.worked_examples   # Appendix D, about 20 s
python -m poc.benchmarks        # multi-seed tables, ~4 min
python book/make_figures.py     # every figure in the book`
  ),
  H2("A.5 Tests"),
  CodeBlock(`python -m pytest`),
  P("The suite checks the exact baselines against each other, the approximate methods against the exact baselines, the Margin Leak Finder against its golden catalogue, and the reproducibility of every runner. It completes in about a minute."),
  H2("A.6 Reproducibility"),
  P("Every random draw flows through a seeded numpy.random.Generator passed into the runner; nothing uses global random state. Running any command twice with the same seed gives identical results on the same software versions. Wall times — and, rarely, last-digit floating-point results — can differ across machines and library versions. The numbers in this book were produced with Python 3.12, NumPy 2.4 and SciPy 1.17."),
];

// ---------------------------------------------------------------- Appendix B
const appB = [
  H1("Appendix B — Dataset Specifications"),
  P("All generators live in poc/common/utils.py, are seeded, and return a dictionary of NumPy arrays."),
  H2("B.1 make_supply_network"),
  P("Signature: make_supply_network(n_suppliers=4, n_plants=3, n_dcs=5, seed=11, capacity_slack=1.25). The case study of Chapter 7 calls it with 5 suppliers, 3 plants and 6 DCs."),
  SimpleTable(
    ["Field", "Range", "Meaning"],
    [
      ["supplier_capacity", "500–1,300", "Units per week per supplier"],
      ["plant_capacity", "1,000–2,000", "Units per week per plant"],
      ["dc_demand", "200–900", "Units per week per distribution center"],
      ["sp_cost", "$1.00–4.00", "Cost per unit, supplier to plant"],
      ["pd_cost", "$1.50–5.00", "Cost per unit, plant to DC"],
      ["fixed_plant_cost", "$2,000–6,000", "Weekly fixed cost of an open plant"],
    ],
    [2100, 1600, 3140],
  ),
  Blank(),
  P("For large networks, supplier and plant capacities are scaled up — never down — so that each tier's total is at least capacity_slack times total demand, and fixed costs scale with plant size."),
  H2("B.2 make_transportation_network"),
  P("Signature: make_transportation_network(n_locations=8, seed=7, lane_density=0.5). Sites are placed uniformly in a 1,500 × 900 km region and each pair becomes a lane with probability lane_density. Road distance is 1.25 times the straight line; weekly volumes are 5–40 tonnes; delivery limits are drawn from 12, 24, 48, 72 and 120 hours with probabilities of 10%, 20%, 30%, 20% and 20%, and relaxed to the fastest mode's transit time if no mode could meet them. The mode parameters are FREIGHT_MODES in poc/common/utils.py (Section 8.4)."),
  H2("B.3 make_inventory_dataset"),
  P("Signature: make_inventory_dataset(n_products=5, seed=42)."),
  SimpleTable(
    ["Field", "Range"],
    [
      ["annual_demand", "52 × a weekly mean of 150–450 units"],
      ["weekly_demand_std", "20–40% of the weekly mean"],
      ["lead_time_days", "3–14 days"],
      ["unit_price", "$15–60"],
      ["holding_cost", "25% of unit price per year"],
      ["ordering_cost", "$40–90 per order"],
      ["shortage_cost", "40–100% of unit price per unit backordered"],
      ["break_qty", "Two breaks, at 2.0–3.5 and 5.0–8.0 times the EOQ"],
      ["discount", "0.2–0.8% at the first break, 1.0–2.5% at the second"],
    ],
    [2400, 4440],
  ),
  Blank(),
  H2("B.4 make_synthetic_dataset"),
  P("Signature: make_synthetic_dataset(n_per_class=80, size=48, seed=0), in poc/bessel_bfd/bfd_classifier.py. Circles have radius 8–17 pixels; rings an inner radius of 6–9 and a width of 4–7; squares a half-side of 6–13; plus signs an arm length of 10–17 and a half-thickness of 2–4. Every image is rotated by a uniform random angle between −60° and 60°, corrupted with Gaussian noise of standard deviation 0.08 and clipped to the range 0 to 1."),
  H2("B.5 CSV datasets"),
  SimpleTable(
    ["File (poc/datasets/)", "Contents"],
    [
      ["suppliers.csv, plants.csv, distribution_centers.csv", "5 suppliers, 3 plants and 6 DCs with capacities, demand and fixed costs"],
      ["sp_cost_matrix.csv, pd_cost_matrix.csv", "Shipping cost per unit on every link"],
      ["transport_lanes.csv, transport_modes.csv", "20 freight lanes among ten US cities; the mode table of Section 8.4"],
      ["inventory_sample.csv", "8 products, generated by build_datasets.py with seed 2026"],
      ["bfd_features_sample.csv", "Radial descriptors of 8 sample images"],
    ],
    [3100, 3740],
  ),
  Blank(),
  H2("B.6 Capstone data"),
  P("golden_fixtures() in poc/value_lens/margin_leak.py defines the fifteen business lines, the two controls and the price agreements of Section 18.7. simulate_history() in poc/value_lens/threshold_calibration.py generates the reviewed history of Section 19.3."),
];

// ---------------------------------------------------------------- Appendix C
const appC = [
  H1("Appendix C — References and Further Reading"),
  H2("C.1 Original preprints"),
  Bullet("Cherukupalli, R. C. S. (2024). Adaptive Genetic Optimization Algorithm (AGOA) for Supply Chain Management. SSRN preprint, June 2024. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4869973"),
  Bullet("Cherukupalli, R. C. S. (2024). Multi-Objective Simulated Annealing (MOSA) for Supply Chain Optimization. Preprint."),
  Bullet("Cherukupalli, R. C. S. (2024). Particle Swarm Optimization for Inventory Management. Preprint."),
  Bullet("Cherukupalli, R. C. S. (2024). Hybrid PSO-GA Algorithm for Enhanced Supply Chain Optimization. Preprint."),
  Bullet("Cherukupalli, R. C. S. (2024). Bessel-Fourier Descriptors for Image Recognition. Preprint."),
  H2("C.2 Foundational works"),
  Bullet("Das, I., and Dennis, J. E. (1997). A closer look at drawbacks of minimizing weighted sums of objectives for Pareto set generation in multicriteria optimization problems. Structural Optimization, 14(1), 63–69."),
  Bullet("Deb, K. (2001). Multi-Objective Optimization Using Evolutionary Algorithms. Wiley."),
  Bullet("Deb, K., Pratap, A., Agarwal, S., and Meyarivan, T. (2002). A fast and elitist multiobjective genetic algorithm: NSGA-II. IEEE Transactions on Evolutionary Computation, 6(2), 182–197."),
  Bullet("Eshelman, L. J., and Schaffer, J. D. (1993). Real-coded genetic algorithms and interval-schemata. In Foundations of Genetic Algorithms 2, 187–202. Morgan Kaufmann."),
  Bullet("Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning. Addison-Wesley."),
  Bullet("Hadley, G., and Whitin, T. M. (1963). Analysis of Inventory Systems. Prentice-Hall."),
  Bullet("Holland, J. H. (1975). Adaptation in Natural and Artificial Systems. University of Michigan Press."),
  Bullet("Huangfu, Q., and Hall, J. A. J. (2018). Parallelizing the dual revised simplex method. Mathematical Programming Computation, 10(1), 119–142."),
  Bullet("Kennedy, J., and Eberhart, R. (1995). Particle swarm optimization. Proceedings of ICNN'95, 4, 1942–1948."),
  Bullet("Kirkpatrick, S., Gelatt, C. D., and Vecchi, M. P. (1983). Optimization by simulated annealing. Science, 220(4598), 671–680."),
  Bullet("Shi, Y., and Eberhart, R. (1998). A modified particle swarm optimizer. Proceedings of the IEEE International Conference on Evolutionary Computation, 69–73."),
  Bullet("Srinivas, M., and Patnaik, L. M. (1994). Adaptive probabilities of crossover and mutation in genetic algorithms. IEEE Transactions on Systems, Man, and Cybernetics, 24(4), 656–667."),
  Bullet("Suman, B., and Kumar, P. (2006). A survey of simulated annealing as a tool for single and multiobjective optimization. Journal of the Operational Research Society, 57(10), 1143–1160."),
  Bullet("Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158), 209–212."),
  Bullet("Wolpert, D. H., and Macready, W. G. (1997). No free lunch theorems for optimization. IEEE Transactions on Evolutionary Computation, 1(1), 67–82."),
  Bullet("Xiao, B., Ma, J.-F., and Wang, X. (2010). Image analysis by Bessel–Fourier moments. Pattern Recognition, 43(8), 2620–2629."),
  Bullet("Zitzler, E., and Thiele, L. (1999). Multiobjective evolutionary algorithms: a comparative case study and the strength Pareto approach. IEEE Transactions on Evolutionary Computation, 3(4), 257–271."),
  Bullet("Abramowitz, M., and Stegun, I. A. (1972). Handbook of Mathematical Functions. Dover."),
  H2("C.3 Textbooks for further study"),
  Bullet("Bishop, C. M. (2006). Pattern Recognition and Machine Learning. Springer."),
  Bullet("Chopra, S., and Meindl, P. (2019). Supply Chain Management: Strategy, Planning, and Operation (7th ed.). Pearson."),
  Bullet("Daskin, M. S. (2013). Network and Discrete Location: Models, Algorithms, and Applications (2nd ed.). Wiley."),
  Bullet("Glover, F., and Kochenberger, G. A. (Eds.) (2003). Handbook of Metaheuristics. Kluwer."),
  Bullet("Gonzalez, R. C., and Woods, R. E. (2008). Digital Image Processing (3rd ed.). Prentice Hall."),
  Bullet("Silver, E. A., Pyke, D. F., and Thomas, D. J. (2017). Inventory and Production Management in Supply Chains (4th ed.). CRC Press."),
  Bullet("Simchi-Levi, D., Kaminsky, P., and Simchi-Levi, E. (2008). Designing and Managing the Supply Chain (3rd ed.). McGraw-Hill."),
  Bullet("Talbi, E.-G. (2009). Metaheuristics: From Design to Implementation. Wiley."),
  Bullet("Zipkin, P. H. (2000). Foundations of Inventory Management. McGraw-Hill."),
  H2("C.4 Online resources"),
  Bullet("NIST Digital Library of Mathematical Functions, chapter 10 (Bessel functions): https://dlmf.nist.gov/10"),
  Bullet("SciPy documentation, scipy.optimize.milp and scipy.special: https://docs.scipy.org"),
  Bullet("HiGHS, the open-source linear and mixed-integer optimization solver: https://highs.dev"),
  Bullet("scikit-learn user guide: https://scikit-learn.org"),
  Bullet("Smart Freight Centre, GLEC Framework for logistics emissions accounting: https://www.smartfreightcentre.org"),
  Bullet("Model Context Protocol: https://modelcontextprotocol.io"),
  Bullet("Companion repository: https://github.com/crsrikanth-07/computational-intelligence-enterprise"),
];

// ---------------------------------------------------------------- Appendix D
const appD = [
  H1("Appendix D — Worked Examples with CSV Data and Python"),
  P("Each worked example in this appendix loads a CSV dataset from poc/datasets/, runs one method with a fixed seed and checks the answer against its exact reference. python -m poc.worked_examples runs D.1 to D.5 in sequence."),

  H2("D.1 AGOA on the CSV supply network"),
  P("The network has five suppliers — SupplierCo-North (850 units a week), SupplierCo-East (1,100), MetalWorks-South (620), Precision-Mex (480) and Global-West (950); three plants — PlantAlpha (capacity 1,300, fixed cost $4,500 a week), PlantBeta (950, $3,200) and PlantGamma (1,400, $5,100); and six DCs — DC-NE (650), DC-MA (480), DC-SE (720), DC-MW (550), DC-SW (390) and DC-NW (430), 3,220 units in total. Shipping costs per unit are:"),
  SimpleTable(
    ["Supplier → plant", "Alpha", "Beta", "Gamma"],
    [
      ["SupplierCo-North", "2.10", "1.85", "3.40"],
      ["SupplierCo-East", "3.20", "2.95", "1.80"],
      ["MetalWorks-South", "2.60", "2.40", "2.85"],
      ["Precision-Mex", "3.85", "3.60", "3.20"],
      ["Global-West", "2.25", "2.10", "3.05"],
    ],
    [2640, 1400, 1400, 1400],
  ),
  Blank(),
  SimpleTable(
    ["Plant → DC", "NE", "MA", "SE", "MW", "SW", "NW"],
    [
      ["PlantAlpha", "3.10", "2.90", "3.50", "2.40", "3.80", "4.10"],
      ["PlantBeta", "3.40", "3.20", "3.75", "2.60", "3.55", "4.05"],
      ["PlantGamma", "2.20", "2.05", "2.85", "3.30", "4.50", "5.00"],
    ],
    [1740, 850, 850, 850, 850, 850, 850],
  ),
  Blank(),
  CodeBlock(
`from poc.common.loaders import load_supply_network_csv
from poc.agoa.agoa_scm import (SupplyNetworkProblem,
    AGOAConfig, run_agoa, brute_force_optimum)

problem = SupplyNetworkProblem(data=load_supply_network_csv())
report = run_agoa(problem, AGOAConfig(population_size=80,
                  generations=200), seed=42)
optimum, _, n_designs = brute_force_optimum(problem)`
  ),
  P("AGOA returns $28,742.50 a week, the proven optimum over all 177,147 designs: fixed cost $12,800, inbound shipping $6,562.50, outbound shipping $9,380.00 and no penalty. The decoded design is:"),
  SimpleTable(
    ["Plant", "Suppliers", "DCs served", "Load / capacity"],
    [
      ["PlantAlpha", "MetalWorks-South, Global-West", "DC-SE, DC-MW", "1,270 / 1,300"],
      ["PlantBeta", "SupplierCo-North", "DC-SW, DC-NW", "820 / 950"],
      ["PlantGamma", "SupplierCo-East, Precision-Mex", "DC-NE, DC-MA", "1,130 / 1,400"],
    ],
    [1400, 2500, 1500, 1440],
  ),
  Blank(),
  P("Unlike the synthetic case study, all three plants stay open, and the capacities explain why: the two largest plants together hold 2,700 units, less than the 3,220 units of demand, so single-sourced service needs every plant. PlantGamma, the cheapest plant for the northeastern DCs, serves DC-NE and DC-MA; PlantAlpha takes DC-SE and DC-MW; and PlantBeta, the smallest, serves the two western DCs."),

  H2("D.2 MOSA on the CSV freight lanes"),
  P("transport_lanes.csv lists 20 lanes among ten Midwestern and Southern US cities, with road distances from 280 km (Indianapolis–Columbus) to 1,500 km (Chicago–Dallas), weekly volumes of 6 to 38 tonnes and delivery limits of 12 to 120 hours; transport_modes.csv holds the mode table of Section 8.4."),
  CodeBlock(
`from poc.common.loaders import load_transport_csv
from poc.simulated_annealing.mosa_scm import (
    TransportProblem, SAConfig, run_weighted_sum_sa,
    run_archive_mosa, exact_pareto_front, front_quality)

problem = TransportProblem(data=load_transport_csv())
exact = exact_pareto_front(problem)
archive = run_archive_mosa(problem, seed=7)`
  ),
  SimpleTable(
    ["Result (seed 7)", "Cost per week", "CO₂ per week", "Lanes: truck / rail / air"],
    [
      ["Cost-focused run, w_cost = 0.9", "$26,696", "20,046 kg", "12 / 7 / 1"],
      ["Balanced run, w_cost = 0.5", "$28,732", "17,304 kg", "6 / 13 / 1"],
      ["Green run, w_cost = 0.1", "$29,606", "16,772 kg", "4 / 15 / 1"],
      ["Exact knee point", "$27,577", "18,328 kg", "—"],
    ],
    [2440, 1300, 1300, 1800],
  ),
  Blank(),
  P("The exact front has 31 points, spanning $26,636–29,606 and 16,772–21,333 kg a week. With seed 7 the weight sweep recovers 8 points and 93.6% of the exact hypervolume, and archive MOSA 28 points and 98.8%; over ten seeds the averages are 89.8% and 99.5% (Section 9.7)."),

  H2("D.3 PSO on the CSV inventory"),
  P("inventory_sample.csv holds eight products:"),
  SimpleTable(
    ["Product", "Annual demand", "Weekly σ", "Lead days", "Order $", "Hold $/yr", "Backorder $"],
    [
      ["Widget-A", "10,591", "64.2", "5", "62.42", "11.10", "37.19"],
      ["Widget-B", "17,783", "96.9", "13", "56.94", "7.10", "16.73"],
      ["Gadget-C", "15,089", "58.1", "8", "53.89", "14.63", "43.31"],
      ["Gadget-D", "13,580", "93.7", "14", "51.32", "14.10", "36.65"],
      ["Module-E", "13,337", "77.9", "7", "66.29", "10.90", "37.70"],
      ["Module-F", "20,132", "102.7", "3", "61.55", "12.22", "47.65"],
      ["Sensor-G", "21,920", "126.5", "6", "73.16", "9.54", "35.62"],
      ["Sensor-H", "10,567", "44.4", "7", "40.64", "13.04", "40.30"],
    ],
    [1140, 1100, 900, 800, 900, 1000, 1000],
  ),
  Blank(),
  P("A 30-particle swarm with 300 iterations and seed 42 returns $58,305.07 a year against an exact optimum of $56,530.87:"),
  SimpleTable(
    ["Product", "EOQ", "Q exact", "Q PSO", "r exact", "r PSO"],
    [
      ["Widget-A", "345", "364", "364", "271", "271"],
      ["Widget-B", "534", "582", "582", "926", "926"],
      ["Gadget-C", "333", "355", "355", "481", "481"],
      ["Gadget-D", "314", "363", "363", "829", "829"],
      ["Module-E", "403", "430", "430", "440", "440"],
      ["Module-F", "450", "472", "450", "335", "502"],
      ["Sensor-G", "580", "620", "620", "646", "646"],
      ["Sensor-H", "257", "272", "272", "310", "310"],
    ],
    [1340, 1100, 1100, 1100, 1100, 1100],
  ),
  Blank(),
  P("Seven products are exact. For Module-F the swarm has stopped at Q = 450, r = 502, carrying 167 units of unnecessary safety stock, and the run costs $1,774.20 a year more than the optimum (Section 11.6)."),

  H2("D.4 Hybrid PSO-GA versus PSO on CSV discounts"),
  P("The discount variant adds each product's two price breaks from inventory_sample.csv:"),
  SimpleTable(
    ["Product", "Price", "Break 1", "Discount 1", "Break 2", "Discount 2"],
    [
      ["Widget-A", "$44.38", "920", "0.62%", "2,550", "2.10%"],
      ["Widget-B", "$28.42", "1,360", "0.39%", "3,640", "1.82%"],
      ["Gadget-C", "$58.51", "760", "0.36%", "2,010", "1.93%"],
      ["Gadget-D", "$56.39", "910", "0.62%", "2,470", "1.56%"],
      ["Module-E", "$43.61", "1,070", "0.34%", "2,690", "1.63%"],
      ["Module-F", "$48.87", "1,100", "0.50%", "2,840", "1.74%"],
      ["Sensor-G", "$38.18", "1,340", "0.55%", "4,470", "1.70%"],
      ["Sensor-H", "$52.17", "850", "0.31%", "1,530", "2.01%"],
    ],
    [1340, 1100, 1100, 1100, 1100, 1100],
  ),
  Blank(),
  P("The exact optimum is $5,608,524.01 a year. At equal budgets — PSO with 60 particles, the hybrid with 30, both for 200 iterations — five seeds give:"),
  SimpleTable(
    ["Seed", "PSO 60 × 200 excess", "Hybrid 30 × 200 excess"],
    [
      ["1", "$7,881.34", "$2,913.28"],
      ["2", "$21.55", "$51.89"],
      ["3", "$3,348.26", "$24.75"],
      ["4", "$1,389.79", "$1,161.09"],
      ["5", "$10,175.78", "$3,943.64"],
      ["Mean", "$4,563.35", "$1,618.93"],
    ],
    [1400, 2720, 2720],
  ),
  Blank(),
  P("The hybrid wins in four of five seeds and cuts the mean excess by almost two-thirds; in seed 2 PSO happens to be slightly better. The pattern matches the 20-seed benchmark of Section 13.3."),

  H2("D.5 Bessel-Fourier features on the shape dataset"),
  CodeBlock(
`from poc.bessel_bfd.bfd_classifier import (BFDConfig,
    run_bfd_pipeline)

cfg = BFDConfig(num_coeffs=14, lambda_value=0.22)
radial = run_bfd_pipeline(cfg, seed=7)
moments = run_bfd_pipeline(BFDConfig(descriptor="moments"),
                           seed=7)`
  ),
  SimpleTable(
    ["Descriptor", "Features", "Test accuracy", "Confusion matrix (rows: circle, ring, square, plus)"],
    [
      ["Radial filter bank", "14", "80.0%", "[15 0 5 0] [0 20 0 0] [6 1 12 1] [0 0 3 17]"],
      ["Bessel-Fourier moments", "30", "97.5%", "[20 0 0 0] [1 19 0 0] [0 0 19 1] [0 0 0 20]"],
    ],
    [1700, 900, 1000, 3240],
  ),
  Blank(),
  P("python -m poc.bessel_bfd.tuning then tunes both descriptors as described in Section 15.5 and reports the results tabulated there."),

  H2("D.6 The Margin Leak Finder golden run"),
  CodeBlock(`python -m poc.value_lens.margin_leak`),
  P("The command analyzes the fifteen golden lines and the two controls of Section 18.7, prints the review queue in its deterministic order — severity, leakage, date, identifier — with each case's expected margin, actual margin, leakage, rules and coverage, then the two patterns and the run totals: 13 cases, expected margin $4,270.00, actual margin $2,860.00, leakage $1,410.00 and an illustrative annualized exposure of $73,320.00. It finishes by comparing every value with the golden catalogue and reporting that all checks pass. python -m poc.value_lens.threshold_calibration reproduces Chapter 19."),

  H2("D.7 Running every worked example"),
  CodeBlock(
`python -m poc.worked_examples
python -m poc.value_lens.margin_leak
python -m poc.value_lens.threshold_calibration`
  ),
];

// ---------------------------------------------------------------- Appendix E
const Q = (label, text) => P(label + "  " + text);

const appE = [
  H1("Appendix E — Questions, Exercises, and Projects"),
  P("Exercises are tagged by type. [CONCEPT] questions test understanding, [NUMERIC] exercises can be done with a calculator, [CODE] exercises extend the companion code, and [PROJECT] exercises take a day or more. Solutions to selected exercises are in Section E.9."),

  H2("E.1 Parts I and II — Foundations and machinery"),
  Q("E1.", "[CONCEPT] Section 1.5 gives four situations in which a metaheuristic earns its place over MILP. For a problem from your own work, decide which branch of Figure 1.1 applies and justify the choice in three sentences."),
  Q("E2.", "[CONCEPT] Explain why the hypervolume needs a reference point, and what goes wrong if the reference point is placed far beyond the front."),
  Q("E3.", "[NUMERIC] An algorithm reaches the optimum in 14 of 20 runs. Compute the 95% Wilson interval of Section 4.7 and decide whether it can be distinguished from an algorithm that succeeds in 18 of 20."),
  Q("E4.", "[CONCEPT] Why must algorithms be compared at equal numbers of fitness evaluations rather than equal iterations? Give an example from this book where the difference matters."),
  Q("E5.", "[NUMERIC] Choose the transition probabilities of a three-state Markov chain, compute its stationary distribution by hand, and verify it by simulating 10,000 steps (Section 4.3)."),
  Q("E6.", "[CONCEPT] The No Free Lunch theorem is sometimes quoted as “no algorithm is better than any other.” Explain precisely why that reading is wrong for enterprise problems."),

  H2("E.2 Part III — Adaptive Genetic Optimization"),
  Q("E7.", "[CONCEPT] Explain why the encoding of Section 5.5 guarantees that every DC is served, and describe an encoding under which designs with unserved DCs are unavoidable."),
  Q("E8.", "[NUMERIC] In a population of 80 chromosomes, one gene takes the three plant values with frequencies 60, 15 and 5. Compute the gene's normalized entropy. What mutation rate does the rule of Section 5.3 give if every gene has this entropy and there is no stagnation?"),
  Q("E9.", "[CODE] Add a constraint that at most one plant may be closed, enforced by a penalty, and rerun the case study. Does the optimum change? Verify with brute_force_optimum."),
  Q("E10.", "[CODE] Give plants economies of scale, with operating cost F_p + k · L_p^0.8. Why can milp_optimum no longer be used directly? Compare AGOA with a MILP on a piecewise-linear approximation."),
  Q("E11.", "[PROJECT] Repeat the comparison of Section 7.3 over 50 seeds instead of 20 and report Wilson intervals. Does the conclusion change?"),

  H2("E.3 Part IV — Multi-Objective Simulated Annealing"),
  Q("E12.", "[NUMERIC] Using the mode table of Section 8.4, compute the weekly cost and CO₂ of a 500 km lane carrying 20 tonnes by truck and by rail, and the cost per tonne of CO₂ avoided by switching to rail."),
  Q("E13.", "[CONCEPT] Sketch a front with a dent and mark a point in the dent that no weighted sum can reach (Section 8.5)."),
  Q("E14.", "[CODE] Add a third objective, the longest transit time over all lanes, and extend the archive to three dimensions. Which parts of the code assume two objectives?"),
  Q("E15.", "[CODE] Give two lanes a shared rail-capacity limit. Why does exact_pareto_front no longer apply, and how does archive MOSA handle the constraint?"),
  Q("E16.", "[PROJECT] Replace the illustrative mode table with published emission factors for your region and recompute the CSV front. How far does the knee move?"),

  H2("E.4 Part V — Swarm Intelligence for Inventory"),
  Q("E17.", "[NUMERIC] For a product with D = 12,000 units a year, K = $60, h = $10, p = $30 and σ_L = 80 units, iterate the two conditions of Section 10.3 from Q = EOQ until Q changes by less than one unit. Report Q, z and the safety stock r − μ_L."),
  Q("E18.", "[CONCEPT] Why is every optimal Q in Section 11.5 above its EOQ? What would the optimal Q be if backorders were free?"),
  Q("E19.", "[CODE] Add a warehouse-capacity constraint Σ v_i · Q_i ≤ W with a penalty and rerun PSO. Why does exact_optimum no longer give the optimum, and how could you obtain a bound?"),
  Q("E20.", "[CODE] Rerun the discount comparison of Section 13.3 with ga_uses_swarm_bests = True and explain the result in terms of diversity."),
  Q("E21.", "[PROJECT] Implement a local-best (ring) topology for PSO and compare it with the global-best swarm on the discount variant at equal budgets over 20 seeds."),

  H2("E.5 Part VI — Bessel Functions for Visual Inspection"),
  Q("E22.", "[CONCEPT] Explain why |B_nm| is rotation invariant, and why adding rotated training images helps neither descriptor."),
  Q("E23.", "[NUMERIC] For a 48 × 48 image, what is the largest argument λr reached by the filter bank at λ = 0.22 and at the tuned λ = 0.962? Which orders n respond meaningfully in each case?"),
  Q("E24.", "[CODE] Add a fifth class, a triangle, to the synthetic dataset. Which descriptor separates it best from the square, and why?"),
  Q("E25.", "[PROJECT] Enlarge the tuning space — λ, N, the SVM's regularization C and the strength of a denoising filter — and compare PSO with random search at equal budgets."),

  H2("E.6 Part VII — Integration and Deployment"),
  Q("E26.", "[CODE] Wrap run_agoa and milp_optimum in a FastAPI service following the contract of Section 17.2, returning both results and the gap, and reject invalid inputs with HTTP 400."),
  Q("E27.", "[CONCEPT] Propose a production metric, logged on every run, that uses one of this book's exact baselines, and explain what it would catch."),
  Q("E28.", "[CODE] Add a test that fails if any runner's result changes for a fixed seed. Where in a CI pipeline should it run?"),
  Q("E29.", "[PROJECT] Measure the table of Section 17.3 on your own hardware and inside a 256 MB container. Which workload comes closest to the limit?"),

  H2("E.7 Part VIII — Capstone"),
  Q("E30.", "[NUMERIC] A line of 12 units has list price $50, a recorded discount of 15%, no override, a final price of $41.00, a reference cost of $30, a current cost of $31 and no charges; no agreement applies. Compute P_ref, the five bridge components, E, A, the leakage and the severity (Section 18.5)."),
  Q("E31.", "[CONCEPT] Explain why the bridge clamps only the final net leakage, using GC-N01 as the example. What would a sum of positive components have reported?"),
  Q("E32.", "[CODE] Add a rule MLF-R-10 that flags lines whose leakage exceeds 30% of expected margin whatever the amount. Add a golden case for it and keep every existing check passing."),
  Q("E33.", "[PROJECT] Add a third calibration objective — the largest number of cases in any single week — and solve the three-objective problem with archive MOSA. Why does the exact decomposition no longer apply?"),

  H2("E.8 Capstone project"),
  P("Build a small margin-and-mode advisor that combines three parts of the book. First, use the Margin Leak Finder to flag leakage caused by absorbed freight charges. Second, for the lanes behind those charges, compute the cost–CO₂ front with the tools of Chapter 9 and find the cheapest plan that keeps emissions within a target. Third, report the freight saving that plan would have delivered against each flagged case, and expose the whole flow behind one API following Chapter 17. Document every number with its source and its exact baseline, as this book does."),

  H2("E.9 Selected solutions"),
  P("E3. For 14/20, p̂ = 0.70 and the Wilson interval is about 48% to 86%; for 18/20 it is about 70% to 97%. The intervals overlap between 70% and 86%, so 20 runs cannot distinguish the two algorithms."),
  P("E8. The frequencies are 0.75, 0.1875 and 0.0625, so H = 0.703 nats; dividing by ln 3 gives a normalized entropy of 0.640. With D* = 0.5 and g_d = 0.8, p_m = 0.05 × (1 + 0.8 × (0.5 − 0.640)/0.5) ≈ 0.039: the population is more diverse than the target, so the rule lowers the mutation rate."),
  P("E12. Truck: 20 × 500 × 0.09 = $900 and 900 kg. Rail: 20 × (500 × 0.035 + 45) = $1,250 and 20 × (500 × 0.025 + 12) = 490 kg. Switching to rail avoids 410 kg for $350, about $854 per tonne of CO₂."),
  P("E17. EOQ = √(2 × 12,000 × 60 / 10) ≈ 379.5. The iteration converges in a few rounds to Q ≈ 408, z ≈ 2.28 and a safety stock of about 182 units."),
  P("E18. The backorder term p · (D/Q) · σ_L · G(z) falls as Q grows, which pulls the optimum above the EOQ. With free backorders the term vanishes, no safety stock is worth holding, and the optimal Q is exactly the EOQ."),
  P("E23. The radius of a 48 × 48 image is about 33 pixels, so λr reaches 7.3 at λ = 0.22 and 31.7 at λ = 0.962. Since J_n(x) stays near zero until x exceeds roughly n, only orders up to about 7 respond at the default λ, while all 15 orders respond at the tuned λ."),
  P("E30. P_ref = $45.00, P_disc = P_ovr = $42.50 and P_fin = $41.00. Components: discount (45.00 − 42.50) × 12 = $30, override $0, residual price (42.50 − 41.00) × 12 = $18, cost (31 − 30) × 12 = $12, charge $0. E = (45 − 30) × 12 = $180 and A = (41 − 31) × 12 = $120, so the leakage is $60: a LOW case raised by R-01 alone, because no single component reaches $50."),
  P("E31. In GC-N01 the discount component is +$100 and the cost component −$100, so the line earned exactly its expected margin and the net is zero. A sum of positive components would have reported $100 of leakage on a line that lost nothing."),
];

// ---------------------------------------------------------------- Back matter
const aboutAuthor = [
  H1("About the Author"),
  P("Srikanth Cherukupalli is a Chief SAP Architect who leads enterprise supply-chain and data-platform engagements for Fortune 500 clients, and he has architected two SAP-certified products. His work combines classical operations research with modern computational methods, and it has produced a series of research preprints — on adaptive genetic optimization, multi-objective simulated annealing for supply chains, particle swarm optimization for inventory management, hybrid PSO-GA algorithms and Bessel-Fourier descriptors for image recognition — that together form the basis of this book."),
  P("He has deep experience in SAP supply-chain architecture and has deployed production optimization systems across retail, manufacturing, healthcare and logistics. He is based in Rhode Island, USA."),
  H3("A request"),
  P("If this book helped you, a short review on Amazon helps other practitioners find it. Corrections and questions are welcome through the issue tracker of the companion repository."),
];

module.exports = { appA, appB, appC, appD, appE, aboutAuthor };
