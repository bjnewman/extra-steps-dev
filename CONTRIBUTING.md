# Contributing to extra-steps.dev

Want to add a term? Great. Here's how.

## Adding a new term

1. Create `src/content/terms/your-term.md`
2. Add the required frontmatter (see schema below)
3. Write the four required sections
4. Run `bun run build` to verify
5. Open a PR

### Frontmatter schema

```yaml
---
title: Your Term          # The marketing buzzword
aka: Full Name            # Optional: expanded acronym
tagline: "X is just Y with extra steps"
primitives:
  - primitive-1
  - primitive-2
category: protocols       # protocols | patterns | architecture | data
audience: app-dev         # app-dev | infra | ml-eng
publishedAt: 2026-02-16   # ISO date
draft: false
---
```

### Required sections

Every term entry must have these four sections:

1. **What they say** — How the term is marketed. Quote the hype, cite the sources.
2. **What it actually is** — The CS primitive(s) underneath. Be specific and accurate.
3. **The "extra steps"** — What the marketing term adds on top of the primitive. Be fair: some of these steps have real value.
4. **What you already know** — Connect it to something the reader has already built or used.

### Content guidelines

- **Be accurate.** If the mapping is wrong, someone will (rightly) call it out.
- **Be fair.** The goal is demystification, not dismissal. Some "extra steps" are genuinely useful.
- **Be specific.** Show pseudocode or real code. "It's basically just X" is not enough.
- **Target app developers.** Assume the reader builds applications with LLM APIs, not that they train models or manage GPU clusters.

### Scope

In scope:
- Terms used when building LLM-powered applications
- Protocols, patterns, and data formats in the AI app dev ecosystem

Out of scope:
- ML/AI training terminology (transformers, attention, RLHF)
- Infrastructure terminology (GPU clusters, model serving, quantization)
- General CS concepts that aren't specific to the AI hype cycle

## Development

```bash
bun install       # install dependencies
bun run dev       # start dev server
bun run build     # production build
bun run lint      # run linter
```

## Code style

- No client-side JavaScript (static site only)
- CSS uses custom properties defined in `src/styles/tokens.css`
- BEM naming for CSS classes
- Astro components for everything (no React needed)
