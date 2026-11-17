# urbntrbl-theme

Eigenes Shopify-Theme für URBN TRBL. Tokens-first, reines CSS (BEM, Präfix `ut-`),
Web Components, keine Dependencies. Gebaut, um später ohne Redesign nach
Next.js + Medusa v2 portiert zu werden.

## Schnellstart

```bash
npm run tokens:build   # design/tokens/tokens.json → assets/tokens.css
npm run dev            # shopify theme dev gegen den Dev-Shop
npm run check          # shopify theme check
```

Voraussetzungen: Node ≥ 20, Shopify CLI ≥ 3 (keine npm-Installation nötig).

## Wo was liegt

- `design/tokens/tokens.json`: Single Source of Truth für alle Design-Werte
- `design/components/`: Spezifikation pro Komponente, Vorlage `_TEMPLATE.md`
- `docs/adr/`: Architekturentscheidungen
- `docs/metafields.md`: Metafeld-Registry
- `docs/portability.md`: Was beim Port nach Next.js/Medusa bleibt und was ersetzt wird
- `CLAUDE.md`: Arbeitsregeln (gilt für Menschen genauso)

Brand-Werte (Logo, Farben, Schrift) sind noch Platzhalter.
