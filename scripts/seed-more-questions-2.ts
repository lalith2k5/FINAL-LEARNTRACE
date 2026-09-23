import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQ = {
  skillSlug: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  difficulty: number;
};

const OPTS = (a: string, b: string, c: string, d: string) => [
  { id: "a", text: a },
  { id: "b", text: b },
  { id: "c", text: c },
  { id: "d", text: d },
];

const QUESTIONS: SeedQ[] = [
  // ---------------- calculus ----------------
  { skillSlug: "calculus", difficulty: 2,
    prompt: "What is the derivative of f(x) = x³?",
    options: OPTS("3x²", "x²", "3x", "x⁴/4"),
    correctId: "a",
    explanation: "Power rule: d/dx[xⁿ] = n·xⁿ⁻¹, so d/dx[x³] = 3x²." },
  { skillSlug: "calculus", difficulty: 2,
    prompt: "What is ∫ 2x dx?",
    options: OPTS("x² + C", "2 + C", "x²/2 + C", "2x² + C"),
    correctId: "a",
    explanation: "The antiderivative of 2x is x² (since d/dx[x²] = 2x), plus the constant of integration." },
  { skillSlug: "calculus", difficulty: 4,
    prompt: "The chain rule states that d/dx[f(g(x))] equals:",
    options: OPTS("f'(g(x)) · g'(x)", "f'(x) · g'(x)", "f(g'(x))", "f'(g'(x))"),
    correctId: "a",
    explanation: "Derivative of a composition: differentiate the outer function evaluated at the inner, times the inner's derivative." },

  // ---------------- clustering-algorithms ----------------
  { skillSlug: "clustering-algorithms", difficulty: 2,
    prompt: "What must you choose in advance when using K-means?",
    options: OPTS("The learning rate", "The number of clusters K", "The kernel", "The activation function"),
    correctId: "b",
    explanation: "K-means requires K up front. Methods like the elbow method or silhouette score help pick it." },
  { skillSlug: "clustering-algorithms", difficulty: 3,
    prompt: "Which algorithm does NOT require specifying the number of clusters in advance?",
    options: OPTS("K-means", "DBSCAN", "K-medoids", "Mini-batch K-means"),
    correctId: "b",
    explanation: "DBSCAN discovers clusters from density and can also identify noise points." },
  { skillSlug: "clustering-algorithms", difficulty: 4,
    prompt: "Which clustering algorithm handles non-spherical (crescent-shaped) clusters best?",
    options: OPTS("K-means", "DBSCAN", "K-medoids", "Fuzzy c-means"),
    correctId: "b",
    explanation: "Density-based clustering like DBSCAN handles arbitrary shapes. K-means assumes spherical clusters." },

  // ---------------- convolutional-neural-networks ----------------
  { skillSlug: "convolutional-neural-networks", difficulty: 2,
    prompt: "What does a convolutional layer primarily learn?",
    options: OPTS("Global statistics", "Local spatial patterns via filters", "Sequence order", "Attention weights"),
    correctId: "b",
    explanation: "Convolution filters slide over the input, detecting local patterns like edges, textures, and shapes." },
  { skillSlug: "convolutional-neural-networks", difficulty: 3,
    prompt: "Why do CNNs use pooling layers?",
    options: OPTS("To add parameters", "To reduce spatial dimensions and add translation invariance", "To increase resolution", "To replace activations"),
    correctId: "b",
    explanation: "Pooling downsamples feature maps, reducing computation and giving slight translation invariance." },
  { skillSlug: "convolutional-neural-networks", difficulty: 4,
    prompt: "Zero-padding in a Conv layer is used to:",
    options: OPTS("Reduce parameters", "Preserve spatial dimensions and edge information", "Add nonlinearity", "Speed up training"),
    correctId: "b",
    explanation: "Padding keeps output size closer to input size and lets filters see border pixels." },

  // ---------------- cross-validation-and-hyperparameter-tuning ----------------
  { skillSlug: "cross-validation-and-hyperparameter-tuning", difficulty: 2,
    prompt: "What does k-fold cross-validation do?",
    options: OPTS("Randomly drops rows", "Splits data into k folds and trains k times, each with a different validation fold", "Trains k models in parallel", "Uses k-fold ensemble"),
    correctId: "b",
    explanation: "Each fold serves as validation once. Results are averaged — a robust estimate of generalization." },
  { skillSlug: "cross-validation-and-hyperparameter-tuning", difficulty: 3,
    prompt: "Why keep a separate test set if we use cross-validation?",
    options: OPTS("To make training faster", "Cross-validation tunes hyperparameters; the test set gives an unbiased final estimate", "To satisfy licensing", "Test set is redundant"),
    correctId: "b",
    explanation: "Repeatedly peeking at CV scores leaks information. A held-out test set gives a clean final measure." },
  { skillSlug: "cross-validation-and-hyperparameter-tuning", difficulty: 4,
    prompt: "Random search often beats grid search for hyperparameter tuning because:",
    options: OPTS("It trains faster", "It explores more distinct values along important dimensions with the same budget", "It uses fewer folds", "It requires no validation"),
    correctId: "b",
    explanation: "When only a few hyperparameters matter, random sampling covers more useful points than a coarse grid." },

  // ---------------- data-structures-and-algorithms ----------------
  { skillSlug: "data-structures-and-algorithms", difficulty: 2,
    prompt: "What is the time complexity of binary search on a sorted array?",
    options: OPTS("O(1)", "O(log n)", "O(n)", "O(n log n)"),
    correctId: "b",
    explanation: "Each step halves the search space, giving O(log n)." },
  { skillSlug: "data-structures-and-algorithms", difficulty: 2,
    prompt: "Which data structure follows LIFO (last-in, first-out)?",
    options: OPTS("Queue", "Stack", "Linked list", "Heap"),
    correctId: "b",
    explanation: "A stack pushes and pops from the same end — the most recently added item leaves first." },
  { skillSlug: "data-structures-and-algorithms", difficulty: 3,
    prompt: "What is the average-case time complexity of a lookup in a hash table?",
    options: OPTS("O(1)", "O(log n)", "O(n)", "O(n²)"),
    correctId: "a",
    explanation: "With a good hash function and low load factor, lookups are amortized O(1)." },

  // ---------------- data-visualization ----------------
  { skillSlug: "data-visualization", difficulty: 2,
    prompt: "Which chart best shows the distribution of a single numeric variable?",
    options: OPTS("Pie chart", "Histogram", "Scatter plot", "Heatmap"),
    correctId: "b",
    explanation: "Histograms bin numeric values and reveal shape, skew, and modality." },
  { skillSlug: "data-visualization", difficulty: 3,
    prompt: "A scatter plot is most appropriate for:",
    options: OPTS("Showing parts of a whole", "Revealing relationships between two numeric variables", "Ranking categories", "Showing time-series over years"),
    correctId: "b",
    explanation: "Scatter plots show the joint distribution of two numeric variables, exposing correlation, clusters, and outliers." },
  { skillSlug: "data-visualization", difficulty: 3,
    prompt: "What does 'chartjunk' refer to?",
    options: OPTS("Data points", "Decorative elements that add no information", "Axis labels", "Color scales"),
    correctId: "b",
    explanation: "Coined by Edward Tufte — decorative clutter that distracts from the data." },

  // ---------------- dimensionality-reduction-and-pca ----------------
  { skillSlug: "dimensionality-reduction-and-pca", difficulty: 2,
    prompt: "What does PCA (Principal Component Analysis) do?",
    options: OPTS("Clusters rows", "Finds linear combinations of features that maximize variance", "Removes outliers", "Encodes categories"),
    correctId: "b",
    explanation: "PCA projects data onto orthogonal axes (components) ordered by explained variance." },
  { skillSlug: "dimensionality-reduction-and-pca", difficulty: 3,
    prompt: "The 'explained variance ratio' of a principal component tells you:",
    options: OPTS("Its mean", "How much of the data's total variance that component captures", "Its correlation with y", "The number of features it replaces"),
    correctId: "b",
    explanation: "Summing explained variance ratios across components shows how much information you retain." },
  { skillSlug: "dimensionality-reduction-and-pca", difficulty: 4,
    prompt: "PCA should be standardized (scaled) before use because:",
    options: OPTS("It requires integers", "It's sensitive to feature scales — larger-variance features would dominate", "It removes NaN", "It speeds up convergence only"),
    correctId: "b",
    explanation: "PCA maximizes variance, so a feature on a larger numeric scale can dominate purely because of units." },

  // ---------------- docker-and-containerization ----------------
  { skillSlug: "docker-and-containerization", difficulty: 2,
    prompt: "What is the difference between a Docker image and a container?",
    options: OPTS("They're the same", "An image is a template; a container is a running instance of it", "A container is a template", "Images only work on Linux"),
    correctId: "b",
    explanation: "Images are read-only blueprints. Containers are the running processes started from them." },
  { skillSlug: "docker-and-containerization", difficulty: 3,
    prompt: "A Dockerfile is:",
    options: OPTS("A binary", "A text file with instructions to build a Docker image", "A database schema", "A Kubernetes manifest"),
    correctId: "b",
    explanation: "Dockerfile instructions (FROM, RUN, COPY, CMD) produce a reproducible image." },
  { skillSlug: "docker-and-containerization", difficulty: 3,
    prompt: "The key difference between containers and VMs is:",
    options: OPTS("Containers are slower", "Containers share the host OS kernel; VMs run their own kernel", "VMs are smaller", "Containers can't be networked"),
    correctId: "b",
    explanation: "Containers share the kernel, making them lighter and faster to start than full VMs." },

  // ---------------- feature-engineering ----------------
  { skillSlug: "feature-engineering", difficulty: 2,
    prompt: "One-hot encoding is used to:",
    options: OPTS("Scale numerics", "Convert categorical variables into binary columns", "Fill missing values", "Remove outliers"),
    correctId: "b",
    explanation: "One-hot creates a binary column per category, avoiding an implied order in the numeric codes." },
  { skillSlug: "feature-engineering", difficulty: 3,
    prompt: "Feature scaling is MOST important for:",
    options: OPTS("Decision trees", "Distance- and gradient-based models (KNN, SVM, neural nets)", "Random forests", "Naive Bayes"),
    correctId: "b",
    explanation: "Tree-based models are scale-invariant. Distance and gradient methods require comparable scales." },
  { skillSlug: "feature-engineering", difficulty: 4,
    prompt: "Why create interaction features like x₁·x₂?",
    options: OPTS("To add noise", "To capture relationships a linear model can't express with x₁ and x₂ alone", "To reduce dimensions", "To reduce overfitting"),
    correctId: "b",
    explanation: "Interactions let linear models represent multiplicative effects, improving expressiveness." },

  // ---------------- linear-and-logistic-regression ----------------
  { skillSlug: "linear-and-logistic-regression", difficulty: 2,
    prompt: "The main difference between linear and logistic regression is:",
    options: OPTS("Linear uses gradients", "Logistic predicts class probabilities via a sigmoid; linear predicts continuous values", "Logistic has no coefficients", "Linear can't be regularized"),
    correctId: "b",
    explanation: "Logistic regression outputs probabilities in [0,1] for classification; linear regression fits a continuous target." },
  { skillSlug: "linear-and-logistic-regression", difficulty: 3,
    prompt: "The sigmoid function in logistic regression:",
    options: OPTS("Removes outliers", "Maps any real number to a value in (0, 1)", "Reduces bias", "Handles missing values"),
    correctId: "b",
    explanation: "σ(z) = 1 / (1 + e⁻ᶻ), squashing the linear combination into a probability." },
  { skillSlug: "linear-and-logistic-regression", difficulty: 3,
    prompt: "Logistic regression is typically trained by minimizing:",
    options: OPTS("Mean squared error", "Log loss (binary cross-entropy)", "Hinge loss", "0-1 loss"),
    correctId: "b",
    explanation: "Log loss is convex and matches the probabilistic output of the sigmoid." },

  // ---------------- mlops-and-model-registry ----------------
  { skillSlug: "mlops-and-model-registry", difficulty: 2,
    prompt: "A model registry is used to:",
    options: OPTS("Train models", "Version, store, and manage model artifacts and metadata", "Serve predictions", "Clean data"),
    correctId: "b",
    explanation: "A registry tracks model versions, metrics, and stages (e.g., staging → production)." },
  { skillSlug: "mlops-and-model-registry", difficulty: 3,
    prompt: "Why version models in production?",
    options: OPTS("To use more disk", "To enable rollback, A/B testing, and reproducibility", "To reduce accuracy", "To satisfy git"),
    correctId: "b",
    explanation: "Versioning lets you audit what's deployed, roll back if quality drops, and compare variants." },
  { skillSlug: "mlops-and-model-registry", difficulty: 4,
    prompt: "Model drift refers to:",
    options: OPTS("Random noise in training", "Degradation in performance over time as the world changes", "A compilation error", "Faster inference"),
    correctId: "b",
    explanation: "The data distribution the model sees in production diverges from training — accuracy drops." },

  // ---------------- ml-system-design-and-monitoring ----------------
  { skillSlug: "ml-system-design-and-monitoring", difficulty: 2,
    prompt: "Which is NOT typically monitored in an ML production system?",
    options: OPTS("Input distribution drift", "Prediction latency", "The number of source files in the repo", "Business KPIs"),
    correctId: "c",
    explanation: "Source file counts are irrelevant at runtime. Drift, latency, and KPI monitoring matter." },
  { skillSlug: "ml-system-design-and-monitoring", difficulty: 3,
    prompt: "Data drift vs concept drift:",
    options: OPTS("They are the same", "Data drift = input distribution shifts; concept drift = the input→output relationship changes", "Data drift is only for images", "Concept drift only happens in NLP"),
    correctId: "b",
    explanation: "Data drift = P(X) changes. Concept drift = P(y|X) changes — the underlying task itself shifts." },
  { skillSlug: "ml-system-design-and-monitoring", difficulty: 3,
    prompt: "Why log every prediction in production?",
    options: OPTS("To fill storage", "To debug failures, monitor drift, and enable retraining on real data", "To slow down inference", "To satisfy compliance only"),
    correctId: "b",
    explanation: "Logged predictions + features + eventual labels form the feedback loop for monitoring and retraining." },

  // ---------------- model-deployment-api ----------------
  { skillSlug: "model-deployment-api", difficulty: 2,
    prompt: "Serving a model via REST API means:",
    options: OPTS("Bundling the model in a mobile app", "Exposing an HTTP endpoint that returns predictions for posted inputs", "Training nightly", "Using SQL only"),
    correctId: "b",
    explanation: "Clients POST inputs, receive predictions — typically behind an HTTP layer with auth and monitoring." },
  { skillSlug: "model-deployment-api", difficulty: 3,
    prompt: "Batch vs real-time inference:",
    options: OPTS("They're identical", "Batch precomputes predictions on stored data; real-time responds per request", "Batch has lower latency", "Real-time is always cheaper"),
    correctId: "b",
    explanation: "Batch suits large offline jobs; online responds to individual requests with low latency." },
  { skillSlug: "model-deployment-api", difficulty: 4,
    prompt: "The p99 latency of a model API is:",
    options: OPTS("The fastest 1% of requests", "The latency below which 99% of requests fall", "Average latency", "The slowest possible"),
    correctId: "b",
    explanation: "p99 latency captures tail behavior — critical for user-perceived responsiveness." },

  // ---------------- model-evaluation-metrics ----------------
  { skillSlug: "model-evaluation-metrics", difficulty: 2,
    prompt: "Precision measures:",
    options: OPTS("Fraction of positives you caught", "Fraction of predicted positives that are actually positive", "Total accuracy", "Mean squared error"),
    correctId: "b",
    explanation: "Precision = TP / (TP + FP). High precision means few false positives." },
  { skillSlug: "model-evaluation-metrics", difficulty: 3,
    prompt: "RMSE is appropriate for:",
    options: OPTS("Binary classification", "Regression with numeric targets", "Clustering", "Text generation"),
    correctId: "b",
    explanation: "Root Mean Squared Error penalizes large errors, suitable for continuous targets." },
  { skillSlug: "model-evaluation-metrics", difficulty: 3,
    prompt: "R² of 1 means:",
    options: OPTS("The model is perfect", "The model explains none of the variance", "The model is random", "The data has no mean"),
    correctId: "a",
    explanation: "R² = 1 means predictions exactly match observations (up to constant offsets)." },

  // ---------------- model-optimization-and-quantization ----------------
  { skillSlug: "model-optimization-and-quantization", difficulty: 3,
    prompt: "Quantization reduces model size by:",
    options: OPTS("Deleting layers", "Reducing numerical precision (e.g., FP32 → INT8)", "Adding parameters", "Pruning neurons"),
    correctId: "b",
    explanation: "Fewer bits per weight reduces memory and can speed up inference, sometimes with small accuracy loss." },
  { skillSlug: "model-optimization-and-quantization", difficulty: 3,
    prompt: "Pruning a neural network means:",
    options: OPTS("Adding more layers", "Removing weights or neurons with low importance", "Increasing learning rate", "Repeating training"),
    correctId: "b",
    explanation: "Pruning creates sparse models by dropping small or unimportant parameters." },
  { skillSlug: "model-optimization-and-quantization", difficulty: 4,
    prompt: "Knowledge distillation trains a small 'student' model to:",
    options: OPTS("Ignore the teacher", "Mimic the outputs (or soft labels) of a larger 'teacher' model", "Use more parameters", "Increase latency"),
    correctId: "b",
    explanation: "The student learns from the teacher's soft probability distribution, often outperforming training on hard labels alone." },

  // ---------------- neural-network-architectures ----------------
  { skillSlug: "neural-network-architectures", difficulty: 2,
    prompt: "Which architecture is best for image data?",
    options: OPTS("Feedforward", "Convolutional Neural Network (CNN)", "Vanilla RNN", "Linear regression"),
    correctId: "b",
    explanation: "CNNs exploit spatial locality via convolution and weight sharing." },
  { skillSlug: "neural-network-architectures", difficulty: 4,
    prompt: "A residual (skip) connection in a neural network:",
    options: OPTS("Adds random noise", "Adds the input directly to a later layer's output, easing gradient flow", "Replaces activations", "Reduces input size"),
    correctId: "b",
    explanation: "Residuals let gradients flow through identity paths, enabling very deep networks (ResNet)." },
  { skillSlug: "neural-network-architectures", difficulty: 4,
    prompt: "Batch normalization helps training by:",
    options: OPTS("Reducing parameters", "Normalizing activations per mini-batch, stabilizing and speeding up training", "Removing nonlinearity", "Replacing dropout"),
    correctId: "b",
    explanation: "BatchNorm standardizes layer inputs, reducing internal covariate shift and allowing higher learning rates." },

  // ---------------- numpy-fundamentals ----------------
  { skillSlug: "numpy-fundamentals", difficulty: 2,
    prompt: "What is broadcasting in NumPy?",
    options: OPTS("Copying arrays", "Automatically aligning shapes of different sizes for arithmetic", "Repeating loops", "Printing arrays"),
    correctId: "b",
    explanation: "Broadcasting lets NumPy perform element-wise ops between arrays of compatible but different shapes." },
  { skillSlug: "numpy-fundamentals", difficulty: 3,
    prompt: "A key advantage of NumPy arrays over Python lists is:",
    options: OPTS("They store mixed types", "Vectorized operations and contiguous memory layout for speed", "They are mutable", "They can hold strings only"),
    correctId: "b",
    explanation: "NumPy arrays are typed, contiguous, and support fast C-level vectorized math." },
  { skillSlug: "numpy-fundamentals", difficulty: 3,
    prompt: "'Vectorization' means:",
    options: OPTS("Writing loops", "Replacing Python loops with array-level operations", "Using GPUs", "Removing numpy"),
    correctId: "b",
    explanation: "Vectorized code expresses operations on whole arrays, avoiding slow Python-level loops." },

  // ---------------- pandas-data-manipulation ----------------
  { skillSlug: "pandas-data-manipulation", difficulty: 2,
    prompt: "df.head() returns:",
    options: OPTS("Last 5 rows", "First 5 rows", "All rows", "The column names"),
    correctId: "b",
    explanation: "head(n) shows the first n rows (default 5) — a quick peek at the data." },
  { skillSlug: "pandas-data-manipulation", difficulty: 3,
    prompt: "groupby is used to:",
    options: OPTS("Sort rows", "Aggregate values across groups defined by one or more columns", "Rename columns", "Merge dataframes"),
    correctId: "b",
    explanation: "Split-apply-combine: group rows by a key, apply an aggregation (mean, sum, count), and combine." },
  { skillSlug: "pandas-data-manipulation", difficulty: 3,
    prompt: "The difference between .loc and .iloc is:",
    options: OPTS("They're identical", ".loc is label-based; .iloc is integer-position-based", ".loc is for Series only", ".iloc is deprecated"),
    correctId: "b",
    explanation: "df.loc['row_label'] uses labels; df.iloc[0] uses integer position." },

  // ---------------- recurrent-neural-networks ----------------
  { skillSlug: "recurrent-neural-networks", difficulty: 3,
    prompt: "RNNs struggle with long sequences because of:",
    options: OPTS("Too many parameters", "Vanishing or exploding gradients during backprop through time", "Slow GPUs", "Lack of nonlinearity"),
    correctId: "b",
    explanation: "Gradients shrink or explode as they propagate back through many time steps." },
  { skillSlug: "recurrent-neural-networks", difficulty: 3,
    prompt: "LSTM units solve the vanishing gradient problem using:",
    options: OPTS("More layers", "Gates that control what to remember and forget", "Higher learning rates", "Dropout"),
    correctId: "b",
    explanation: "Input, forget, and output gates regulate the cell state, allowing long-range information to persist." },
  { skillSlug: "recurrent-neural-networks", difficulty: 4,
    prompt: "Backpropagation through time (BPTT) is:",
    options: OPTS("A real-time training variant", "Applying backprop on an unrolled RNN over multiple time steps", "A scheduling algorithm", "A type of dropout"),
    correctId: "b",
    explanation: "BPTT unrolls the RNN across time and computes gradients through the whole sequence." },

  // ---------------- supervised-learning-basics ----------------
  { skillSlug: "supervised-learning-basics", difficulty: 1,
    prompt: "Which task is classification?",
    options: OPTS("Predicting tomorrow's temperature", "Predicting whether an email is spam", "Clustering news articles", "Compressing images"),
    correctId: "b",
    explanation: "Classification predicts discrete categories; spam vs not-spam is binary classification." },
  { skillSlug: "supervised-learning-basics", difficulty: 2,
    prompt: "Supervised learning requires:",
    options: OPTS("Only input features", "Input-output pairs (labeled data)", "No data", "Only unlabeled data"),
    correctId: "b",
    explanation: "Labels teach the model the mapping between inputs and targets." },
  { skillSlug: "supervised-learning-basics", difficulty: 3,
    prompt: "Why split data into train and test sets?",
    options: OPTS("To speed up training", "To measure how well the model generalizes to unseen data", "To satisfy licenses", "To reduce features"),
    correctId: "b",
    explanation: "The test set is held out during training to estimate true generalization error." },

  // ---------------- support-vector-machines ----------------
  { skillSlug: "support-vector-machines", difficulty: 3,
    prompt: "Support vectors in an SVM are:",
    options: OPTS("Random points", "The training points closest to the decision boundary", "The largest points", "Weights of the model"),
    correctId: "b",
    explanation: "Only the support vectors determine the margin and hence the decision boundary." },
  { skillSlug: "support-vector-machines", difficulty: 4,
    prompt: "The 'kernel trick' allows SVMs to:",
    options: OPTS("Skip training", "Implicitly map data to higher dimensions without computing it explicitly", "Use no parameters", "Remove support vectors"),
    correctId: "b",
    explanation: "Kernels let linear classifiers act as nonlinear ones by operating in an implicit feature space." },
  { skillSlug: "support-vector-machines", difficulty: 4,
    prompt: "A larger value of C in an SVM (soft-margin) leads to:",
    options: OPTS("Wider margin, more misclassifications", "Narrower margin, fewer training misclassifications (more overfit risk)", "No effect", "Always better generalization"),
    correctId: "b",
    explanation: "C controls the tradeoff between margin width and training error. Large C → fewer margin violations → risk of overfitting." },

  // ---------------- unsupervised-learning ----------------
  { skillSlug: "unsupervised-learning", difficulty: 2,
    prompt: "Unsupervised learning learns from:",
    options: OPTS("Labeled examples", "Unlabeled data, finding structure without targets", "Only images", "Only audio"),
    correctId: "b",
    explanation: "No labels — the goal is to discover patterns, clusters, or reduced representations." },
  { skillSlug: "unsupervised-learning", difficulty: 3,
    prompt: "Which pair belongs to unsupervised learning?",
    options: OPTS("Regression and classification", "Clustering and dimensionality reduction", "Random forests and boosting", "SVMs and logistic regression"),
    correctId: "b",
    explanation: "Clustering groups similar points; dimensionality reduction compresses features — both unsupervised." },
  { skillSlug: "unsupervised-learning", difficulty: 3,
    prompt: "A real-world example of unsupervised learning is:",
    options: OPTS("Detecting spam emails", "Segmenting customers by purchase behavior", "Predicting house prices", "Recognizing digits"),
    correctId: "b",
    explanation: "Customer segmentation groups users by patterns without predefined categories." },
];

async function main() {
  console.log("📝 Seeding additional questions (batch 2)...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found.");
    process.exit(1);
  }

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const slugToSkill = new Map(skills.map((s) => [s.slug, s]));

  let created = 0;
  let skipped = 0;
  const missing = new Set<string>();

  for (const q of QUESTIONS) {
    const skill = slugToSkill.get(q.skillSlug);
    if (!skill) {
      missing.add(q.skillSlug);
      skipped++;
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: { domainId: domain.id, prompt: q.prompt },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const created_q = await prisma.question.create({
      data: {
        domainId: domain.id,
        prompt: q.prompt,
        options: q.options,
        correctId: q.correctId,
        explanation: q.explanation,
        difficulty: q.difficulty,
      },
    });

    await prisma.questionSkill.create({
      data: {
        questionId: created_q.id,
        skillId: skill.id,
        weight: 1.0,
      },
    });

    created++;
  }

  console.log(`📊 Summary:`);
  console.log(`   Created:            ${created}`);
  console.log(`   Skipped:            ${skipped}`);
  if (missing.size > 0) {
    console.log(`   Missing skills:     ${Array.from(missing).join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
