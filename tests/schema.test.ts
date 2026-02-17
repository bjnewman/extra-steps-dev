/**
 * Unit tests for the term schema and all existing term files.
 *
 * These tests are intentionally redundant with Astro's build-time Zod
 * validation — Zod gives a stack trace in build logs; these give a
 * named red dot per file in the test matrix.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Mirror src/content.config.ts — if the schema changes, update both.
const termSchema = z.object({
  title: z.string(),
  aka: z.string().optional(),
  tagline: z.string(),
  primitives: z.array(z.string()).min(1),
  category: z.enum(['protocols', 'patterns', 'architecture', 'data']),
  audience: z.enum(['app-dev', 'infra', 'ml-eng']).default('app-dev'),
  publishedAt: z.coerce.date(),
  draft: z.boolean().default(false),
  snippet: z
    .object({
      prose: z.string(),
      code: z.string(),
      lang: z.string().default('plaintext'),
    })
    .optional(),
});

const TERMS_DIR = join(import.meta.dirname, '../src/content/terms');

describe('term schema', () => {
  it('rejects empty primitives array', () => {
    const result = termSchema.safeParse({
      title: 'Test',
      tagline: 'test is just a test with extra steps',
      primitives: [],
      category: 'patterns',
      publishedAt: '2026-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = termSchema.safeParse({
      title: 'Test',
      tagline: 'test is just a test with extra steps',
      primitives: ['something'],
      category: 'vibes',
      publishedAt: '2026-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid audience', () => {
    const result = termSchema.safeParse({
      title: 'Test',
      tagline: 'test is just a test with extra steps',
      primitives: ['something'],
      category: 'patterns',
      audience: 'marketing',
      publishedAt: '2026-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid minimal term', () => {
    const result = termSchema.safeParse({
      title: 'Test',
      tagline: 'test is just a test with extra steps',
      primitives: ['while loop'],
      category: 'patterns',
      publishedAt: '2026-01-01',
    });
    expect(result.success).toBe(true);
  });
});

describe('existing term files', () => {
  let files: string[] = [];

  it('can read the terms directory', async () => {
    files = (await readdir(TERMS_DIR)).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
  });

  it('all term files pass schema validation', async () => {
    const termFiles = (await readdir(TERMS_DIR)).filter((f) => f.endsWith('.md'));
    for (const file of termFiles) {
      const raw = await readFile(join(TERMS_DIR, file), 'utf-8');
      const { data } = matter(raw);
      const result = termSchema.safeParse(data);
      expect(
        result.success,
        `${file} failed schema validation: ${JSON.stringify(result.error?.issues ?? [])}`,
      ).toBe(true);
    }
  });
});
