# extra-steps.dev

Community site mapping AI marketing hype to CS primitives.

## Boundaries

### ALWAYS
- G(pkg_cmd → uses_bun)
- G(edit(f) → f ∈ files_read)
- G(content_entry → validates_schema) — all terms must pass Zod validation
- G(build → succeeds) — `bun run build` must pass before committing
- G(new_term → has_all_sections) — "What they say", "What it actually is", "The extra steps", "What you already know"

### NEVER
- Add React or client-side JavaScript (static site only)
- Use npm, yarn, or pnpm
- Modify unrelated files

## Content Schema

Terms live in `src/content/terms/*.md` with this frontmatter:

```yaml
title: string                    # Marketing term (required)
aka: string | string[]           # Other names / expanded acronym (optional)
origin: enum                     # vendor | research | industry (optional)
tagline: string                  # "X is just Y with extra steps" (required)
primitives: string[]             # CS primitives this maps to (min 1)
category: enum                   # protocols | patterns | architecture | data | historical
audience: enum                   # app-dev | infra | ml-eng (default: app-dev)
publishedAt: date                # ISO date (required)
draft: boolean                   # default false
snippet:                         # optional inline preview for index accordion
  prose: string
  code: string
  lang: string                   # default: plaintext
```

## Action Contracts

```
{new_term_requested} add_term {
  frontmatter_valid ∧ all_sections_present ∧ build_passes
}

{term_edit_requested} edit_term {
  schema_still_valid ∧ build_passes
}
```

## Commands

```bash
bun run dev      # dev server
bun run build    # production build
bun run lint     # oxlint
bun run clean    # remove dist/ .astro/
```

## File Structure

```
src/
  content/terms/   # markdown term entries
  content.config.ts  # Zod schema for collections
  components/      # Astro components
  layouts/         # page layouts
  pages/           # file-based routing
  styles/          # CSS (tokens + global)
```
