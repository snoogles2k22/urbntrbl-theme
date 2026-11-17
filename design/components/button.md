# Komponente: `button`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-button`                                      |
| CSS-Datei       | `assets/component-button.css`                     |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/button.liquid`                          |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Einheitliche Aktion: Kauf-Button, CTAs, Formular-Submit, Links im Button-Look.
Rendert `<button>` oder `<a>`, je nachdem ob eine URL übergeben wird. Kein Icon-Only-
Button ohne Label (dafür später `--icon` mit Pflicht-`aria-label`, erst wenn ein
Blueprint es braucht).

## 2. Anatomie (BEM)

```
.ut-button
├── .ut-button__icon      optionales Icon (start oder end)
├── .ut-button__label     Text
├── .ut-button__spinner   Ladeindikator, nur sichtbar bei [aria-busy="true"]
└── Modifier
    ├── --primary (Default) | --secondary | --text
    ├── --sm | --lg
    ├── --full            volle Breite
    └── --icon-end        Icon hinter dem Label
```

Lokale Custom Properties (nur innerhalb der Komponente): `--_bg`, `--_bg-hover`,
`--_fg`, `--_fg-hover`, `--_border`. Varianten setzen nur diese.

## 3. Datenvertrag

| Feld         | Typ      | Pflicht | Beschreibung                                        |
|--------------|----------|---------|-----------------------------------------------------|
| `label`      | string   | ja      | sichtbarer Text                                     |
| `url`        | string   | nein    | gesetzt → `<a href>`, sonst `<button>`              |
| `type`       | string   | nein    | `button` (Default), `submit`                        |
| `variant`    | enum     | nein    | `primary`, `secondary`, `text`                      |
| `size`       | enum     | nein    | `sm`, `md` (Default), `lg`                          |
| `full`       | boolean  | nein    | volle Breite                                        |
| `icon`       | string   | nein    | Icon-Name aus `icon.md`                             |
| `icon_end`   | boolean  | nein    | Icon hinter dem Label                               |
| `disabled`   | boolean  | nein    | erzwingt `<button disabled>`, auch wenn `url` gesetzt |
| `busy`       | boolean  | nein    | initial `aria-busy="true"`                          |
| `attributes` | string   | nein    | zusätzliche Attribute (z. B. `name="add" form="x"`) |

## 4. Einstellungen

n/a. Die aufrufende Section liefert Label und URL aus ihren Settings.

## 5. Zustände

| Zustand   | Auslöser                         | Darstellung                                              |
|-----------|----------------------------------|----------------------------------------------------------|
| default   | –                                | Variante                                                 |
| hover     | `:hover`                         | `--_bg-hover`, `--_fg-hover`                             |
| focus     | `:focus-visible`                 | globaler Fokusring aus `base.css`                        |
| disabled  | `[disabled]`, `[aria-disabled]`  | `action.disabled-*`, `cursor: not-allowed`               |
| busy      | `[aria-busy="true"]`             | Label unsichtbar (Breite bleibt), Spinner zentriert       |

## 6. Verwendete Tokens

- `--ut-color-action-primary-bg`, `-primary-bg-hover`, `-primary-text`
- `--ut-color-action-secondary-bg`, `-secondary-border`, `-secondary-text`
- `--ut-color-action-disabled-bg`, `-disabled-text`
- `--ut-color-bg-default`, `--ut-color-text-link`
- `--ut-size-control-sm`, `-md`, `-lg`, `--ut-size-icon-sm`, `--ut-size-icon-md`
- `--ut-space-2`, `--ut-space-4`, `--ut-space-6`, `--ut-space-8`
- `--ut-font-family-body`, `--ut-font-size-xs`, `-sm`, `-md`, `--ut-font-weight-semibold`, `--ut-font-letter-spacing-wide`, `--ut-font-line-height-tight`
- `--ut-radius-control`, `--ut-radius-full`, `--ut-border-width-hairline`, `--ut-border-width-thick`
- `--ut-motion-duration-fast`, `--ut-motion-easing-standard`

## 7. Verhalten und JS

Kein JS. Elemente, die einen Button busy setzen (Product Form, Waitlist), setzen
`aria-busy` und `disabled` selbst.

## 8. Accessibility

- Mindesthöhe `size.control-md` (44px) in Standardgröße; `--sm` nur in dichten Listen.
- Link-Variante bleibt `<a>`, damit Ziel und Kontextmenü stimmen. Disabled ist nie ein Link.
- Busy: `aria-busy="true"` und `disabled`. Der Label-Text bleibt im DOM, Screenreader lesen ihn weiter.
- Icon ist dekorativ (`aria-hidden`), das Label trägt die Bedeutung.
- Kontrast: Primary 18.9:1, Secondary-Text 18.9:1; im Scope `inverse` invertiert.

## 9. Texte

| Key               | DE              | EN       |
|-------------------|-----------------|----------|
| `general.loading` | Wird geladen    | Loading  |

Der Spinner hat keinen eigenen Text; `aria-busy` reicht.

## 10. Port-Hinweise

- `<Button variant size full icon href disabled busy>`; `href` rendert `next/link`.
- `attributes`-String wird zu Rest-Props.
- CSS 1:1.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün
- [ ] Tastatur + Screenreader im Browser geprüft
- [x] Metafelder: keine
