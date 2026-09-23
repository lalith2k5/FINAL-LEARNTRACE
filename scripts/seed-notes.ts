import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOTES: { matchTitle: string; body: string }[] = [
  {
    matchTitle: "Machine Learning Systems Design Book Outline",
    body: `## Overview
ML system design is the practice of shipping models that stay useful in production, not just accurate on a test set. Once a model leaves a notebook, it has to handle real users, drifting data, unpredictable load, and silent failures. This is what separates a data scientist from an ML engineer.

## Key concepts
- **Serving patterns**: batch, online (real-time), and streaming inference each trade latency for freshness.
- **Monitoring signals**: data drift, concept drift, prediction distribution, latency, throughput, and business KPIs.
- **Rollback safety**: versioned models, shadow deployments, and canary rollouts.
- **Feedback loops**: how predictions influence the data your model sees next.
- **Cost and latency budgets**: inference cost per request, GPU vs CPU, caching.

## Example
A recommender serves 10k requests/second. A new model has +2% CTR offline but +40% p99 latency. In production the latency hit costs more revenue than the CTR gain. The lesson: **offline metrics never tell the whole story**. Ship behind a canary, watch p99, and roll back if SLOs break.

## Common mistakes
- Monitoring only accuracy, ignoring input distribution shifts.
- Deploying without a shadow or canary stage.
- No logged predictions, so debugging production issues becomes guesswork.

## Next step
Learn about feature stores and online/offline consistency — the next bottleneck after basic serving.`,
  },
  {
    matchTitle: "The Illustrated Transformer by Jay Alammar",
    body: `## Overview
The Transformer is the architecture behind modern NLP and much of vision. Its core idea — **attention** — lets every token look at every other token and decide what to focus on. It replaced recurrence and convolution as the default for sequence modeling.

## Key concepts
- **Self-attention**: each token produces a query, key, and value; attention weights are softmax(QKᵀ / √d) · V.
- **Multi-head attention**: multiple attention heads run in parallel, each learning different relationships.
- **Positional encoding**: since attention is permutation-invariant, position must be added explicitly.
- **Feed-forward blocks**: pointwise MLPs applied to each token independently.
- **Residual + LayerNorm**: the glue that makes deep stacks trainable.

## Example
For "The cat sat on the mat because **it** was tired," attention lets the model link "it" back to "cat" — a long-range dependency RNNs struggle with. Each head can learn a different pattern: syntactic, semantic, or positional.

\`\`\`python
import torch
import torch.nn.functional as F

def attention(Q, K, V):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / d_k ** 0.5
    weights = F.softmax(scores, dim=-1)
    return weights @ V
\`\`\`

## Common mistakes
- Forgetting positional encodings — the model becomes order-blind.
- Scaling attention scores incorrectly (missing the √d_k factor).
- Assuming attention is free — it is quadratic in sequence length.

## Next step
Study efficient attention variants (Flash Attention, sparse attention) to understand the quadratic bottleneck.`,
  },
  {
    matchTitle: "Understanding LSTM Networks by Christopher Olah",
    body: `## Overview
Recurrent Neural Networks (RNNs) process sequences one step at a time, keeping a hidden state that summarizes everything seen so far. They were the dominant sequence model before Transformers and still matter for streaming and low-latency use cases.

## Key concepts
- **Hidden state**: a vector carried across time steps, updated at each input.
- **Weight sharing**: the same weights are used at every time step, unlike feedforward nets.
- **Backpropagation through time (BPTT)**: gradients flow backward across the sequence.
- **Vanishing / exploding gradients**: the core problem motivating LSTM and GRU.
- **Bidirectional RNNs**: process the sequence in both directions when future context is allowed.

## Example
Predicting the next word in "The sky is ___" requires remembering "sky" from earlier. A basic RNN does this by feeding its hidden state forward. But for longer gaps — "I grew up in France ... I speak fluent ___" — the signal decays. LSTMs add gates that decide what to remember and forget, solving this.

\`\`\`python
import torch.nn as nn

class SimpleRNN(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.rnn = nn.RNN(input_dim, hidden_dim, batch_first=True)
        self.head = nn.Linear(hidden_dim, input_dim)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.head(out)
\`\`\`

## Common mistakes
- Using plain RNNs for long sequences — use LSTM/GRU or Transformers instead.
- Forgetting to detach the hidden state between unrelated batches.
- Not clipping gradients, leading to exploding loss.

## Next step
Compare RNNs with 1D convolutions and Transformers to understand when each is the right tool.`,
  },
];

async function main() {
  console.log("📝 Filling note bodies...\n");

  let filled = 0;
  let skipped = 0;
  let notFound = 0;

  for (const note of NOTES) {
    const material = await prisma.material.findFirst({
      where: { title: note.matchTitle },
    });

    if (!material) {
      console.log(`⚠️  Not found: "${note.matchTitle}"`);
      notFound++;
      continue;
    }

    if (material.body && material.body.trim().length > 0) {
      console.log(`♻️  Already has body: "${material.title}"`);
      skipped++;
      continue;
    }

    await prisma.material.update({
      where: { id: material.id },
      data: { body: note.body },
    });
    console.log(`✅ Filled: "${material.title}"`);
    filled++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Filled:     ${filled}`);
  console.log(`   Skipped:    ${skipped}`);
  console.log(`   Not found:  ${notFound}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
