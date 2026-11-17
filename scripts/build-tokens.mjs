#!/usr/bin/env node
/**
 * build-tokens.mjs
 *
 * Generates assets/tokens.css from design/tokens/tokens.json.
 * Zero dependencies, Node >= 20.
 *
 * Usage:
 *   node scripts/build-tokens.mjs            # write assets/tokens.css
 *   node scripts/build-tokens.mjs --check    # exit 1 if tokens.css is stale
 *   node scripts/build-tokens.mjs --out path/to/file.css --prefix ut
 *
 * Rules:
 *   - Every object with a `$value` key is a token. Its CSS name is the path
 *     joined with "-" and prefixed: `--ut-color-text-default`.
 *   - Alias values `{a.b.c}` become `var(--ut-a-b-c)` so the semantic chain
 *     stays visible in the browser devtools and can be re-themed per scope.
 *   - Alias chains are validated: a missing target or a cycle fails the build.
 *   - Arrays (fontFamily) are joined with ", " and quoted where needed.
 *   - Numbers are emitted as-is.
 *   - Composite values (DTCG object form for shadow, typography, border …)
 *     are rejected on purpose. Write them as one CSS-ready string instead,
 *     so the JSON stays trivially portable and this script stays small.
 *   - Keys beginning with "$" are metadata and never become tokens.
 *   - The `breakpoint` group is emitted as a comment only: custom properties
 *     cannot be used inside @media queries.
 *
 * The same script will later feed the Next.js port (same JSON, same CSS).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const CHECK = args.includes('--check');
const PREFIX = flag('--prefix', 'ut');
const IN = resolve(ROOT, flag('--in', 'design/tokens/tokens.json'));
const OUT = resolve(ROOT, flag('--out', 'assets/tokens.css'));
const COMMENT_ONLY_GROUPS = new Set(['breakpoint']);

const tokens = JSON.parse(readFileSync(IN, 'utf8'));

/** Flatten into [{ path: ['color','text','default'], value, type, description }] */
function collect(node, path = [], inheritedType = null, out = []) {
  const type = node.$type ?? inheritedType;
  if (Object.hasOwn(node, '$value')) {
    out.push({ path, value: node.$value, type, description: node.$description });
    return out;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (child && typeof child === 'object') collect(child, [...path, key], type, out);
  }
  return out;
}

const all = collect(tokens);
const byPath = new Map(all.map((t) => [t.path.join('.'), t]));
const cssName = (path) => `--${PREFIX}-${path.join('-')}`;

const ALIAS = /^\{([^}]+)\}$/;
const aliasTarget = (value) =>
  typeof value === 'string' ? value.match(ALIAS)?.[1] ?? null : null;

/**
 * Validate every alias chain once: target must exist and the chain must
 * terminate. We emit var() references (not resolved values), so without this
 * check a cycle would silently produce CSS the browser discards.
 */
function validateAliases() {
  for (const token of all) {
    const chain = [token.path.join('.')];
    let target = aliasTarget(token.value);
    while (target) {
      if (!byPath.has(target)) {
        throw new Error(`Unresolved alias {${target}} in ${chain.at(-1)}`);
      }
      if (chain.includes(target)) {
        throw new Error(`Circular alias: ${[...chain, target].join(' -> ')}`);
      }
      chain.push(target);
      target = aliasTarget(byPath.get(target).value);
    }
  }
}

function toCss(token) {
  const { value, type } = token;
  const target = aliasTarget(value);
  if (target) return `var(${cssName(target.split('.'))})`;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value) && type === 'fontFamily') {
    return value.map((f) => (/[\s"']/.test(f) ? `"${f}"` : f)).join(', ');
  }
  if (value && typeof value === 'object') {
    throw new Error(
      `Composite $value in ${token.path.join('.')} is not supported. ` +
        `Write it as a single CSS string (e.g. "0 4px 12px rgb(0 0 0 / 0.08)").`
    );
  }
  throw new Error(`Unsupported value for ${token.path.join('.')}: ${JSON.stringify(value)}`);
}

validateAliases();

/** Group tokens by top-level key for readable output */
const groups = new Map();
for (const t of all) {
  const g = t.path[0];
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(t);
}

let css = `/* GENERATED FILE. DO NOT EDIT.
 * Source: design/tokens/tokens.json
 * Build:  npm run tokens:build
 * Check:  npm run tokens:check
 */
:root {
`;

for (const [group, list] of groups) {
  if (COMMENT_ONLY_GROUPS.has(group)) {
    css += `\n  /* ${group} (reference only, use literal values in @media) */\n`;
    for (const t of list) css += `  /* ${t.path.slice(1).join('-')}: ${t.value} */\n`;
    continue;
  }
  css += `\n  /* ${group} */\n`;
  for (const t of list) css += `  ${cssName(t.path)}: ${toCss(t)};\n`;
}
css += '}\n';

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== css) {
    console.error(`✗ ${OUT.replace(ROOT + '/', '')} is stale. Run: npm run tokens:build`);
    process.exit(1);
  }
  console.log(`✓ tokens.css is up to date (${all.length} tokens)`);
} else {
  writeFileSync(OUT, css);
  console.log(`✓ wrote ${OUT.replace(ROOT + '/', '')} (${all.length} tokens)`);
}
