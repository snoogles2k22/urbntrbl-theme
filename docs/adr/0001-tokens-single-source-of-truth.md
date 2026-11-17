# ADR 0001: tokens.json als Single Source of Truth

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Alle Design-Werte liegen in `design/tokens/tokens.json` (DTCG-nahes Format, CSS-fertige
Strings). `assets/tokens.css` wird daraus mit `scripts/build-tokens.mjs` generiert und
committed. Komponenten-CSS verwendet ausschließlich `var(--ut-…)`.

Drei Stufen: Primitive (`color.neutral.*`, `color.brand.*`), Semantik (`color.text.*`,
`color.bg.*`, `color.action.*`) und Komponenten-Scope (lokale Custom Properties in der
Komponenten-Datei, die auf Semantik zeigen). Komponenten greifen nie auf Primitive zu.

## Begründung

- Beim Port nach Next.js reist die JSON-Datei mit, der Generator auch. Das Design ist
  damit plattformunabhängig definiert.
- Aliase werden als `var()`-Kette ausgegeben, nicht aufgelöst. So bleibt im Devtools
  sichtbar, warum ein Wert ist, wie er ist, und Scopes (z. B. invertierte Sections)
  können die Semantik-Ebene überschreiben, ohne Komponenten anzufassen.
- Composite-Werte (DTCG-Objektform) werden abgelehnt, damit der Generator ohne
  Dependencies klein bleibt und die Werte in jedem Tool lesbar sind.
- Die generierte Datei wird committed, weil Shopify keinen Build-Schritt hat.
  `tokens:check` schützt vor veraltetem Generat.

## Konsequenzen

- Brand-Werte sind noch Platzhalter (`$description: "PLATZHALTER"`). Änderung = ein
  Commit in einer Datei.
- Breakpoints stehen in der JSON, werden aber in CSS als Literale geschrieben, weil
  Custom Properties in `@media` nicht funktionieren.
- Scopes (z. B. `tone: inverse`) stehen ebenfalls in `tokens.json` unter `$scopes`
  mit `$selector`. Der Generator gibt sie als eigenen Regelblock aus und deklariert
  abhängige Tokens im Scope neu, weil `var()` dort aufgelöst wird, wo die Custom
  Property deklariert ist. Scopes überschreiben nur Semantik, nie Primitive.
  Kein Handmapping in `base.css` (Entscheidung 2026-11-17, Review O1).
- Kein Dark Mode vorgesehen. Falls nötig: weiterer Scope, z. B. `[data-theme="dark"]`.
