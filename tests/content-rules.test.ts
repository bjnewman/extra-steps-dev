/**
 * Unit tests for prose-level content rules.
 *
 * These mirror scripts/validate-content.ts as testable functions.
 * The script gives better CI UX (named step, prescriptive stderr).
 * These tests give granular per-rule red dots in the test matrix.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const TERMS_DIR = join(import.meta.dirname, '../src/content/terms');

const REQUIRED_H2 = [
  '## What they say',
  '## What it actually is',
  `## The "extra steps"`,
  '## What you already know',
];

async function termFiles(): Promise<{ file: string; content: string }[]> {
  const names = (await readdir(TERMS_DIR)).filter((f) => f.endsWith('.md'));
  return Promise.all(
    names.map(async (file) => ({
      file,
      content: await readFile(join(TERMS_DIR, file), 'utf-8'),
    })),
  );
}

describe('required sections', () => {
  for (const heading of REQUIRED_H2) {
    it(`all terms contain "${heading}"`, async () => {
      const terms = await termFiles();
      for (const { file, content } of terms) {
        expect(content, `${file} is missing "${heading}"`).toContain(heading);
      }
    });
  }
});

describe('citations', () => {
  it('all terms have at least one footnote citation', async () => {
    const terms = await termFiles();
    for (const { file, content } of terms) {
      expect(content, `${file} has no footnote citations`).toMatch(/\[\^\d+\]/);
    }
  });
});

describe('tagline format', () => {
  it('all taglines contain "with extra steps"', async () => {
    const terms = await termFiles();
    for (const { file, content } of terms) {
      const match = content.match(/^tagline:\s*"?(.+?)"?\s*$/m);
      if (match) {
        expect(
          match[1].toLowerCase(),
          `${file}: tagline must contain "with extra steps"`,
        ).toContain('with extra steps');
      }
    }
  });
});

describe('snippet language', () => {
  it('no term uses "plaintext" as snippet language', async () => {
    const terms = await termFiles();
    for (const { file, content } of terms) {
      const match = content.match(/^\s+lang:\s*"?(\S+?)"?\s*$/m);
      if (match) {
        expect(match[1], `${file}: snippet.lang should not be "plaintext"`).not.toBe(
          'plaintext',
        );
      }
    }
  });
});
