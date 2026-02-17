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

    /** Full expanded name if the title is an acronym (e.g., "Model Context Protocol") */
    aka: z.string().optional(),

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
  }),
});

export const collections = { terms };
