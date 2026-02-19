import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schema for "term" entries — the core content type.
 *
 * Each term maps an AI marketing buzzword to its CS primitive(s).
 * The `primitives` array is the heart of the site: it's the "...with extra steps" punchline.
 */
const terms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/terms' }),
  schema: z.object({
    /** The marketing term as commonly used (e.g., "MCP") */
    title: z.string(),

    /**
     * Other names for this concept across vendors/products.
     * e.g., Skills are also called Gems (Google), GPTs (OpenAI), Custom Instructions (OpenAI)
     */
    aka: z.union([z.string(), z.array(z.string())]).optional(),

    /**
     * Where this term originated:
     * - vendor: coined or branded by a specific company (Anthropic, OpenAI, Google, etc.)
     * - research: came from an academic paper or research lab
     * - industry: emerged from collective industry usage, no single owner
     */
    origin: z.enum(['vendor', 'research', 'industry']).optional(),

    /** One-line tagline in the format "X is just Y with extra steps" */
    tagline: z.string(),

    /** The CS primitives this term maps to */
    primitives: z.array(z.string()).min(1),

    /** Categorization for filtering/grouping */
    category: z.enum([
      'protocols',
      'patterns',
      'architecture',
      'data',
      'historical',
    ]),

    /** Who uses this term (for audience filtering) */
    audience: z.enum([
      'app-dev',
      'infra',
      'ml-eng',
    ]).default('app-dev'),

    /** Date first published */
    publishedAt: z.coerce.date(),

    /** Whether this entry is ready for public consumption */
    draft: z.boolean().default(false),

    /**
     * Short inline preview for the accordion on the index page.
     * One paragraph + one code block (fenced, with language tag).
     * Shown when a row is expanded before the user navigates to the full page.
     */
    snippet: z.object({
      prose: z.string(),
      code: z.string(),
      lang: z.string().default('plaintext'),
    }).optional(),
  }),
});

export const collections = { terms };
