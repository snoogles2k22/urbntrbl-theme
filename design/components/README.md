# Komponenten-Inventar

Abgeleitet aus `design/blueprints/`. Es steht nur drin, was mindestens ein Blueprint
braucht. Eine Spec pro Komponente nach `_TEMPLATE.md`. Alle BEM-Blöcke tragen den
Präfix `ut-`, alle Custom Elements ebenfalls.

Spalte **Seiten**: H = Home, C = Collection, P = PDP, D = Drop, K = Cart (Drawer + Seite), R = Rahmen (Header/Footer).
Spalte **Status**: `offen` (keine Spec), `Spec`, `In Arbeit`, `Fertig`.

## Primitive (kein JS)

| Komponente       | BEM-Block              | Seiten        | Spec-Datei           | Status |
|------------------|------------------------|---------------|----------------------|--------|
| Button           | `.ut-button`           | alle          | `button.md`          | offen  |
| Icon             | `.ut-icon`             | alle          | `icon.md`            | offen  |
| Image            | `.ut-image`            | alle          | `image.md`           | offen  |
| Badge            | `.ut-badge`            | H C P D       | `badge.md`           | offen  |
| Price            | `.ut-price`            | H C P D K     | `price.md`           | Spec   |
| Rich Text        | `.ut-rich-text`        | H C P D       | `rich-text.md`       | offen  |
| Form Field       | `.ut-form-field`       | H D K R       | `form-field.md`      | offen  |
| Section Header   | `.ut-section-header`   | H P D K       | `section-header.md`  | offen  |
| Empty State      | `.ut-empty-state`      | C K           | `empty-state.md`     | offen  |
| Stock Status     | `.ut-stock-status`     | P             | `stock-status.md`    | offen  |

## Zusammengesetzt (kein JS)

| Komponente        | BEM-Block                | Seiten    | Spec-Datei              | Status |
|-------------------|--------------------------|-----------|-------------------------|--------|
| Product Card      | `.ut-product-card`       | H C P D K | `product-card.md`       | offen  |
| Product Grid      | `.ut-product-grid`       | H C D     | `product-grid.md`       | offen  |
| Teaser Card/Grid  | `.ut-teaser-card`, `.ut-teaser-grid` | D | `teaser-card.md`     | offen  |
| Drop Card         | `.ut-drop-card`          | H D       | `drop-card.md`          | offen  |
| Collection Header | `.ut-collection-header`  | C         | `collection-header.md`  | offen  |
| Hero              | `.ut-hero`               | H D       | `hero.md`               | offen  |
| Split (Image+Text)| `.ut-split`              | H         | `split.md`              | offen  |
| Lookbook          | `.ut-lookbook`           | P D       | `lookbook.md`           | offen  |
| Ticker            | `.ut-ticker`             | H         | `ticker.md`             | offen  |
| Accordion         | `.ut-accordion` (`<details>`) | P    | `accordion.md`          | offen  |
| Pagination        | `.ut-pagination`         | C         | `pagination.md`         | offen  |
| Newsletter        | `.ut-newsletter`         | H D R     | `newsletter.md`         | offen  |
| Buy Box           | `.ut-buy-box`            | P         | `buy-box.md`            | offen  |
| Cart (Seite)      | `.ut-cart`               | K         | `cart.md`               | offen  |
| Cart Line         | `.ut-cart-line`          | K         | `cart-line.md`          | offen  |
| Cart Summary      | `.ut-cart-summary`       | K         | `cart-summary.md`       | offen  |
| Announcement Bar  | `.ut-announcement-bar`   | R         | `announcement-bar.md`   | offen  |
| Footer            | `.ut-footer`             | R         | `footer.md`             | offen  |

## Interaktiv (Custom Element + BEM-Block)

| Komponente       | Element                | BEM-Block           | Seiten  | Nutzt `ut-api` | Spec-Datei           | Status |
|------------------|------------------------|---------------------|---------|----------------|----------------------|--------|
| Header           | `<ut-header>`          | `.ut-header`        | R       | nein           | `header.md`          | offen  |
| Drawer           | `<ut-drawer>`          | `.ut-drawer`        | R C K   | nein           | `drawer.md`          | offen  |
| Cart Count       | `<ut-cart-count>`      | `.ut-cart-count`    | R       | Event          | `cart-count.md`      | offen  |
| Cart Drawer      | `<ut-cart-drawer>`     | `.ut-cart-drawer`   | K       | ja             | `cart-drawer.md`     | offen  |
| Dialog           | `<ut-dialog>`          | `.ut-dialog`        | P       | nein           | `dialog.md`          | offen  |
| Gallery          | `<ut-gallery>`         | `.ut-gallery`       | P       | nein           | `gallery.md`         | offen  |
| Variant Picker   | `<ut-variant-picker>`  | `.ut-variant-picker`| P       | nein           | `variant-picker.md`  | offen  |
| Quantity Input   | `<ut-quantity-input>`  | `.ut-quantity`      | P K     | nein           | `quantity-input.md`  | offen  |
| Product Form     | `<ut-product-form>`    | –                   | P       | ja             | `product-form.md`    | offen  |
| Carousel         | `<ut-carousel>`        | `.ut-carousel`      | H P K   | nein           | `carousel.md`        | offen  |
| Facets           | `<ut-facets>`          | `.ut-facets`        | C       | nein           | `facets.md`          | offen  |
| Countdown        | `<ut-countdown>`       | `.ut-countdown`     | H D     | nein           | `countdown.md`       | offen  |
| Sticky Bar       | `<ut-sticky-bar>`      | `.ut-sticky-bar`    | P       | nein           | `sticky-bar.md`      | offen  |

Basis-Utilities (`.ut-skip-link`, `.ut-visually-hidden`) leben in `base.css` und
brauchen keine Spec.

## Snippets (Render-Helfer, keine Komponenten)

| Snippet                            | Zweck                                                        |
|------------------------------------|--------------------------------------------------------------|
| `image.liquid`                     | responsives `<img>` mit `srcset`, `sizes`, Aspect Ratio      |
| `price.liquid`                     | rendert `.ut-price` aus Produkt/Variante                     |
| `product-card.liquid`              | rendert `.ut-product-card`                                   |
| `drop-status.liquid`               | berechnet `upcoming`/`live`/`archived` (siehe `blueprints/drop.md`) |
| `current-drop.liquid`              | ermittelt den aktuellen Drop für Home                        |
| `structured-data-product.liquid`   | JSON-LD Product/Offer                                        |
| `metafield-*.liquid`               | ein Snippet pro Metafeld-Zugriff (ADR 0005)                  |

## Bau-Reihenfolge

Nach Abhängigkeiten; jede Phase liefert eine benutzbare Seite.

| Phase | Komponenten                                                                                     | Ergebnis                 |
|-------|-------------------------------------------------------------------------------------------------|--------------------------|
| A     | Button, Icon, Image, Badge, Price, Rich Text, Form Field, Section Header, Empty State            | Primitive, Styleguide-Seite |
| B     | Header, Drawer, Cart Count, Announcement Bar, Footer, Newsletter                                  | Rahmen auf allen Seiten  |
| C     | Product Card, Product Grid, Pagination, Collection Header, Facets                                | Collection-Seite         |
| D     | Gallery, Variant Picker, Quantity Input, Product Form, Buy Box, Stock Status, Accordion, Dialog, Lookbook, Carousel, Sticky Bar | PDP |
| E     | Cart Line, Cart Summary, Cart Drawer                                                             | Warenkorb                |
| F     | Hero, Countdown, Drop Card, Teaser Card/Grid, Ticker, Split                                      | Drop-Seite, Startseite   |

Phase A enthält eine temporäre Section `styleguide.liquid` (Template `page.styleguide.json`),
die alle Primitive in allen Zuständen rendert. Sie ersetzt die Placeholder-Section.
