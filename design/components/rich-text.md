# Komponente: `rich-text`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-rich-text`                                   |
| CSS-Datei       | `assets/component-rich-text.css`                  |
| Custom Element  | kein JS                                           |
| Liquid          | kein Snippet; Wrapper-Klasse um fremdes HTML      |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Typografie für HTML, das nicht aus Komponenten stammt: Produktbeschreibung,
Kollektionsbeschreibung, Rich-Text-Metafelder (`metafield_tag`), Section-Richtext,
Drop-Story, Size-Guide-Tabelle. Styling über Element-Selektoren **innerhalb** des
Blocks, weil das HTML keine Klassen hat.

## 2. Anatomie (BEM)

```
.ut-rich-text
├── p, h2–h4, ul, ol, li, a, strong, em, blockquote, hr, img, table, th, td  (Elemente)
└── Modifier: --narrow (max-inline-size container-narrow) | --center | --sm (kleinere Schrift)
```

`h1` wird wie `h2` gesetzt, weil die Seite ihr `h1` selbst vergibt. Alle Rich-Text-Überschriften sind Archivo (`font.family.heading`), nie Display: sie liegen unter `font.display.min-size`.

## 3. Datenvertrag

| Feld   | Typ  | Pflicht | Quelle                                                     |
|--------|------|---------|------------------------------------------------------------|
| HTML   | HTML | ja      | `product.description`, `metafield_tag`, Section `richtext` |

## 4. Einstellungen

n/a (Sections bieten ggf. `width`: narrow/wide)

## 5. Zustände

n/a

## 6. Verwendete Tokens

- `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-text-link`, `--ut-color-border-default`, `--ut-color-bg-subtle`
- `--ut-font-size-sm`, `-md`, `-lg`, `-xl`, `--ut-font-line-height-normal`, `-snug`, `--ut-font-weight-semibold`, `-bold`
- `--ut-space-2`, `-3`, `-4`, `-6`, `-8`, `--ut-layout-container-narrow`, `--ut-border-width-hairline`, `--ut-border-width-thick`

## 7. Verhalten und JS

Kein JS. Breite Tabellen scrollen horizontal im Block (`display: block; overflow-x: auto` auf `table`).

## 8. Accessibility

- Links unterstrichen (Farbe allein reicht nicht).
- Tabellen behalten `th`; Size-Guide-Pflege im Admin mit Kopfzeile (Hinweis in `metafields.md` bei `size_guide`).

## 9. Texte

Keine.

## 10. Port-Hinweise

- Shopify-Rich-Text-JSON (Metafelder) braucht einen Renderer zu HTML (Risiko R7 in `migration.md`). Das CSS bleibt.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Im Browser mit echter Produktbeschreibung geprüft
- [x] Metafelder: keine eigenen
