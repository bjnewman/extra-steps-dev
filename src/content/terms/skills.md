---
title: Skills
tagline: Skills are just markdown files with YAML frontmatter
primitives:
  - markdown
  - YAML frontmatter
  - prompt templates
category: data
audience: app-dev
publishedAt: 2026-02-16
snippet:
  prose: "A skill is a markdown file with YAML frontmatter that gets appended to the system prompt. The LLM reads it like any other instruction. There's no runtime magic — it's string concatenation."
  lang: "markdown"
  code: |
    ---
    name: code-reviewer
    description: Reviews code for correctness and style
    ---

    When reviewing code, check for:
    1. Off-by-one errors
    2. Unhandled edge cases
    3. Missing error handling

    Always explain *why* something is wrong, not just that it is.
draft: false
---

## What they say

Skills are "reusable capabilities" that give AI agents "specialized knowledge and abilities." They let you "extend your agent's capabilities" and "create modular, composable AI workflows."

## What it actually is

A skill is a markdown file. The YAML frontmatter contains metadata (name, description, when to use it). The body contains instructions — a prompt template that gets injected into the system prompt or conversation when the skill is activated.

### The pattern in pseudocode

```yaml
# ~/.claude/skills/code-review.md
---
name: Code Review
description: Reviews code for quality, security, and performance
trigger: When the user asks for a code review
---

Review the code following these criteria:

1. **Security**: Check for hardcoded secrets, injection vulnerabilities
2. **Performance**: Identify O(n^2) loops, unnecessary allocations
3. **Readability**: Clear naming, single responsibility, comments on "why"

Format your response as:
- **Issues**: Blocking problems
- **Suggestions**: Non-blocking improvements
- **Praise**: Things done well
```

### The "extra steps"

1. **Discovery** — scanning a directory for `.md` files and parsing their frontmatter (glob + YAML parse)
2. **Selection** — the LLM or a router decides which skill applies (string matching or another LLM call)
3. **Injection** — the skill's body gets prepended or appended to the conversation (string concatenation)
4. **Composition** — multiple skills can be active at once (array of strings joined together)

### What you already know

If you've used Jekyll, Hugo, Astro, or any static site generator with frontmatter, you've built the data model for skills. If you've written a prompt template with variables, you've written a skill. The "skill system" is a directory of text files with metadata.
