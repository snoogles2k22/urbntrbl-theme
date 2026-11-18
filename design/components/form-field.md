# Komponente: `form-field`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-form-field`                                  |
| CSS-Datei       | `assets/component-form-field.css`                 |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/form-field.liquid`                      |
| Port-Typ        | Server Component (Formular-Logik beim Aufrufer)   |

## 1. Zweck

Ein Eingabefeld mit Label, Hinweis und Fehlermeldung: E-Mail (Newsletter, Warteliste),
Cart-Notiz, Einwilligungs-Checkbox. Die Felder stecken in Shopify-Formularen
(`{% form %}`), die Komponente rendert nur das Feld.

## 2. Anatomie (BEM)

```
.ut-form-field
├── .ut-form-field__label
│   └── .ut-form-field__required   „*“, aria-hidden (Pflicht steckt im required-Attribut)
├── .ut-form-field__group          nur --inline: Input + Button nebeneinander
│   └── .ut-form-field__control    input / textarea
├── .ut-form-field__hint
├── .ut-form-field__error          mit Icon alert
└── Modifier: --inline | --checkbox | --hidden-label
```

## 3. Datenvertrag

| Feld           | Typ     | Pflicht | Beschreibung                                         |
|----------------|---------|---------|------------------------------------------------------|
| `id`           | string  | ja      | eindeutig auf der Seite                              |
| `name`         | string  | ja      | Formularname (z. B. `contact[email]`)                |
| `label`        | string  | ja      | auch bei `hide_label` (dann visuell versteckt)       |
| `type`         | enum    | nein    | `text` (Default), `email`, `tel`, `textarea`, `checkbox` |
| `value`        | string  | nein    |                                                      |
| `placeholder`  | string  | nein    | nie statt Label                                      |
| `autocomplete` | string  | nein    | z. B. `email`                                        |
| `required`     | boolean | nein    |                                                      |
| `checked`      | boolean | nein    | Checkbox                                             |
| `hint`         | string  | nein    |                                                      |
| `error`        | string  | nein    | gesetzt → `aria-invalid="true"`                      |
| `hide_label`   | boolean | nein    |                                                      |
| `inline_button`| string  | nein    | Label des Submit-Buttons → Modifier `--inline`       |
| `attributes`   | string  | nein    | zusätzliche Input-Attribute                          |

## 4. Einstellungen

n/a

## 5. Zustände

| Zustand   | Auslöser               | Darstellung                                   |
|-----------|------------------------|-----------------------------------------------|
| default   | –                      | Rahmen `border.control`                       |
| focus     | `:focus-visible`       | globaler Fokusring                            |
| invalid   | `[aria-invalid=true]`  | Rahmen `border.error`, Fehlertext `text.error`, Icon |
| disabled  | `[disabled]`           | `action.disabled-*`                           |

## 6. Verwendete Tokens

- `--ut-color-border-control`, `--ut-color-bg-default`, `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-text-error`, `--ut-color-border-error`, `--ut-color-action-primary-bg`, `--ut-color-action-disabled-bg`, `--ut-color-action-disabled-text`
- `--ut-size-control-md`, `--ut-size-icon-sm`, `--ut-size-icon-md`
- `--ut-space-1`, `-2`, `-3`, `--ut-font-size-xs`, `-sm`, `-md`, `--ut-font-weight-medium`, `--ut-font-line-height-snug`
- `--ut-radius-control`, `--ut-border-width-hairline`

## 7. Verhalten und JS

Kein JS. Fehler kommen serverseitig aus `form.errors` oder vom aufrufenden Element.

## 8. Accessibility

- `<label for>` immer vorhanden; `aria-describedby` verweist auf Hinweis und Fehler.
- Schriftgröße im Input `font.size.md` (16px), damit iOS nicht zoomt.
- Fehlertext ist Text, nicht nur rote Farbe; Icon zusätzlich.
- Rahmen 5.3:1 gegen Hintergrund (WCAG 1.4.11).
- Checkbox nativ, `accent-color` aus Tokens, Ziel mindestens `size.icon-md`.

## 9. Texte

Labels und Fehler vom Aufrufer.

## 10. Port-Hinweise

- `<FormField>` mit gleichen Props; Formular-Submit wird Server Action.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Tastatur, Screenreader, iOS-Zoom geprüft
- [x] Metafelder: keine
