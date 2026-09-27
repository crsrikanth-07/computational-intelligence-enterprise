// content_v2_p6.js — Part VI (Chapters 14–15), Chapter 16, and Chapter 17 replacement pieces
const {
  P, H1, H2, H3, Formula, CodeBlock, Callout, Bullet, Numbered, SimpleTable, Blank, Figure,
} = require('./helpers');

const ch14 = [
  H1("Chapter 14 — Bessel-Fourier Descriptors: Theory"),

  H2("14.1 Why this chapter belongs here"),
  P("Bessel-Fourier descriptors are not an optimization algorithm. They turn an image into a short vector of numbers that a classifier can use, and they earn their place in an enterprise book through visual inspection. On a conveyor, in a warehouse or at a goods-receiving dock, cameras check parts, labels and packs whose orientation is arbitrary. The features used for such checks should not change when the object rotates, should be cheap enough to compute on modest hardware, and should be interpretable enough for an engineer to diagnose a misclassification. Bessel-based descriptors meet all three requirements — and, as Chapter 15 shows, their settings are tuned with the same PSO developed in Part V."),

  H2("14.2 Bessel functions of the first kind"),
  P("The Bessel functions of the first kind, J_n(x), solve Bessel's differential equation:"),
  Formula("x² · y″ + x · y′ + (x² − n²) · y = 0"),
  P("They behave like damped cosines. J_0(0) = 1 and J_n(0) = 0 for n ≥ 1, and J_n(x) stays close to zero until x exceeds roughly n. They arise naturally whenever something circular is analyzed — the vibration of a drumhead, heat flow in a cylinder — which is why they suit images described around their center. SciPy evaluates them with scipy.special.jn and jv, and their zeros with jn_zeros."),

  H2("14.3 From image to radial profile"),
  P("For a grayscale image I(x, y) with its object centered, the radial profile I(r) is the mean intensity of all pixels whose distance from the center rounds down to r. Averaging around each circle discards orientation — rotating the image leaves I(r) unchanged — and compresses a 48 × 48 image into 34 numbers."),

  H2("14.4 The radial Bessel filter bank"),
  P("The descriptor of the original preprint projects the radial profile onto Bessel functions of increasing order at one fixed scale λ:"),
  Formula("a_n = Σ_r  I(r) · J_n(λ r) · r ,     n = 0, 1, …, N − 1"),
  P("The factor r is the Jacobian of polar integration; it weights outer rings by their larger circumference. The functions J_n(λr) for different n are not orthogonal, so the a_n are not expansion coefficients in the strict sense. They are better understood as the outputs of a filter bank: each measures how strongly the radial profile correlates with the template J_n(λr). J_0 responds to overall radial mass, J_1 to the first oscillation, and so on (Figure 14.1a). This filter-bank view is the honest description of what the code computes, and the one to carry forward when extending the method."),

  H2("14.5 Full Bessel-Fourier moments"),
  P("The descriptor used in the image-analysis literature (Xiao, Ma and Wang, 2010) keeps the angular information that the radial profile discards. Mapping the image onto the unit disk, it projects onto the functions J_v(λ_n r) · e^(−jmθ), where λ_n are the zeros of J_v:"),
  Formula(["B_nm = 1 / (2π · a_n) · ∫∫ f(r, θ) · J_v(λ_n r) · e^(−jmθ) · r dr dθ", "a_n = J_v+1(λ_n)² / 2"]),
  P("The radial functions J_v(λ_n r) are orthogonal on the unit disk — the code checks this numerically — so the moments are genuine expansion coefficients (Figure 14.1b). Rotating the image by an angle α only multiplies B_nm by the phase factor e^(−jmα), so the magnitudes |B_nm| are rotation invariant while still recording angular structure such as a square's four-fold symmetry, which appears in the m = 4 harmonic. With v = 1, radial orders n = 1 to 6 and harmonics m = 0 to 4, each image becomes 30 numbers."),
  ...Figure("fig_14_1_bessel_bases.png", "Figure 14.1 — (a) The radial filter bank at the preprint's scale λ = 0.22 over a 33-pixel radius. (b) The first four orthogonal radial functions J_1(λ_n r) of the full moments."),

  H2("14.6 The scale parameter λ"),
  P("In the filter bank, λ sets the radial resolution. With a 33-pixel radius and λ = 0.22 the argument λr never exceeds 7.3, so filters above order 7 barely respond and the bank sees only coarse radial structure. A larger λ packs more oscillations into the radius and resolves finer detail — such as the gradual fall-off of a square's radial profile between its inscribed and circumscribed circles, which distinguishes it from the sharp edge of a disk. Make λ too large, and the filters start responding to pixel noise. Chapter 15 lets PSO find the balance."),

  H2("14.7 Normalization and invariance"),
  P("Both descriptors are divided by their Euclidean length, so a uniformly brighter or darker copy of an image gives the same feature vector. Both are rotation invariant by construction, which also means that adding rotated copies of the training images — a common augmentation — adds nothing. Neither is invariant to translation or scale: the object must be centered, and its size relative to the frame matters."),

  H2("14.8 Limitations"),
  P("Production pipelines therefore add a preprocessing step that finds the object, centers it and normalizes its size, typically with connected-component analysis and bounding-box rescaling. The synthetic dataset of Chapter 15 centers every object by construction, so the step is not needed there, but any real deployment must include it. Cluttered scenes, occlusion and lighting gradients are further reasons to benchmark against learned features before committing (Section 15.6)."),
];

const ch15 = [
  H1("Chapter 15 — BFD POC: A Shape-Classification Pipeline"),

  H2("15.1 The pipeline"),
  P("The implementation in poc/bessel_bfd/bfd_classifier.py runs three stages: descriptor extraction, standardization of each feature to zero mean and unit variance, and a linear support vector machine. run_bfd_pipeline(config, seed) returns a RunReport whose extra field holds the accuracy, the confusion matrix and the train and test sizes; BFDConfig selects the descriptor — radial filter bank or full moments — and its settings."),

  H2("15.2 The synthetic dataset"),
  P("Four classes — circle, ring, square and plus — are drawn at random sizes on a 48 × 48 canvas, rotated by a random angle between −60° and 60°, and corrupted with Gaussian noise (Figure 15.1). Each class has 80 images; a stratified split keeps 240 for training and 80 for testing."),
  ...Figure("fig_15_1_shapes.png", "Figure 15.1 — Four examples of each class in the synthetic dataset."),

  H2("15.3 Computing the descriptors"),
  P("The radial profile uses np.bincount to average pixels by integer radius, which is much faster than looping over rings, and the filter bank is a direct transcription of Section 14.4:"),
  CodeBlock(
`def radial_profile(image):
    h, w = image.shape
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    y, x = np.indices((h, w))
    r = np.hypot(x - cx, y - cy).astype(int)
    total = np.bincount(r.ravel(), weights=image.ravel())
    count = np.maximum(np.bincount(r.ravel()), 1)
    return total / count

def bessel_fourier_descriptors(image, num_coeffs=12,
                               lambda_value=0.25):
    I = radial_profile(image)
    r = np.arange(I.size, dtype=float)
    a = np.array([np.sum(I * jn(n, lambda_value * r) * r)
                  for n in range(num_coeffs)])
    return a / (np.linalg.norm(a) or 1.0)`
  ),
  P("The full moments precompute the basis — radial functions, angular exponentials and normalization — once per image size and cache it, so each additional image costs a single matrix-vector product. In outline:"),
  CodeBlock(
`basis = cached_basis(image.shape, n_max, m_max, order)
v = np.abs(basis @ image[inside_unit_disk])   # |B_nm|
return v / (np.linalg.norm(v) or 1.0)`
  ),

  H2("15.4 Baseline results"),
  P("With the preprint's settings (λ = 0.22, N = 14) the radial filter bank classifies 80.0% of the test images correctly; over five freshly generated datasets its mean is 78.0%, ranging from 75.0% to 81.2%. The full moments with the default orders (n up to 6, m up to 4) reach 97.5%, with a five-dataset mean of 97.0% (93.8–98.8%). The confusion matrices in Figure 15.2 show where the radial descriptor fails: eleven of its sixteen errors confuse circles with squares."),
  ...Figure("fig_15_2_confusion.png", "Figure 15.2 — Confusion matrices of both descriptors on the same 80 test images."),
  P("It is tempting to conclude that averaging around each circle throws away the corners that separate squares from circles. Section 15.5 shows that the conclusion is wrong."),

  H2("15.5 Tuning the descriptor with PSO"),
  P("Each descriptor has two settings: λ and N for the filter bank, and the radial and angular orders for the moments. poc/bessel_bfd/tuning.py tunes them with the unchanged run_pso of Chapter 11. A small adapter class gives the tuning problem the interface the swarm expects — bounds(), dim and fitness() — where fitness is one minus the 5-fold cross-validated accuracy on the 240 training images only. The test images are used once, after tuning, and the chosen settings are also scored on five freshly generated datasets. The swarm has 12 particles and 15 iterations, 192 evaluations in all."),
  SimpleTable(
    ["Descriptor", "Settings", "Test accuracy", "Five fresh datasets"],
    [
      ["Radial filter bank", "λ = 0.22, N = 14 (preprint)", "80.0%", "78.0% (75.0–81.2%)"],
      ["Radial filter bank", "λ = 0.962, N = 15 (PSO-tuned)", "98.8%", "99.5% (98.8–100%)"],
      ["Bessel-Fourier moments", "n ≤ 6, m ≤ 4 (default)", "97.5%", "97.0% (93.8–98.8%)"],
      ["Bessel-Fourier moments", "n ≤ 9, m ≤ 4 (PSO-tuned)", "96.3%", "98.2% (95.0–100%)"],
    ],
    [1800, 2240, 1100, 1700],
  ),
  Blank(),
  P("The tuned filter bank is the best of the four descriptors, with just 15 numbers per image. The representation was never the problem; the scale was. At λ ≈ 0.96 the filters resolve the fall-off of a square's profile between its inscribed and circumscribed circles — exactly the information the default λ could not see. For the moments, tuning changes little, because their default orders were already adequate."),
  P("Two caveats keep this honest. With only two settings, a grid of a few hundred points would have found the same answer; PSO becomes the better tool as the tuning space grows — per-class weights, preprocessing parameters, classifier regularization. And a near-perfect score on a clean synthetic dataset says nothing about a production camera. What transfers is the method: tune on training data by cross-validation, then test once on data the tuning never saw."),

  H2("15.6 Comparison with a CNN"),
  P("A convolutional neural network is the obvious alternative, and on varied real-world imagery — clutter, lighting changes, textures — a learned model, or a pretrained network fine-tuned on your images, is usually the stronger baseline. This book does not benchmark one, so it makes no numeric claim. The case for Bessel descriptors rests on their profile: training takes a fraction of a second on a CPU, they work with a few hundred labeled images, and each prediction rests on 15 or 30 numbers that an engineer can inspect. Where labeled data is scarce, latency budgets are tight or explanations are required, they remain a serious option — but benchmark both on your own images before deciding."),

  H2("15.7 Production blueprint"),
  Numbered("Detect, center and scale-normalize the object before extracting features (Section 14.8)."),
  Numbered("Tune the descriptor settings with PSO by cross-validation on your own labeled images, and version the chosen settings together with the model."),
  Numbered("Monitor the feature distribution in production; a shift in lighting or camera position shows up there before accuracy visibly drops."),
  Numbered("Route low-confidence predictions — small SVM margins — to human inspection, and add the reviewed images to the training set."),
];

const ch16 = [
  H1("Chapter 16 — A Unified Optimization Library"),

  H2("16.1 Why a unified library"),
  P("The five methods share more than their metaheuristic character: each takes a problem object, a configuration and a seed, and returns its result in one common format. Packaging them as a library lets a service call any of them the same way, lets a benchmark compare them the same way, and lets tests check them the same way."),

  H2("16.2 The RunReport contract"),
  P("Every runner returns a RunReport:"),
  CodeBlock(
`@dataclass
class RunReport:
    algorithm: str
    problem: str
    best_fitness: float
    best_solution: Any
    iterations: int
    wall_time_seconds: float
    convergence_trace: list = field(default_factory=list)
    extra: dict = field(default_factory=dict)`
  ),
  P("The extra field carries algorithm-specific detail — evaluation counts, cost breakdowns, Pareto fronts, confusion matrices — without breaking the common shape, and to_json() serializes a run for logging or an API response."),

  H2("16.3 Problems, generators and exact baselines"),
  SimpleTable(
    ["Module (under poc/)", "Problem and data", "Exact baseline"],
    [
      ["agoa/agoa_scm.py", "SupplyNetworkProblem; make_supply_network", "brute_force_optimum, milp_optimum"],
      ["simulated_annealing/mosa_scm.py", "TransportProblem; make_transportation_network", "exact_pareto_front"],
      ["pso/pso_inventory.py", "InventoryProblem; make_inventory_dataset", "exact_optimum"],
      ["hybrid_pso_ga/hybrid.py", "InventoryProblem (shared)", "exact_optimum"],
      ["bessel_bfd/", "make_synthetic_dataset; tuning.py", "Held-out and fresh-data accuracy"],
      ["value_lens/", "golden_fixtures; simulate_history", "Golden catalogue; exact front"],
    ],
    [2300, 2500, 2040],
  ),
  Blank(),
  P("Every generator is seeded and returns plain NumPy arrays in a dictionary, and every CSV loader in poc/common/loaders.py returns a dictionary of the same shape, so replacing synthetic data with real data never touches algorithm code."),

  H2("16.4 Directory layout"),
  CodeBlock(
`computational-intelligence-enterprise/
  README.md  CHANGELOG.md  requirements.txt
  poc/
    common/               RunReport, generators, loaders
    agoa/                 Chapters 5-7
    simulated_annealing/  Chapters 8-9
    pso/                  Chapters 10-11
    hybrid_pso_ga/        Chapters 12-13
    bessel_bfd/           Chapters 14-15
    value_lens/           Chapters 18-19
    datasets/             CSV data, build_datasets.py
    results/              benchmarks.json
    run_all_demos.py  worked_examples.py  benchmarks.py
  tests/                  pytest suite
  book/                   manuscript sources and figures
  kdp/                    print interior, cover, metadata`
  ),

  H2("16.5 How the unified demo works"),
  P("poc/run_all_demos.py sets a shared seed, builds one problem for each method, runs it once, and ends with a summary that prints every result beside its exact or reference value:"),
  SimpleTable(
    ["Algorithm", "Measure", "Result", "Exact", "Gap"],
    [
      ["AGOA", "Network design, $/week", "18,715.83", "18,715.83", "0.00%"],
      ["Weight-sweep SA", "Front hypervolume, %", "84.70", "100.00", "—"],
      ["Archive MOSA", "Front hypervolume, %", "97.49", "100.00", "—"],
      ["PSO", "Inventory, $/year", "44,237.70", "44,237.70", "0.00%"],
      ["PSO (discounts)", "Inventory, $/year", "5,494,636.18", "5,490,829.20", "0.07%"],
      ["Hybrid PSO-GA", "Inventory, $/year", "5,490,833.87", "5,490,829.20", "0.00%"],
      ["BFD radial + SVM", "Test accuracy, %", "80.00", "—", "—"],
      ["BFM + SVM", "Test accuracy, %", "97.50", "—", "—"],
    ],
    [1600, 1800, 1250, 1250, 940],
  ),
  Blank(),
  P("The whole demo takes a few seconds. In this run seed 1 leaves plain PSO $3,806.99 a year above the discount optimum and the hybrid only $4.67 above it — a vivid illustration, but an illustration only."),
  P("Single runs are illustrations. The evidence for every comparison in this book comes from the benchmark suite."),

  H2("16.6 Benchmarks and tests"),
  P("python -m poc.benchmarks reruns every multi-seed experiment in Chapters 7, 9, 13 and 15 — 20 paired seeds for most — and writes the results, including convergence traces, to poc/results/benchmarks.json. It takes about four minutes on a laptop. python book/make_figures.py regenerates every figure in the book from that file and from the code."),
  P("python -m pytest runs the test suite. Among other things it checks that enumeration and MILP agree, that no approximate front dominates the exact one, that PSO matches the exact inventory optimum on the demo instance, that the Margin Leak Finder reproduces its golden catalogue, and that every runner is bit-for-bit reproducible from its seed."),
];

const fig_17_1 = Figure("fig_17_1_architecture.png", "Figure 17.1 — The four-layer reference architecture.");

const ch17_budget = [
  H2("17.3 Compute-and-memory budget"),
  P("The algorithms in this book are not compute-hungry by modern standards. The table reports measured wall time for one run and the peak memory of the whole Python process — interpreter and libraries included — on a single laptop core:"),
  SimpleTable(
    ["Workload", "Representative size", "Time", "Peak memory"],
    [
      ["AGOA", "5 / 3 / 6 network, 80 × 150", "0.6 s", "67 MB"],
      ["AGOA", "20 / 6 / 40 network, 100 × 300", "2.3 s", "67 MB"],
      ["MILP (HiGHS)", "20 / 6 / 40, proven optimum", "0.9 s", "122 MB"],
      ["Archive MOSA", "20 lanes, 16,500 iterations", "0.3 s", "67 MB"],
      ["Exact Pareto front", "20 lanes", "< 0.01 s", "67 MB"],
      ["PSO", "8 products, 30 × 200", "0.5 s", "126 MB"],
      ["Hybrid PSO-GA", "8 products with discounts, 30 × 200", "1.3 s", "127 MB"],
      ["Bessel-Fourier moments + SVM", "320 images", "0.1 s", "156 MB"],
      ["Margin Leak Finder", "15 order lines, golden run", "< 0.01 s", "13 MB"],
      ["Threshold calibration", "Exact front, 17 billion settings", "4.2 s", "96 MB"],
    ],
    [2200, 2640, 900, 1100],
  ),
  Blank(),
  P("Everything fits in a small container — 256 MB of memory and one vCPU — with room to spare, and most of the memory is taken by the scientific-Python libraries rather than the algorithms. That profile is very different from deep-learning workloads, and it is one reason these methods remain attractive in production: they can run next to the data, on demand, without special hardware."),
];

module.exports = { ch14, ch15, ch16, fig_17_1, ch17_budget };
