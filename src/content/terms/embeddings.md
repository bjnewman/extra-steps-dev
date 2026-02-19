---
title: Embeddings
aka:
  - Vector Embeddings
  - Semantic Embeddings
tagline: Embeddings are just hash functions that preserve similarity with extra steps
primitives:
  - hash function
  - nearest-neighbor search
category: data
origin: research
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "An embedding is a function that maps text to a fixed-size array of numbers. Similar text maps to nearby points. 'Semantic search' is computing this hash, then finding the nearest neighbors. It's a hash function that preserves meaning instead of uniqueness."
  lang: "typescript"
  code: |
    // "Embedding" — text in, number array out
    const vec = await embed("how do I reset my password");
    // [0.021, -0.187, 0.441, ...] (1536 floats)

    // "Semantic search" — nearest neighbor lookup
    const results = await vectorDB.query(vec, { topK: 5 });
draft: false
---

## What they say

Embeddings "capture the semantic meaning of text" in "high-dimensional vector space." They enable "semantic understanding" and "meaning-based search" — a fundamental advance beyond keyword matching. Vector databases are the "infrastructure layer for AI applications."

## What it actually is

An embedding model takes text and outputs a fixed-size array of floating-point numbers.[^1] Similar inputs produce similar arrays. "Semantic search" is computing this array for your query and finding the stored arrays closest to it.

It's a hash function that preserves similarity instead of uniqueness.

### The pattern in pseudocode

```typescript
// 1. Embed your documents (once, at index time)
for (const doc of documents) {
  const vector = await embed(doc.text);        // text → float[]
  await vectorDB.insert({ id: doc.id, vector, text: doc.text });
}

// 2. Embed the query (at search time)
const queryVec = await embed("how do I reset my password");

// 3. Find nearest neighbors (cosine similarity or dot product)
const results = await vectorDB.query(queryVec, { topK: 5 });
// Returns the 5 documents whose vectors are closest to the query vector
```

The "vector database" is an index optimized for nearest-neighbor search on these arrays. That's it.[^2]

### The "extra steps"

1. **Dimensionality** — embedding models output 768-3072 floats per input (the "high-dimensional" part — just a long array)
2. **Distance metric** — cosine similarity, dot product, or Euclidean distance to measure "closeness" (basic vector math)
3. **Approximate search** — for large datasets, exact nearest-neighbor is slow, so vector DBs use approximate algorithms like HNSW (trading accuracy for speed)
4. **Chunking** — embedding models have token limits, so long documents get split into chunks first (same as RAG's chunking step)

### What you already know

If you've used a hash function to look something up in a hash table, you understand the core idea. The difference is what "similar" means:

```typescript
// Cryptographic hash — DESTROYS similarity
md5("hello")  // 5d41402abc4b2a76b9719d911017c592
md5("hallo")  // 59e1748004813d39e408880dbc22d826
// Completely different outputs for similar inputs. By design.

// Embedding — PRESERVES similarity
embed("how to reset password")    // [0.021, -0.187, 0.441, ...]
embed("forgot my password help")  // [0.019, -0.191, 0.438, ...]
// Nearly identical outputs for similar inputs. By design.
```

Both are functions that map variable-length input to fixed-length output. A hash table uses exact match to find entries; a vector database uses nearest-neighbor to find entries. The mental model is the same — the distance metric changed.[^3]

[^1]: [Word embedding — Wikipedia](https://en.wikipedia.org/wiki/Word_embedding) — the concept dates back to Word2Vec (Mikolov et al., 2013) and even earlier distributional semantics. Modern embedding models (OpenAI's `text-embedding-3-small`, Cohere's `embed-v3`) produce denser, more general-purpose vectors, but the core idea is unchanged: text in, numbers out.
[^2]: [Nearest neighbor search — Wikipedia](https://en.wikipedia.org/wiki/Nearest_neighbor_search) — the algorithmic problem that vector databases solve. [HNSW](https://en.wikipedia.org/wiki/Hierarchical_navigable_small_world) (Hierarchical Navigable Small World) is the most common approximate algorithm used by Pinecone, Weaviate, and pgvector.
[^3]: [Cosine similarity — Wikipedia](https://en.wikipedia.org/wiki/Cosine_similarity) — the most common distance metric for text embeddings. It measures the angle between two vectors, ignoring magnitude. Two documents about the same topic will have a cosine similarity close to 1.0, regardless of length.
