---
title: Memory
tagline: Memory is just a key/value store with extra steps
primitives:
  - key/value store
  - file append
  - system prompt injection
category: patterns
audience: app-dev
origin: vendor
publishedAt: 2026-02-17
snippet:
  prose: "The LLM can't remember anything between conversations — it's stateless. 'Memory' is just your application writing facts to a file (or database) and reading them back into the system prompt next time. The model isn't remembering. You are."
  lang: "typescript"
  code: |
    // "Remembering" something
    await fs.appendFile('memory.txt', `User prefers TypeScript\n`);

    // "Recalling" it next session
    const memories = await fs.readFile('memory.txt', 'utf-8');
    const response = await llm.chat({
      system: `What you know about this user:\n${memories}`,
      messages: [userMessage],
    });
draft: false
---

## What they say

Memory lets AI "remember things about you across conversations," "learn your preferences over time," and "build a persistent understanding of who you are." OpenAI has Memory, Claude has Memory, Gemini has Memory, Kiro has Memory. Each one implies the model is doing something special.

## What it actually is

The LLM is stateless. Every conversation starts fresh — the model has no access to previous sessions. "Memory" is a feature your application (or the vendor's platform) builds on top: persist facts to storage, retrieve them at the start of the next conversation, prepend them to the system prompt.[^1]

### The pattern in pseudocode

```typescript
// Session ends — persist what's worth keeping
async function saveMemory(fact: string) {
  await db.upsert('memories', { userId, fact, updatedAt: new Date() });
}

// Next session starts — load and inject
async function loadMemories(userId: string): Promise<string> {
  const rows = await db.query('SELECT fact FROM memories WHERE userId = ?', [userId]);
  return rows.map(r => r.fact).join('\n');
}

// The "memory" is just a string prepended to the system prompt
const system = `
You are a helpful assistant.

What you know about this user:
${await loadMemories(userId)}
`.trim();

const response = await llm.chat({ system, messages });
```

The model isn't doing anything different. The application is doing the remembering.

### The "extra steps"

1. **Extraction** — deciding what's worth saving (another LLM call, or a hard-coded rule)
2. **Storage** — a database, flat file, or the vendor's managed store (just a write)
3. **Retrieval** — loading memories at session start (just a read)
4. **Injection** — prepending to the system prompt (string concatenation)
5. **Eviction** — deciding what to forget when the memory store gets too large (LRU, relevance scoring, or a max token budget)

### What you already know

If you've ever stored user preferences in localStorage and read them back on page load, you've built memory. Same pattern: write on exit, read on entry, inject into context.

```javascript
// localStorage version — you've written this
const theme = localStorage.getItem('theme') ?? 'light';
document.body.dataset.theme = theme;

// LLM memory version — same idea
const memories = await loadMemories(userId);
systemPrompt = basePrompt + '\n\nUser context:\n' + memories;
```

The difference is that localStorage stores a preference; LLM memory stores facts that get read by the model. The mechanism is identical.[^2]

[^1]: Every major vendor's memory implementation works this way. [OpenAI Memory](https://help.openai.com/en/articles/8590148-memory-faq) stores facts and injects them into future conversations. [Claude's memory](https://support.anthropic.com/en/articles/9518834-what-is-claude-s-memory) in Claude.ai works the same way. [Kiro's memory](https://kiro.dev) and [Gemini's memory](https://support.google.com/gemini/answer/14525491) follow the same pattern. The LLM is stateless in all cases — [statelessness](https://en.wikipedia.org/wiki/Stateless_protocol) is a fundamental property of the API.
[^2]: [Key–value database — Wikipedia](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) — the simplest possible storage model, and what almost every memory implementation reduces to at the persistence layer.
