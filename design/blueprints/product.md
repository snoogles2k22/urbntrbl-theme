# Blueprint: Produktseite (PDP)

Template: `templates/product.json` · Route: `/products/<handle>`

## Zweck

Ein Produkt kaufen. Alles andere (Story, Lookbook, Related) ist nachgeordnet und
liegt unterhalb des Fold. Mobil: Galerie oben, Buy Box direkt darunter, Add-to-Cart
bleibt per Sticky-Bar erreichbar.

## Layout

```
┌──────────────────────────────────────────────┐
│ main-product                                 │
│ ┌──────────────────┐ ┌─────────────────────┐ │
│ │ ut-gallery       │ │ Buy Box             │ │
│ │ (Media,          │ │  eyebrow: Drop/Coll │ │
│ │  Thumbnails,     │ │  Titel, Subtitle    │ │
│ │  Zoom)           │ │  ut-price (voll)    │ │
│ │                  │ │  ut-badge           │ │
│ │                  │ │  <ut-variant-picker>│ │
│ │                  │ │  Size-Guide-Link    │ │
│ │                  │ │  <ut-quantity-input>│ │
│ │                  │ │  Stock-Status       │ │
│ │                  │ │  ut-button Add      │ │
│ │                  │ │  Details (details/  │ │
│ │                  │ │  summary Accordions)│ │
│ └──────────────────┘ └─────────────────────┘ │
├──────────────────────────────────────────────┤
│ product-lookbook (optional, aus Metafeld)    │
├──────────────────────────────────────────────┤
│ related-products (<ut-carousel>)             │
├──────────────────────────────────────────────┤
│ sticky-buy-bar (mobil, <ut-sticky-bar>)      │
└──────────────────────────────────────────────┘
```

## Sections

| # | Section                      | Komponenten                                                                                   | Settings (Editor)                                                   |
|---|------------------------------|-----------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| 1 | `main-product.liquid`        | `.ut-gallery` `<ut-gallery>`, `.ut-buy-box`, `.ut-price`, `.ut-badge`, `<ut-variant-picker>`, `<ut-quantity-input>`, `.ut-stock-status`, `.ut-button`, `.ut-accordion` (`<details>`), `<ut-dialog>` (Size Guide), `.ut-rich-text` | `show_quantity` (bool, default false), `gallery_layout` (`stacked`/`thumbnails`), `show_vendor` (bool), Accordion-Blöcke: `description`, `material_fit`, `care`, `shipping_returns` (je ein Block, Reihenfolge frei) |
| 2 | `product-lookbook.liquid`    | `.ut-lookbook`, `.ut-image`                                                                   | `heading` (text), `columns` (2/3)                                   |
| 3 | `related-products.liquid`    | `.ut-section-header`, `<ut-carousel>`, `.ut-product-card`, `.ut-price--compact`                | `heading`, `source` (`same_drop`/`same_collection`/`recommendations`), `limit` (4–12) |
| 4 | `sticky-buy-bar.liquid`      | `<ut-sticky-bar>`, `.ut-price--compact`, `.ut-button`                                          | `enabled` (bool)                                                    |

Blöcke in `main-product` (Shopify Theme Blocks in `blocks/`): `title`, `price`,
`variant-picker`, `quantity`, `buy-buttons`, `accordion`, `text`, `size-guide-link`.
Reihenfolge im Editor frei, Default wie oben.

## Datenbedarf

| Feld                       | Typ                         | Quelle                                    | Pflicht |
|----------------------------|-----------------------------|-------------------------------------------|---------|
| `product.title`            | string                      | nativ                                     | ja      |
| `product.subtitle`         | string                      | Metafeld `urbntrbl.subtitle`              | nein    |
| `product.vendor`           | string                      | nativ                                     | nein    |
| `product.description`      | HTML                        | nativ                                     | ja      |
| `product.media[]`          | Media (image/video/model)   | nativ                                     | ja      |
| `product.variants[]`       | Variant                     | nativ                                     | ja      |
| `product.options[]`        | Option (Größe, Farbe)       | nativ                                     | ja      |
| `variant.available`, `inventory_quantity`, `inventory_policy` | –     | nativ                                     | ja      |
| `product.material`         | string                      | Metafeld `urbntrbl.material`              | nein    |
| `product.fitNotes`         | string                      | Metafeld `urbntrbl.fit_notes`             | nein    |
| `product.careInstructions` | RichText                    | Metafeld `urbntrbl.care_instructions`     | nein    |
| `product.sizeGuide`        | SizeGuide (Metaobjekt)      | Metafeld `urbntrbl.size_guide`            | nein    |
| `product.badge`            | enum                        | Metafeld `urbntrbl.badge`                 | nein    |
| `product.lookbook[]`       | Image[]                     | Metafeld `urbntrbl.lookbook`              | nein    |
| `product.drop`             | Drop (Metaobjekt)           | Metafeld `urbntrbl.drop`                  | nein    |
| `product.purchaseLimit`    | int                         | Metafeld `urbntrbl.purchase_limit`        | nein    |
| `shop.shippingReturnsText` | RichText                    | Theme-Setting `pdp_shipping_returns_text` | nein    |
| Preis-Felder               | siehe `components/price.md` |                                           |         |

Stock-Status wird abgeleitet: `sold_out` (keine Variante verfügbar), `low_stock`
(`inventory_quantity <= low_stock_threshold`, Theme-Setting, Default 3),
`available`. Bei `inventory_policy == continue` nie `low_stock`.

## Zustände

| Zustand           | Bedingung                                   | Darstellung                                                              |
|-------------------|---------------------------------------------|--------------------------------------------------------------------------|
| regular           | Standard                                    | –                                                                        |
| sale              | Variante hat compare_at > price             | `.ut-price--sale`, Badge „Sale“                                          |
| sold out          | keine Variante verfügbar                    | Button disabled „Ausverkauft“, Badge, Stock-Status, optional Notify-Form  |
| variant sold out  | gewählte Variante nicht verfügbar           | Option im Picker durchgestrichen, Button disabled                        |
| low stock         | siehe oben                                  | Stock-Status „Nur noch wenige“                                           |
| in drop (live)    | `product.drop.status == live`               | Eyebrow „Drop: <Titel>“ mit Link, Badge „Drop“                           |
| in drop (upcoming)| Produkt ist im Online-Store noch nicht veröffentlicht | Seite existiert nicht (404). Teaser läuft über die Drop-Seite.  |
| purchase limit    | `purchaseLimit` gesetzt                     | Quantity-Input max = limit, Hinweis „Max. N pro Bestellung“              |

## Accessibility und SEO

- Galerie: Pfeiltasten, Thumbnails als `<button>`, Alt-Texte aus Shopify-Media.
- Variant Picker: `<fieldset>` + `<legend>`, Radios, nicht-verfügbare Optionen `aria-disabled`.
- Structured Data `Product` + `Offer` (JSON-LD) aus nativen Feldern, im Snippet `structured-data-product.liquid`.
- Rechtliches: Preis mit Steuer- und Versandhinweis, Grundpreis bei `unit_price`.

## Port-Hinweise

- `<ut-variant-picker>` + `<ut-quantity-input>` + Buy Button werden ein Client Component `ProductForm`; Gallery ein Client Component; Rest Server.
- Shopify Section Rendering API (Variantenwechsel lädt Snippet nach) wird zu lokalem State.
- Metafelder → `product.metadata.*`, Size Guide und Drop → eigene Medusa-Module (siehe `docs/data-model.md`).
