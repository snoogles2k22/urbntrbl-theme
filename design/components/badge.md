# Komponente: `badge`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-badge`                                       |
| CSS-Datei       | `assets/component-badge.css`                      |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/badge.liquid`                           |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Kurzes Label für Produktzustände (Sale, Ausverkauft, Neu, Limitiert) und Drop-Status
(Live, Demnächst, Beendet). Die Badge selbst entscheidet nichts. Welche Badge ein
Produkt bekommt, leitet `snippets/product-badge.liquid` ab (Phase C, liest das
Metafeld `badge`; Reihenfolge sold_out > sale > badge > new laut `docs/metafields.md`).

## 2. Anatomie (BEM)

```
.ut-badge
└── Modifier (Tone): --neutral (Default) | --accent | --muted | --outline | --live
    └── --live::before                   Statuspunkt (dekorativ, rein CSS)
```

| Verwendung        | Tone      |
|-------------------|-----------|
| Sale              | accent    |
| Ausverkauft       | muted     |
| Neu, Limitiert, Collab, Restock | neutral |
| Drop live         | live (Neutral-Fläche + roter Punkt) |
| Drop demnächst    | outline   |
| Drop beendet      | muted     |

## 3. Datenvertrag

| Feld    | Typ    | Pflicht | Beschreibung   |
|---------|--------|---------|----------------|
| `label` | string | ja      | übersetzt      |
| `tone`  | enum   | nein    | siehe oben     |

## 4. Einstellungen

n/a

## 5. Zustände

n/a

## 6. Verwendete Tokens

- `--ut-color-bg-inverse`, `--ut-color-text-inverse` (neutral)
- `--ut-color-bg-accent`, `--ut-color-text-on-accent` (accent)
- `--ut-color-bg-muted`, `--ut-color-text-muted` (muted)
- `--ut-color-border-strong`, `--ut-color-text-default` (outline)
- `--ut-color-indicator-live`, `--ut-radius-full` (live; Fläche wie neutral)
- `--ut-space-1`, `--ut-space-2`, `--ut-font-family-heading`, `--ut-font-size-xs`, `--ut-font-weight-bold`, `--ut-font-width-condensed`, `--ut-font-letter-spacing-caps`, `--ut-font-line-height-tight`, `--ut-radius-badge`, `--ut-border-width-hairline`

## 7. Verhalten und JS

Kein JS.

## 8. Accessibility

- Text, nicht nur Farbe. Großschreibung per CSS, der DOM-Text bleibt normal geschrieben (Screenreader buchstabieren sonst).
- Kontraste: alle Tones ≥ 4.5:1 (on-accent 4.90 offwhite auf red, muted 4.75 gegen bg.muted, neutral/live 17.17; Stand 2026-11-18). Live-Punkt: red-bright auf black 4.65, im inverse-Ton red auf offwhite 4.90 (≥ 3:1 für Grafik). Kein roter Text auf bg.muted (Graustufe). Kein Grün: `text.success` ist gedecktes Rot (`brand.red-muted`).

## 9. Texte

Labels kommen vom Aufrufer, Keys entstehen mit `product-badge.liquid` (`products.badge.*`) und Drop-Sections (`drops.status.*`, siehe `logic/drop.md`).

## 10. Port-Hinweise

- `<Badge tone>`; Ableitung als Funktion `productBadge(product)`.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Im Browser in beiden Tones geprüft
- [x] Metafelder: keine (Ableitung liest `badge` erst in Phase C)
