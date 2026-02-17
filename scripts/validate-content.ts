/**
 * Content validation script — enforces prose rules that Zod cannot.
 * Run after `bun run build` in CI (build validates schema; this validates prose).
 *
 * Usage: bun run scripts/validate-content.ts
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TERMS_DIR = join(import.meta.dirname, '../src/content/terms');

const REQUIRED_H2 = [
  '## What they say',
  '## What it actually is',
  `## The "extra steps"`,
  '## What you already know',
];

const MIN_BODY_WORDS = 80;
const FOOTNOTE_RE = /\[\^\d+\]/;

const errors: string[] = [];

const files = (await readdir(TERMS_DIR)).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const content = await readFile(join(TERMS_DIR, file), 'utf-8');
  const slug = file.replace('.md', '');

  // 1. All four required H2 sections
  for (const heading of REQUIRED_H2) {
    if (!content.includes(heading)) {
      errors.push(`${slug}: missing required section "${heading}"`);
    }
  }

  // 2. At least one footnote citation
  if (!FOOTNOTE_RE.test(content)) {
    errors.push(`${slug}: no citations found — add at least one [^1] footnote`);
  }

  // 3. Tagline must follow the "with extra steps" format
  const taglineMatch = content.match(/^tagline:\s*"?(.+?)"?\s*$/m);
  if (taglineMatch && !taglineMatch[1].toLowerCase().includes('with extra steps')) {
    errors.push(
      `${slug}: tagline must follow "X is just Y with extra steps" — got: ${taglineMatch[1].trim()}`,
    );
  }

  // 4. "What it actually is" body must have enough prose
  // Stop at the next ## heading or end of string — not at inline [^ footnote refs
  const sectionMatch = content.match(
    /## What it actually is\n([\s\S]*?)(?=\n## |\s*$)/,
  );
  if (sectionMatch) {
    const wordCount = sectionMatch[1].trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_BODY_WORDS) {
      errors.push(
        `${slug}: "What it actually is" has ${wordCount} words (minimum ${MIN_BODY_WORDS})`,
      );
    }
  }

  // 5. snippet.lang should not be "plaintext"
  const langMatch = content.match(/^\s+lang:\s*"?(\S+?)"?\s*$/m);
  if (langMatch && langMatch[1] === 'plaintext') {
    errors.push(`${slug}: snippet.lang is "plaintext" — set a real language identifier`);
  }
}

if (errors.length > 0) {
  console.error('\nContent validation failed:\n');
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ Content validation passed (${files.length} term${files.length === 1 ? '' : 's'} checked)`);
