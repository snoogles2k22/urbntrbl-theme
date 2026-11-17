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
 *   node scripts/build-tokens.mjs --in a.json --out b.css --prefix ut
 *
 * Rules:
 *   - Every object with a `$value` key is a token. Its CSS name is the path
 *     joined with "-" and prefixed: `--ut-color-text-default`.
 *   - Alias values `{a.b.c}` become `var(--ut-a-b-c)` so the semantic chain
 *     stays visible in the browser devtools.
 *   - Alias chains are validated: a missing target or a cycle fails the build.
 *   - Arrays (fontFamily) are joined with ", " and quoted where needed.
 *   - Numbers are emitted as-is.
 *   - Composite values (DTCG object form for shadow, typography, border …)
 *     are rejected on purpose. Write them as one CSS-ready string instead.
 *   - Keys beginning with "$" are metadata and never become tokens.
 *   - The `breakpoint` group is emitted as a comment only: custom properties
 *     cannot be used inside @media queries.
 *
 * Scopes (`$scopes` at the top level):
 *   "$scopes": {
 *     "inverse": {
 *       "$selector": "[data-tone=\"inverse\"]",
 *       "color": { "bg": { "default": { "$value": "{color.neutral.900}" } } }
 *     }
 *   }
 *   - A scope may only override tokens that exist at the root, and never the
 *     comment-only groups. Aliases resolve against root tokens.
 *   - Cycles are checked on the effective token set of each scope.
 *   - Dependents are re-declared automatically: a custom property containing
 *     var() is resolved on the element where it is declared and inherited as
 *     a finished value. If a scope overrides `color.text.default`, every token
 *     whose alias chain passes through it (e.g. `color.text.link`) must be
 *     declared again inside the scope, or it keeps the root value.
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

const source = JSON.parse(readFileSync(IN, 'utf8'));

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

const key = (t) => t.path.join('.');
const cssName = (path) => `--${PREFIX}-${path.join('-')}`;

const ALIAS = /^\{([^}]+)\}$/;
const aliasTarget = (value) =>
  typeof value === 'string' ? value.match(ALIAS)?.[1] ?? null : null;

// ---------------------------------------------------------------- root tokens

const all = collect(source);
const byPath = new Map(all.map((t) => [key(t), t]));

/**
 * Walk the alias chain of `start` using `lookup` (path -> token).
 * Returns the list of visited paths. Throws on missing target or cycle.
 * We emit var() references, not resolved values, so without this check a
 * cycle would silently produce CSS the browser discards.
 */
function walkChain(start, lookup, label = '') {
  const chain = [start];
  let target = aliasTarget(lookup.get(start).value);
  while (target) {
    if (!lookup.has(target)) {
      throw new Error(`${label}Unresolved alias {${target}} in ${chain.at(-1)}`);
    }
    if (chain.includes(target)) {
      throw new Error(`${label}Circular alias: ${[...chain, target].join(' -> ')}`);
    }
    chain.push(target);
    target = aliasTarget(lookup.get(target).value);
  }
  return chain;
}

function toCss(token, label = '') {
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
      `${label}Composite $value in ${key(token)} is not supported. ` +
        `Write it as a single CSS string (e.g. "0 4px 12px rgb(0 0 0 / 0.08)").`
    );
  }
  throw new Error(`${label}Unsupported value for ${key(token)}: ${JSON.stringify(value)}`);
}

for (const t of all) walkChain(key(t), byPath);

// --------------------------------------------------------------------- scopes

const scopes = Object.entries(source.$scopes ?? {}).map(([name, node]) => {
  const label = `Scope "${name}": `;
  if (!node || typeof node !== 'object' || typeof node.$selector !== 'string' || !node.$selector.trim()) {
    throw new Error(`${label}missing "$selector"`);
  }

  const overrides = collect(node);
  if (overrides.length === 0) throw new Error(`${label}has no token overrides`);

  const overridden = new Set();
  for (const o of overrides) {
    const k = key(o);
    if (!byPath.has(k)) throw new Error(`${label}overrides unknown token ${k}`);
    if (COMMENT_ONLY_GROUPS.has(o.path[0])) {
      throw new Error(`${label}cannot override comment-only group "${o.path[0]}" (${k})`);
    }
    if (overridden.has(k)) throw new Error(`${label}overrides ${k} twice`);
    overridden.add(k);
    // Inherit $type from the root token so fontFamily arrays serialize correctly.
    o.type = o.type ?? byPath.get(k).type;
  }

  // Effective token set inside the scope: root tokens with overrides applied.
  const effective = new Map(byPath);
  for (const o of overrides) effective.set(key(o), o);

  // Re-validate every chain against the effective set (catches scope-only cycles)
  // and collect dependents: root tokens whose chain passes an overridden token.
  const dependents = [];
  for (const t of all) {
    const k = key(t);
    const chain = walkChain(k, effective, label);
    if (!overridden.has(k) && chain.slice(1).some((p) => overridden.has(p))) {
      dependents.push(effective.get(k));
    }
  }

  // Keep root order for stable, readable output.
  const order = new Map(all.map((t, i) => [key(t), i]));
  const byOrder = (a, b) => order.get(key(a)) - order.get(key(b));

  return {
    name,
    selector: node.$selector.trim(),
    description: node.$description,
    overrides: overrides.sort(byOrder),
    dependents: dependents.sort(byOrder),
    label,
  };
});

// --------------------------------------------------------------------- output

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

for (const s of scopes) {
  css += `\n/* scope: ${s.name}${s.description ? ` (${s.description})` : ''} */\n`;
  css += `${s.selector} {\n`;
  css += `  /* overrides */\n`;
  for (const t of s.overrides) css += `  ${cssName(t.path)}: ${toCss(t, s.label)};\n`;
  if (s.dependents.length) {
    css += `\n  /* re-declared dependents (var() resolves where declared) */\n`;
    for (const t of s.dependents) css += `  ${cssName(t.path)}: ${toCss(t, s.label)};\n`;
  }
  css += '}\n';
}

const summary = `${all.length} tokens, ${scopes.length} scope${scopes.length === 1 ? '' : 's'}`;

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== css) {
    console.error(`✗ ${OUT.replace(ROOT + '/', '')} is stale. Run: npm run tokens:build`);
    process.exit(1);
  }
  console.log(`✓ tokens.css is up to date (${summary})`);
} else {
  writeFileSync(OUT, css);
  console.log(`✓ wrote ${OUT.replace(ROOT + '/', '')} (${summary})`);
}
