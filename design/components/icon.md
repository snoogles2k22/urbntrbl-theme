# Komponente: `icon`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-icon`                                        |
| CSS-Datei       | `assets/component-icon.css`                       |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/icon.liquid`                            |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Inline-SVG-Icons im 24er-Raster, Strich-Stil, Farbe über `currentColor`. Eigene
Zeichnungen (keine Icon-Bibliothek, keine Dependency). Kein Sprite, weil Shopify
keine Build-Pipeline hat und Inline-SVG im Port 1:1 zu React-Komponenten wird.

## 2. Anatomie (BEM)

```
svg.ut-icon
└── Modifier: --sm | --md (Default) | --lg | --xl
```

## 3. Datenvertrag

| Feld    | Typ    | Pflicht | Beschreibung                                                      |
|---------|--------|---------|-------------------------------------------------------------------|
| `name`  | enum   | ja      | siehe Liste                                                       |
| `size`  | enum   | nein    | `sm`, `md`, `lg`, `xl`                                            |
| `label` | string | nein    | gesetzt → `role="img"` + `aria-label`; sonst `aria-hidden="true"` |
| `class` | string | nein    | zusätzliche Klasse für den Aufrufer (z. B. `ut-button__icon`)     |

Icon-Set v1 (abgeleitet aus den Blueprints): `menu`, `close`, `search`, `account`,
`cart`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right`, `arrow-right`,
`plus`, `minus`, `check`, `alert`. Unbekannter Name rendert nichts.

## 4. Einstellungen

n/a

## 5. Zustände

n/a (erbt Farbe vom Elternelement)

## 6. Verwendete Tokens

- `--ut-size-icon-sm`, `-md`, `-lg`, `-xl`, `--ut-size-icon-stroke`

## 7. Verhalten und JS

Kein JS.

## 8. Accessibility

- Standard dekorativ. Ein Icon, das allein eine Aktion trägt, braucht `label`.
- `focusable="false"` gegen alte Fokus-Bugs in SVG.

## 9. Texte

Keine eigenen. `label` kommt übersetzt vom Aufrufer.

## 10. Port-Hinweise

- Ein Komponenten-Objekt `icons = { menu: <path…/>, … }`, Pfade 1:1 kopieren.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Im Browser in beiden Tones geprüft
- [x] Metafelder: keine
