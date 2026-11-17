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
- Kein Dark Mode vorgesehen. Falls nötig: eigene Semantik-Ebene unter `[data-theme]`.
