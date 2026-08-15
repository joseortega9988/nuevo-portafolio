#!/usr/bin/env node
/**
 * ESLint cannot see inside .css files, so it cannot enforce §C there. This
 * script closes that gap: it fails the lint run if a hex colour appears in any
 * stylesheet other than the one file allowed to hold them.
 *
 * Run automatically as part of `npm run lint`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['app', 'src'];
const ALLOWED = join('src', 'styles', 'tokens.css');
const HEX = /#(?:[0-9a-fA-F]{3,4}){1,2}(?![0-9a-fA-F])/g;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  let out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const offences = [];

for (const dir of SEARCH_DIRS) {
  const abs = join(ROOT, dir);
  try {
    statSync(abs);
  } catch {
    continue;
  }
  for (const file of walk(abs)) {
    const rel = relative(ROOT, file);
    if (rel === ALLOWED || rel === ALLOWED.split(sep).join('/')) continue;

    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        // Ignore comment lines — tokens are often named in prose.
        if (line.trimStart().startsWith('*') || line.trimStart().startsWith('/*')) return;
        const found = line.match(HEX);
        if (found) offences.push(`${rel}:${i + 1}  ${found.join(', ')}  →  ${line.trim()}`);
      });
  }
}

if (offences.length > 0) {
  console.error('\n✖ Hex colour outside src/styles/tokens.css:\n');
  for (const o of offences) console.error(`  ${o}`);
  console.error(
    `\n${offences.length} violation(s). Colour has exactly one home — use var(--c-*).\n`,
  );
  process.exit(1);
}

console.log('✔ colour tokens: no hex outside src/styles/tokens.css');
