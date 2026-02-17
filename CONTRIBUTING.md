# Contributing to extra-steps.dev

extra-steps.dev is a community reference that maps AI marketing hype to CS primitives. Every term follows the same pattern: "X is just Y with extra steps." Contributions are welcome — the bar is accuracy, not formality.

## Contribution workflow

**Open an issue before opening a PR for new terms.** The issue template forces you to articulate the primitive mapping before writing prose. If the mapping is wrong, it's easier to correct at issue stage than after a full writeup.

Corrections to existing terms can go straight to a PR.

### Step 1: Propose the term (new terms only)

Open a [New Term Proposal](https://github.com/bjnewman/extra-steps-dev/issues/new?template=new-term.yml) issue. You'll be asked for:

- The marketing term
- A proposed tagline (`"X is just Y with extra steps"`)
- The CS primitives it maps to
- What an app developer has already built that maps to it
- Primary sources (specs, Wikipedia, official docs)

Issues are triaged promptly. If the primitive mapping needs adjusting, that happens here — before you write anything.

### Step 2: Write the term

Once an issue is open (or immediately, for corrections), create `src/content/terms/your-term-slug.md`.

**Frontmatter schema:**

```yaml
---
title: Your Term          # The marketing buzzword (e.g., "MCP")
aka: Full Name            # Optional: expanded acronym
tagline: "X is just Y with extra steps"
primitives:
  - primitive-1           # CS concepts, not other AI marketing terms
  - primitive-2
category: protocols       # protocols | patterns | architecture | data
audience: app-dev         # app-dev | infra | ml-eng
publishedAt: 2026-02-16   # ISO date
draft: false
snippet:
  prose: "One paragraph preview for the accordion on the index page."
  lang: typescript        # language for syntax highlighting
  code: |
    // Real pseudocode — not English in a code block
    const result = await someRealFunction(args);
---
```

**Required sections** (in this order):

```markdown
## What they say
How the term is marketed. Quote the hype directly.

## What it actually is
The CS primitive(s) underneath. Be specific. Show real pseudocode.

## The "extra steps"
What the marketing term adds on top of the primitive.
Be fair — some extra steps have genuine value.

## What you already know
Connect it to something the reader has already built.
Target: app developers who've called fetch(), written a webhook handler,
or copy-pasted a system prompt into ChatGPT. Not CS academics.
```

**Citations:** At least one footnote (`[^1]`) pointing to a spec, Wikipedia article, or official docs. Wikipedia is fine — it links out to primary sources. Marketing blog posts are not acceptable as primary citations.

### Step 3: Verify locally

```bash
bun install
bun run build       # validates Zod schema
bun run validate    # validates prose rules
bun run test        # unit tests
```

All three must pass before opening a PR. If you can't run locally, CI will catch everything and tell you exactly what to fix.

### Step 4: Open a PR

The PR template has a checklist. CI runs automatically and posts results within a few minutes.

---

## Content guidelines

**Be accurate.** The primitive mapping is the whole point. If the mapping is wrong, someone will (rightly) call it out — and the correction becomes a contribution too.

**Be fair.** This is demystification, not dismissal. "Agents = while loop" is accurate. "Agents are just a while loop, therefore agents are useless" is not the point.

**Be specific.** Every term needs real pseudocode. "It's basically just X" in prose is not enough — show the shape of the code.

**Target app developers.** The audience has called `fetch()`, written a webhook handler, and pasted a system prompt into the playground. They have not necessarily built a REPL, designed a protocol, or read a research paper. The "What you already know" section should connect to concrete, specific things they've done — not things they've heard of.

**Primitives are CS concepts.** The `primitives` array should contain things a CS textbook would recognize: `while loop`, `JSON-RPC`, `function dispatch`, `stdin/stdout`. Not: `tool use`, `agentic loop`, `LLM context`.

---

## Scope

**In scope:**
- Terms used when building LLM-powered applications
- Protocols, patterns, and data formats in the AI app-dev ecosystem

**Out of scope:**
- ML/AI training terminology (transformers, attention, RLHF, fine-tuning)
- Infrastructure terminology (GPU clusters, model serving, quantization)
- General CS concepts that aren't specific to the AI hype cycle

---

## Development

```bash
bun install           # install dependencies
bun run dev           # dev server at localhost:4321
bun run build         # production build
bun run validate      # prose validation
bun run lint          # linter
bun run typecheck     # type check
bun run test          # unit tests
bun run test:e2e      # E2E tests (requires build first)
```

## Code style

- No client-side JavaScript beyond the search input (static site)
- CSS custom properties defined in `src/styles/tokens.css`
- BEM naming for CSS classes
- Astro components for everything
