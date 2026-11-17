# ADR 0002: Reines CSS mit BEM (Präfix `ut-`) und Cascade Layers

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Kein Sass, kein PostCSS, kein Tailwind. BEM-Klassen mit Präfix `ut-`
(`.ut-product-card__price--sale`). Eine CSS-Datei pro Komponente, geladen von der
Section, die sie braucht. Cascade Layers in fester Reihenfolge:
`reset, base, components, utilities`.

## Begründung

- Ohne Preprocessor gibt es keinen Build-Schritt, den Shopify nicht kennt und den
  Next.js anders machen würde. Die CSS-Dateien sind das Endprodukt und wandern 1:1.
- Der Präfix `ut-` schützt vor Kollisionen mit CSS, das Shopify-Apps injizieren
  (`.button`, `.price`, `.badge` sind dort häufig), und ist der gleiche Namensraum wie
  die Custom Elements (`<ut-…>`) und Tokens (`--ut-…`).
- Cascade Layers machen Spezifität planbar: Komponenten schlagen Reset und Base
  ohne `!important`, Utilities schlagen Komponenten. App-CSS ohne Layer liegt
  automatisch über allem, was bewusst in Kauf genommen wird.
- Eine Datei pro Komponente: Shopify lädt nur, was die Seite braucht; im Port
  entspricht das einem Import pro Komponente.

## Konsequenzen

- Nesting nur natives CSS-Nesting, sparsam, nie für BEM-Elemente (Lesbarkeit, grep).
- Logische Properties (`inline-size`, `margin-block`) statt physischer, für RTL und
  Konsistenz.
- Utilities (`.ut-visually-hidden`, `.ut-skip-link`) leben in `base.css`, Layer `base`.
