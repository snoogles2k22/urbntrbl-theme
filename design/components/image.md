# Komponente: `image`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-image`                                       |
| CSS-Datei       | `assets/component-image.css`                      |
| Custom Element  | kein JS                                           |
| Liquid          | `snippets/image.liquid`                           |
| Port-Typ        | Server Component (`next/image`)                   |

## 1. Zweck

Responsives Bild mit `srcset`, festem oder natürlichem Seitenverhältnis und
Platzhalter, wenn kein Bild gesetzt ist. Einzige Stelle, an der `image_url` und
`image_tag` aufgerufen werden.

## 2. Anatomie (BEM)

```
.ut-image                 Rahmen mit aspect-ratio, Hintergrund bg.muted
├── img.ut-image__img
├── svg.ut-image__placeholder   (Shopify placeholder_svg_tag, wenn kein Bild)
└── Modifier
    ├── --natural (Default) | --square | --portrait | --landscape | --wide
    └── --contain           object-fit: contain statt cover
```

Natürliches Verhältnis wird als Custom Property gesetzt:
`style="--ut-image-ratio: {{ image.aspect_ratio }}"` (zulässiger dynamischer Wert).

## 3. Datenvertrag

| Feld          | Typ      | Pflicht | Beschreibung                                                      |
|---------------|----------|---------|-------------------------------------------------------------------|
| `image`       | Image    | nein    | Shopify image/media; leer → Platzhalter                           |
| `ratio`       | enum     | nein    | siehe Modifier                                                    |
| `fit`         | enum     | nein    | `cover` (Default), `contain`                                      |
| `sizes`       | string   | nein    | `sizes`-Attribut, Default `100vw`                                 |
| `widths`      | string   | nein    | Default `360, 540, 720, 960, 1200, 1440, 1920`                    |
| `priority`    | boolean  | nein    | LCP-Bild: `loading="eager"`, `fetchpriority="high"`               |
| `alt`         | string   | nein    | überschreibt `image.alt`                                          |
| `decorative`  | boolean  | nein    | `alt=""`                                                          |
| `placeholder` | string   | nein    | Name für `placeholder_svg_tag`, Default `image`                   |
| `class`       | string   | nein    | zusätzliche Klasse                                                |

## 4. Einstellungen

n/a

## 5. Zustände

| Zustand     | Auslöser         | Darstellung                       |
|-------------|------------------|-----------------------------------|
| loaded      | Bild vorhanden   | `__img`                           |
| placeholder | `image` leer     | `__placeholder`, Farbe text.subtle |

## 6. Verwendete Tokens

- `--ut-color-bg-muted`, `--ut-color-text-subtle`
- `--ut-ratio-square`, `-portrait`, `-landscape`, `-wide`

## 7. Verhalten und JS

Kein JS. Lazy Loading nativ.

## 8. Accessibility

- Alt-Text aus Shopify-Media. Produktbilder ohne Alt bekommen den Produkttitel vom Aufrufer.
- Platzhalter-SVG ist dekorativ.

## 9. Texte

Keine.

## 10. Port-Hinweise

- `next/image` mit `fill` im Rahmen, `sizes` 1:1, `priority` 1:1.
- Loader für Medusa-File-URLs (oder CDN) nötig, Risiko mittel (siehe `docs/migration.md`).

## 11. Abnahme

- [x] Spec
- [x] CSS nur Tokens
- [ ] `shopify theme check` grün
- [ ] Im Browser: srcset und LCP geprüft
- [x] Metafelder: keine
