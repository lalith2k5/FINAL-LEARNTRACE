import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VideoSeed = { skillSlug: string; title: string; url: string };

// Each entry is a YouTube URL. The check mode below verifies each one
// returns HTTP 200 before seeding, so bad IDs are filtered automatically.
const VIDEOS: VideoSeed[] = [
  { skillSlug: "python-programming", title: "Learn Python — Full Course for Beginners", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
  { skillSlug: "linear-algebra", title: "Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
  { skillSlug: "calculus", title: "Essence of Calculus", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
  { skillSlug: "probability-and-statistics", title: "Statistics 110: Probability (Harvard)", url: "https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo" },
  { skillSlug: "data-structures-and-algorithms", title: "Algorithms and Data Structures — Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0" },
  { skillSlug: "numpy-fundamentals", title: "Complete Python NumPy Tutorial", url: "https://www.youtube.com/watch?v=GB9ByFAIAH4" },
  { skillSlug: "pandas-data-manipulation", title: "Learn Pandas & Python for Data Analysis", url: "https://www.youtube.com/watch?v=vmEHCJofslg" },
  { skillSlug: "data-visualization", title: "Matplotlib & Seaborn Full Tutorial", url: "https://www.youtube.com/watch?v=3Xc3CA655Y4" },
  { skillSlug: "exploratory-data-analysis", title: "Exploratory Data Analysis Full Course", url: "https://www.youtube.com/watch?v=HVAFflj2PS0" },
  { skillSlug: "data-preprocessing", title: "Data Preprocessing for Machine Learning", url: "https://www.youtube.com/watch?v=0xVqLJe9_CY" },
  { skillSlug: "feature-engineering", title: "Feature Engineering Full Course", url: "https://www.youtube.com/watch?v=ma-h30PoFms" },
  { skillSlug: "supervised-learning-basics", title: "Machine Learning for Everybody", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg" },
  { skillSlug: "linear-and-logistic-regression", title: "StatQuest: Logistic Regression", url: "https://www.youtube.com/watch?v=yIYKR4sgzI8" },
  { skillSlug: "decision-trees-and-ensembles", title: "StatQuest: Random Forests", url: "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ" },
  { skillSlug: "support-vector-machines", title: "StatQuest: Support Vector Machines", url: "https://www.youtube.com/watch?v=efR1C6CvhmE" },
  { skillSlug: "unsupervised-learning", title: "Unsupervised Learning Explained", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
  { skillSlug: "clustering-algorithms", title: "Clustering Algorithms Full Course", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
  { skillSlug: "dimensionality-reduction-and-pca", title: "StatQuest: PCA Step-by-Step", url: "https://www.youtube.com/watch?v=FgakZw6K1QQ" },
  { skillSlug: "model-evaluation-metrics", title: "Model Evaluation Metrics Explained", url: "https://www.youtube.com/watch?v=trg3YkCsjqE" },
  { skillSlug: "cross-validation-and-hyperparameter-tuning", title: "Cross-Validation in Machine Learning", url: "https://www.youtube.com/playlist?list=PL5-da3qGB5ICeMbQuqbbCOQWcS6OYBr5A" },
  { skillSlug: "deep-learning-fundamentals", title: "Deep Learning Full Course", url: "https://www.youtube.com/watch?v=V_xro1bcAuA" },
  { skillSlug: "neural-network-architectures", title: "Neural Networks: Zero to Hero (Karpathy)", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
  { skillSlug: "convolutional-neural-networks", title: "Convolutional Neural Networks Explained", url: "https://www.youtube.com/watch?v=LxfUGhug-iQ" },
  { skillSlug: "recurrent-neural-networks", title: "Recurrent Neural Networks & LSTMs Explained", url: "https://www.youtube.com/watch?v=WCUNPb-5EYI" },
  { skillSlug: "transformers-and-attention", title: "Attention in Transformers, Step-by-Step", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc" },
  { skillSlug: "model-optimization-and-quantization", title: "Efficient ML: Pruning, Quantization, Distillation", url: "https://www.youtube.com/watch?v=u5_JorytAcI" },
  { skillSlug: "docker-and-containerization", title: "Docker Full Course for Beginners", url: "https://www.youtube.com/watch?v=RqTEHSBrYFw" },
  { skillSlug: "mlops-and-model-registry", title: "MLOps with MLflow — Full Tutorial", url: "https://www.youtube.com/watch?v=OKk9U310qYE" },
  { skillSlug: "model-deployment-api", title: "Deploy ML Model as a Dockerized API", url: "https://www.youtube.com/watch?v=JMGe4yIoBRA" },
  { skillSlug: "ml-system-design-and-monitoring", title: "Machine Learning System Design", url: "https://www.youtube.com/watch?v=0RsmRjar66E" },
];

// Use YouTube's oEmbed endpoint — returns 200 for valid videos AND
// playlists, 404 for bogus IDs. The plain /watch URL returns 200 even
// for broken IDs (shows "Video unavailable" page), so HEAD is useless.
async function checkUrl(url: string): Promise<boolean> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url
    )}&format=json`;
    const res = await fetch(oembed, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const mode = process.argv[2] ?? "check";

  console.log(`📺 Video seed — mode: ${mode}\n`);

  if (mode === "check") {
    console.log("Verifying each video URL returns HTTP 200...\n");
    let ok = 0;
    let bad = 0;
    for (const v of VIDEOS) {
      const valid = await checkUrl(v.url);
      if (valid) {
        console.log(`  ✓ ${v.skillSlug}`);
        ok++;
      } else {
        console.log(`  ✗ ${v.skillSlug}  → ${v.url}`);
        bad++;
      }
    }
    console.log(`\n📊 ${ok} ok / ${bad} bad`);
    if (bad > 0) {
      console.log(
        "\nFix the URLs marked ✗ above, then run: pnpm tsx scripts/seed-skill-videos.ts seed"
      );
    } else {
      console.log(
        "\nAll URLs valid. Run: pnpm tsx scripts/seed-skill-videos.ts seed"
      );
    }
    return;
  }

  if (mode === "seed") {
    const domain = await prisma.domain.findUnique({
      where: { slug: "ml-engineer" },
    });
    if (!domain) {
      console.error("❌ Domain 'ml-engineer' not found.");
      process.exit(1);
    }

    let created = 0;
    let skippedExisting = 0;
    let skippedMissingSkill = 0;
    let skippedBadUrl = 0;

    for (const v of VIDEOS) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId: domain.id, slug: v.skillSlug } },
      });
      if (!skill) {
        console.log(`  ⚠️  Skill not found: ${v.skillSlug}`);
        skippedMissingSkill++;
        continue;
      }

      // Skip if this skill already has a video material
      const existing = await prisma.materialSkill.findFirst({
        where: { skillId: skill.id, material: { type: "video" } },
      });
      if (existing) {
        console.log(`  ♻️  Already has video: ${v.skillSlug}`);
        skippedExisting++;
        continue;
      }

      // Only seed if URL resolves — skip broken IDs
      const valid = await checkUrl(v.url);
      if (!valid) {
        console.log(`  ✗ Skipping (bad URL): ${v.skillSlug}`);
        skippedBadUrl++;
        continue;
      }

      const material = await prisma.material.create({
        data: {
          domainId: domain.id,
          title: v.title,
          type: "video",
          url: v.url,
        },
      });
      await prisma.materialSkill.create({
        data: { materialId: material.id, skillId: skill.id },
      });
      console.log(`  ✅ ${v.skillSlug}: ${v.title}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created:              ${created}`);
    console.log(`   Skipped (existing):   ${skippedExisting}`);
    console.log(`   Skipped (missing):    ${skippedMissingSkill}`);
    console.log(`   Skipped (bad URL):    ${skippedBadUrl}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
