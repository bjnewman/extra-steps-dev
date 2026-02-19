---
title: Prompt Engineering
aka:
  - Prompt Design
  - Prompt Crafting
tagline: Prompt engineering is just writing clear instructions — no extra steps
primitives:
  - natural language
  - markdown
category: patterns
origin: industry
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "A system prompt is a README for the model. 'Few-shot examples' are worked examples. 'Chain of thought' is asking someone to show their work. Prompt engineering is technical writing — the skills transfer directly, the mystification doesn't."
  lang: "markdown"
  code: |
    You are a code reviewer. When reviewing, check for:
    1. Security: hardcoded secrets, injection vulnerabilities
    2. Performance: O(n²) loops, unnecessary allocations

    Example:
    Input: `eval(user_input)`
    Output: "CRITICAL: arbitrary code execution via eval()"
draft: false
---

## What they say

Prompt engineering is a "new discipline" requiring "specialized skills" to "unlock the full potential of AI models." It's a job title, a certification track, and — briefly — a six-figure career path. The framing implies a fundamentally new kind of expertise.

## What it actually is

You're writing instructions for a system that reads English. The quality of the output depends on the clarity of the input — same as writing a requirements doc, an API specification, or a ticket for a junior developer.[^1]

### The pattern in pseudocode

```markdown
# System prompt — a README for the model

You are a customer support agent for Acme Corp.

## Rules
- Always greet the customer by name
- Never promise refunds without manager approval
- If unsure, escalate to a human

## Tone
Professional but warm. No corporate jargon.

## Examples

User: "I want a refund for order #1234"
Response: "Hi [name], I can see order #1234. Let me look into the refund
options for you. I'll need to check with my team — can I follow up
within the hour?"
```

That's a prompt. It's also a style guide, a runbook, and an onboarding document — all formats that existed before LLMs.[^2]

### The "extra steps"

1. **System prompts** — persistent instructions prepended to every conversation (a config file the model reads)
2. **Few-shot examples** — showing input/output pairs so the model learns the pattern (worked examples in a textbook)
3. **Chain of thought** — asking the model to reason step-by-step before answering ("show your work")
4. **Structured output** — specifying the format you want back: JSON, XML, markdown (an output schema)
5. **Temperature and top-p** — parameters controlling randomness (confidence threshold tuning)

### What you already know

If you've written a clear ticket for another developer — with context, acceptance criteria, edge cases, and examples — you've done prompt engineering. The skills are identical:

```markdown
# Bad ticket (bad prompt)
"Fix the login bug"

# Good ticket (good prompt)
"The login form accepts empty passwords when OAuth is disabled.
Steps to reproduce: [...]
Expected: validation error before API call
Actual: 500 error from /api/auth
Edge case: also check the 'remember me' flow"
```

Specificity, examples, edge cases, and format — these are technical writing skills. The model is a very fast, very literal reader. Write clearly and it performs better. This isn't a new discipline; it's a rediscovery of how much clear communication matters.[^3]

[^1]: The term "prompt engineering" emerged in 2022-2023 as LLMs became widely accessible. The original [OpenAI documentation](https://platform.openai.com/docs/guides/prompt-engineering) frames it as a set of strategies: "write clear instructions," "provide reference text," "split complex tasks into simpler subtasks." These are general writing and communication principles with a new name.
[^2]: [Anthropic's prompt engineering guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — notably practical and devoid of mystification. The recommendations boil down to: be specific, give examples, use structured formats. This is good technical writing advice, applied to a new reader.
[^3]: The parallel to [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging) is exact. Explaining a problem clearly enough for a rubber duck (or an LLM) to "understand" often solves the problem — not because the duck is smart, but because articulating the problem forces you to think through it. Prompt engineering is rubber duck debugging at scale.
