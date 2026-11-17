# ADR 0005: Spec-first und Metafeld-Registry

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Jede Komponente bekommt vor dem ersten Code eine Spec in `design/components/<name>.md`
nach `_TEMPLATE.md`. Jedes Metafeld steht vor der ersten Verwendung in
`docs/metafields.md` mit Typ, Verwendungsort und Medusa-Mapping. Metafelder werden im
Theme nur über Snippets gelesen, nie direkt in Sections.

## Begründung

- Die Spec ist der plattformneutrale Vertrag. Wer den Port macht, liest Spec und CSS,
  nicht Liquid.
- Metafelder sind der Teil des Datenmodells, den Shopify nicht vorgibt. Ohne Registry
  entstehen sie ad hoc im Admin und sind beim Port unsichtbar.
- Ein Snippet pro Metafeld heißt: eine Stelle, die beim Port ersetzt wird.

## Konsequenzen

- Mehr Schreibarbeit vor dem Code. Dafür keine Komponente, deren Verhalten nur im
  Liquid steckt.
- Specs sind lebende Dokumente: Status-Feld pflegen, Abnahme-Checkliste abhaken.
