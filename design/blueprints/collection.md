# Blueprint: Kollektionsseite

Template: `templates/collection.json` · Route: `/collections/<handle>`
Zusätzlich: `templates/list-collections.json` (`/collections`) als einfache Kachel-Liste, gleiche Komponenten.

## Zweck

Produkte einer Kollektion durchsuchen und zur PDP gelangen. Filter und Sortierung
nutzen Shopifys Storefront-Filter (`collection.filters`), kein eigenes Filtersystem.
Drops verwenden ebenfalls dieses Template für ihr Lineup (siehe `drop.md`), darum
muss die Seite ohne Header-Bild und ohne Intro auskommen können.

## Layout

```
┌──────────────────────────────────────────────┐
│ collection-header                            │
│  Hero-Bild (optional) · Titel · Intro · Anz. │
├──────────────────────────────────────────────┤
│ main-collection                              │
│  <ut-facets>: Filter-Drawer (mobil) /        │
│  Sidebar (lg) · Sortierung · aktive Filter   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                 │
│  │card│ │card│ │card│ │card│  .ut-product-grid│
│  └────┘ └────┘ └────┘ └────┘                 │
│  .ut-pagination                              │
│  .ut-empty-state (wenn 0 Treffer)            │
└──────────────────────────────────────────────┘
```

## Sections

| # | Section                        | Komponenten                                                                                     | Settings (Editor)                                                                 |
|---|--------------------------------|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | `collection-header.liquid`     | `.ut-collection-header`, `.ut-image`, `.ut-rich-text`                                            | `show_image` (bool), `show_description` (bool), `show_count` (bool), `image_height` (`sm`/`md`/`lg`) |
| 2 | `main-collection.liquid`       | `<ut-facets>`, `.ut-facets`, `<ut-drawer>` (Filter mobil), `.ut-product-grid`, `.ut-product-card`, `.ut-price--compact`, `.ut-badge`, `.ut-pagination`, `.ut-empty-state`, `.ut-button` | `products_per_page` (12–48), `columns_desktop` (3/4), `columns_mobile` (1/2), `enable_filtering`, `enable_sorting`, `filter_layout` (`drawer`/`sidebar`), `show_quick_add` (bool, default false, v2) |

## Datenbedarf

| Feld                         | Typ              | Quelle                                   | Pflicht |
|------------------------------|------------------|------------------------------------------|---------|
| `collection.title`           | string           | nativ                                    | ja      |
| `collection.description`     | HTML             | nativ                                    | nein    |
| `collection.image`           | Image            | nativ (`collection.image`)               | nein    |
| `collection.intro`           | RichText         | Metafeld `urbntrbl.intro` (ersetzt description, wenn gesetzt) | nein |
| `collection.heroImage`       | Image            | Metafeld `urbntrbl.hero_image` (ersetzt `collection.image`, wenn gesetzt) | nein |
| `collection.productsCount`   | int              | nativ                                    | ja      |
| `collection.products[]`      | ProductCard      | nativ, paginiert                         | ja      |
| `collection.filters[]`       | Filter           | nativ (`collection.filters`, Search & Discovery) | nein |
| `collection.sortOptions[]`   | SortOption       | nativ (`collection.sort_options`)        | ja      |
| ProductCard-Felder           | siehe unten      |                                          |         |

**ProductCard** (geteilt mit Home, Drop, Related, Cart-Empty-State):

| Feld              | Quelle                                                   |
|-------------------|----------------------------------------------------------|
| `title`           | `product.title`                                          |
| `subtitle`        | Metafeld `urbntrbl.subtitle`                             |
| `url`             | `product.url` (innerhalb Collection: `within: collection`)|
| `image`           | `product.featured_media`                                 |
| `hoverImage`      | `product.media[1]`, falls vorhanden (nativ, kein Metafeld)|
| `price`           | `product.price`, `compare_at_price`, `price_varies`      |
| `available`       | `product.available`                                      |
| `badge`           | Metafeld `urbntrbl.badge`, sonst abgeleitet (Sale, Sold out, Neu via `created_at` < 14 Tage Theme-Setting) |
| `colorCount`      | Anzahl Werte der Option „Farbe“ (optional, Setting)      |

## Zustände

| Zustand        | Bedingung                             | Darstellung                                                   |
|----------------|---------------------------------------|---------------------------------------------------------------|
| default        | Produkte vorhanden                    | Grid                                                          |
| filtered       | aktive Filter                         | Chips mit Entfernen-Button, „Alle zurücksetzen“, Treffer-Anzahl |
| empty          | 0 Produkte (auch nach Filter)         | `.ut-empty-state`: Text + Reset-Button bzw. Link zur aktuellen Drop-/Hauptkollektion |
| loading        | Filterwechsel via Section Rendering   | Grid `aria-busy`, Skeleton nicht nötig (Inhalt bleibt sichtbar) |
| as drop lineup | aufgerufen von Drop-Seite             | Header ohne Bild/Intro, Eyebrow „Drop: <Titel>“ mit Link zurück (Setting in Drop-Collection oder per URL-Param `?drop=<handle>`, Entscheidung in `drop.md`) |

## Accessibility und SEO

- Filter: `<form>` mit nativen Checkboxen, funktioniert ohne JS per Submit. JS ersetzt nur Full-Reload durch Section Rendering und URL-Update (`history.replaceState`).
- Sortierung: `<select>`, ohne JS Submit-Button.
- Pagination: `rel="prev"/"next"` im `<head>`, Shopify-Standard-URLs (`?page=2`), kein Infinite Scroll in v1.
- Grid als `<ul role="list">`, Card-Link umfasst Bild und Titel (ein Link pro Card).

## Port-Hinweise

- Filter/Sort: Medusa hat keine Storefront-Facets nativ. Vorsehen: Meilisearch oder eigene Filter über `product.metadata`. Das Facet-UI (`<ut-facets>`) bleibt, die Datenquelle wechselt.
- Pagination über `limit`/`offset` der Store API; URL-Schema beibehalten.
- `within: collection` (Breadcrumb-URLs) entfällt, URLs sind dann kanonisch.
