# Komponente: `empty-state`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-empty-state`                                 |
| CSS-Datei       | `assets/component-empty-state.css`                |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/empty-state.liquid`                     |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Leerer Zustand mit Ausweg: leerer Warenkorb, Kollektion ohne Treffer (auch nach
Filter). Immer mit mindestens einer Aktion, nie eine Sackgasse.

## 2. Anatomie (BEM)

```
.ut-empty-state
├── .ut-empty-state__icon      optional, dekorativ
├── .ut-empty-state__heading
├── .ut-empty-state__text
└── .ut-empty-state__actions   ein bis zwei .ut-button
```

## 3. Datenvertrag

| Feld                | Typ    | Pflicht | Beschreibung                   |
|---------------------|--------|---------|--------------------------------|
| `heading`           | string | ja      |                                |
| `text`              | string | nein    |                                |
| `icon`              | string | nein    | Icon-Name                      |
| `button_label`      | string | ja      |                                |
| `button_url`        | string | ja      |                                |
| `secondary_label`   | string | nein    | z. B. „Filter zurücksetzen“    |
| `secondary_url`     | string | nein    |                                |
| `heading_level`     | enum   | nein    | `h2` (Default), `h3`           |

## 4. Einstellungen

n/a (Ziel-URL kommt aus Section-Settings, siehe `blueprints/cart.md`)

## 5. Zustände

n/a

## 6. Verwendete Tokens

- `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-text-subtle`
- `--ut-font-size-md`, `-xl`, `--ut-font-weight-bold`
- `--ut-space-3`, `-4`, `-16`, `--ut-layout-gutter`, `--ut-layout-container-narrow`, `--ut-size-icon-xl`

## 7. Verhalten und JS

Kein JS. Wird nach Filterwechsel per Section Rendering mitgeliefert.

## 8. Accessibility

- Überschrift ist echtes Heading in der Seitenhierarchie.
- Nach Filter-Reset per JS meldet die Collection-Section die Trefferzahl in einer Live-Region (gehört zu Facets, nicht hierher).

## 9. Texte

Vom Aufrufer (`cart.empty.*`, `collections.empty.*` entstehen mit Phase C/E).

## 10. Port-Hinweise

- `<EmptyState>` mit `actions`-Array.

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Im Browser geprüft
- [x] Metafelder: keine
