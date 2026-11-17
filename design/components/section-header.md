# Komponente: `section-header`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-section-header`                              |
| CSS-Datei       | `assets/component-section-header.css`             |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/section-header.liquid`                  |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Kopf einer Section: Eyebrow, Überschrift, Kurztext, optional Link „Alle ansehen“.
Genutzt von Featured Collection, Related Products, Drop Story, Drops-Index, Cart
Recommendations.

## 2. Anatomie (BEM)

```
.ut-section-header
├── .ut-section-header__content
│   ├── .ut-section-header__eyebrow
│   ├── .ut-section-header__heading   (h2 Default, h1 möglich)
│   └── .ut-section-header__text
├── .ut-section-header__link          .ut-button--text mit Icon arrow-right
└── Modifier: --center
```

## 3. Datenvertrag

| Feld         | Typ    | Pflicht | Beschreibung              |
|--------------|--------|---------|---------------------------|
| `heading`    | string | ja      |                           |
| `eyebrow`    | string | nein    |                           |
| `text`       | string | nein    | Plaintext oder einfaches HTML |
| `link_label` | string | nein    | Default `general.view_all` |
| `link_url`   | string | nein    | gesetzt → Link sichtbar   |
| `level`      | enum   | nein    | `h1`, `h2` (Default), `h3` |
| `align`      | enum   | nein    | `start` (Default), `center` |

## 4. Einstellungen

n/a (Sections liefern die Werte)

## 5. Zustände

n/a

## 6. Verwendete Tokens

- `--ut-color-text-default`, `--ut-color-text-muted`
- `--ut-font-size-xs`, `-md`, `-2xl`, `--ut-font-weight-semibold`, `-bold`, `--ut-font-letter-spacing-caps`, `--ut-font-line-height-tight`
- `--ut-space-2`, `-4`, `-8`, `--ut-layout-container-narrow`

## 7. Verhalten und JS

Kein JS.

## 8. Accessibility

- Ein `h1` pro Seite; Sections nutzen `h2`.
- Eyebrow steht im DOM vor der Überschrift, ist aber kein Heading.
- Link-Text eindeutig: „Alle ansehen“ wird um den Heading-Text als visuell versteckten Zusatz ergänzt („Alle ansehen: Neu im Shop“).

## 9. Texte

| Key                | DE            | EN       |
|--------------------|---------------|----------|
| `general.view_all` | Alle ansehen  | View all |

## 10. Port-Hinweise

- `<SectionHeader>`; `level` als Prop.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Screenreader: Link-Name geprüft
- [x] Metafelder: keine
