---
title: Skills
aka:
  - Gems
  - GPTs
  - Custom Instructions
tagline: Skills are just markdown files with YAML frontmatter with extra steps
primitives:
  - markdown
  - YAML frontmatter
  - prompt templates
category: data
audience: app-dev
origin: vendor
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

Every vendor has a different name for the same thing: Anthropic calls them **Skills** (Claude Code), Google calls them **Gems** (Gemini), OpenAI calls them **GPTs** or **Custom Instructions** (ChatGPT). Same pattern everywhere.

## What it actually is

A skill is a markdown file.[^1] The YAML frontmatter[^2] contains metadata (name, description, when to use it). The body contains instructions — a prompt template that gets injected into the system prompt or conversation when the skill is activated.

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
```

### The "extra steps"

1. **Discovery** — scanning a directory for `.md` files and parsing their frontmatter (glob + YAML parse)
2. **Selection** — the LLM or a router decides which skill applies (string matching or another LLM call)
3. **Injection** — the skill's body gets prepended or appended to the conversation (string concatenation)[^3]
4. **Composition** — multiple skills can be active at once (array of strings joined together)

### What you already know

If you've copy-pasted a system prompt into ChatGPT to make it "act like a code reviewer," you've written a skill. The only difference is that a skill system reads those prompts from files instead of the clipboard — so you can version them, share them, and swap them out without editing your code.

The "skill system" is: `fs.readFileSync('skills/code-review.md')` + string concatenation into the system prompt.[^3]

[^1]: [Claude Code skills tutorial](https://docs.anthropic.com/en/docs/claude-code/skills-tutorial) — how Claude Code implements skills as markdown files with YAML frontmatter. The format is exactly what this describes.
[^2]: [YAML — Wikipedia](https://en.wikipedia.org/wiki/YAML) — the frontmatter format. The `|` block scalar (literal, preserves newlines) is what you want when your skill body contains code examples or multi-line instructions.
[^3]: [Anthropic system prompts documentation](https://docs.anthropic.com/en/docs/build-with-claude/system-prompts) — skills work by injecting into the system prompt. Understanding how the system prompt interacts with the conversation explains why skill ordering and composition behave as they do. See also the [prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) for writing effective skill bodies.
