---
title: RAG
aka: Retrieval-Augmented Generation
tagline: RAG is just search + string concatenation with extra steps
primitives:
  - search index
  - string concatenation
category: patterns
origin: research
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "Search your documents for relevant chunks. Concatenate them into the prompt. Call the LLM. That's RAG. The 'retrieval' is a search query, the 'augmentation' is string concatenation, and the 'generation' is the same LLM call you were already making."
  lang: "typescript"
  code: |
    const chunks = await searchIndex.query(userQuestion, { topK: 5 });
    const context = chunks.map(c => c.text).join("\n\n");
    const response = await llm.chat({
      system: `Answer using this context:\n${context}`,
      messages: [{ role: "user", content: userQuestion }],
    });
draft: false
---

## What they say

RAG is an "advanced AI architecture" that "grounds LLM responses in your proprietary data," enabling models to "access up-to-date, domain-specific information" and "reduce hallucinations." It's positioned as a paradigm — the way to build knowledge-aware AI systems.

## What it actually is

You search your documents. You paste the results into the prompt. You call the LLM.[^1]

That's the entire architecture. "Retrieval" is a search query. "Augmentation" is string concatenation. "Generation" is the same `llm.chat()` call you were already making — it just has more context now.

### The pattern in pseudocode

```typescript
// Step 1: "Retrieval" — search your documents
const chunks = await searchIndex.query(userQuestion, { topK: 5 });

// Step 2: "Augmentation" — concatenate results into the prompt
const context = chunks.map(c => c.text).join("\n\n");

// Step 3: "Generation" — call the LLM with the extra context
const response = await llm.chat({
  system: `Answer based on the following documents:\n\n${context}`,
  messages: [{ role: "user", content: userQuestion }],
});
```

That's it. The three-letter acronym maps to: search, concat, prompt.[^2]

### The "extra steps"

1. **Chunking** — splitting documents into smaller pieces before indexing (text splitting with overlap, typically 500-1000 tokens)
2. **Embedding** — converting chunks into vectors for semantic search instead of keyword search (see: [Embeddings](/terms/embeddings))
3. **Reranking** — scoring the retrieved chunks by relevance before concatenating (another model call or a cross-encoder)
4. **Citation** — asking the LLM to reference which chunks it used (prompt engineering)
5. **Hybrid search** — combining keyword search (BM25) with vector search for better recall (two queries, merge results)

### What you already know

If you've built a search feature that shows results in a UI, you understand RAG. The only difference is the "UI" is an LLM's context window.

```typescript
// Traditional search → show results to human
const results = await search("how to reset password");
render(results);  // human reads and synthesizes

// RAG → show results to LLM
const results = await search("how to reset password");
const answer = await llm.chat({
  system: `Context:\n${results.join("\n")}`,
  messages: [{ role: "user", content: "how to reset password" }],
});
// LLM reads and synthesizes
```

In both cases, you're searching for relevant information and presenting it to a reader. RAG just replaced the human reader with an LLM. The search, the indexing, and the retrieval are the same patterns you've been using since Elasticsearch.[^3]

[^1]: [Retrieval-Augmented Generation — Wikipedia](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) — the original RAG paper (Lewis et al., 2020) introduced it as a way to combine retrieval with generation. The paper's architecture is more complex than most production RAG systems, which typically just search-and-concat.
[^2]: The typical RAG pipeline — chunk, embed, index, query, concat, prompt — can be built in under 50 lines of code. Most of the complexity in production systems comes from chunking strategy and retrieval quality, not the architecture itself.
[^3]: [Elasticsearch — Wikipedia](https://en.wikipedia.org/wiki/Elasticsearch) — full-text search engines have been doing the "retrieval" part of RAG since 2010. Vector databases added semantic similarity, but BM25 keyword search is still competitive for many use cases, and hybrid search (BM25 + vectors) often beats either alone.
