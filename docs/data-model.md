# Datenmodell

Alle Entitäten, die das Theme liest, abgeleitet aus `design/blueprints/`. Spalte
**Herkunft** sagt, ob Shopify das Feld nativ liefert, ob es ein Metafeld/Metaobjekt
ist (dann Details in `metafields.md`) oder ob es ein Theme-Setting ist. Spalte
**Medusa** nennt das Ziel beim Port.

## Übersicht

```
Drop ──1:1── Collection ──1:n── Product ──1:n── Variant
 │                                 │  │
 │ 1:n                              │  └── n:1 SizeGuide (Metaobjekt)
 └── DropTeaserItem                 └── n:1 Drop (Rückreferenz, manuell)

Cart ──1:n── CartLine ──n:1── Variant

Shop: Settings (Theme), Navigation (Menüs), Policies, Customer (nur Login-Zustand)
```

## Product

| Feld               | Typ            | Herkunft                               | Medusa                                   | Blueprints |
|--------------------|----------------|----------------------------------------|------------------------------------------|------------|
| `id`, `handle`     | id, slug       | nativ                                  | `product.id`, `product.handle`           | alle       |
| `title`            | string         | nativ                                  | `product.title`                          | alle       |
| `subtitle`         | string         | Metafeld `urbntrbl.subtitle`           | `product.subtitle`                       | C P        |
| `vendor`           | string         | nativ                                  | `product.metadata.vendor`                | P          |
| `description`      | HTML           | nativ                                  | `product.description`                    | P          |
| `media[]`          | Media          | nativ                                  | `product.images[]`, Video via metadata   | C P        |
| `options[]`        | Option         | nativ                                  | `product.options[]`                      | P          |
| `variants[]`       | Variant        | nativ                                  | `product.variants[]`                     | P K        |
| `price`, `compareAtPrice`, `priceVaries` | Money | nativ                     | aus `variants[].calculated_price`        | alle       |
| `available`        | bool           | nativ                                  | abgeleitet aus Varianten                 | alle       |
| `createdAt`        | datetime       | nativ (für „Neu“-Badge)                | `product.created_at`                     | C H        |
| `url`              | URL            | nativ                                  | `/products/${handle}`                    | alle       |
| `material`         | string         | Metafeld `urbntrbl.material`           | `product.material`                       | P          |
| `fitNotes`         | string         | Metafeld `urbntrbl.fit_notes`          | `product.metadata.fit_notes`             | P          |
| `careInstructions` | RichText       | Metafeld `urbntrbl.care_instructions`  | `product.metadata.care_instructions`     | P          |
| `badge`            | enum           | Metafeld `urbntrbl.badge`              | `product.metadata.badge`                 | C P H D    |
| `lookbook[]`       | Image          | Metafeld `urbntrbl.lookbook`           | `product.metadata.lookbook` (URL-Liste)  | P          |
| `sizeGuide`        | SizeGuide      | Metafeld `urbntrbl.size_guide`         | Relation → Modul `size_guide`            | P          |
| `drop`             | Drop           | Metafeld `urbntrbl.drop`               | Relation → Modul `drop`                  | P K        |
| `purchaseLimit`    | int            | Metafeld `urbntrbl.purchase_limit`     | `product.metadata.purchase_limit`        | P K        |

## Variant

| Feld                 | Typ     | Herkunft | Medusa                                           |
|----------------------|---------|----------|--------------------------------------------------|
| `id`, `title`        | –       | nativ    | `variant.id`, `variant.title`                    |
| `options[]`          | string  | nativ    | `variant.options[]`                              |
| `price`, `compareAtPrice` | Money | nativ | `calculated_price.calculated_amount` / `original_amount` |
| `available`          | bool    | nativ    | `inventory_quantity > 0 \|\| allow_backorder`    |
| `inventoryQuantity`  | int     | nativ    | `variant.inventory_quantity`                     |
| `inventoryPolicy`    | `deny`/`continue` | nativ | `variant.allow_backorder`                   |
| `unitPrice`          | { amount, unit, base } | nativ (`unit_price`, `unit_price_measurement`) | `variant.metadata.unit_price_*` |
| `image`              | Image   | nativ    | `variant.metadata.image_id` → `product.images`   |
| `sku`                | string  | nativ    | `variant.sku`                                    |

## Collection

| Feld             | Typ        | Herkunft                             | Medusa                                 | Blueprints |
|------------------|------------|--------------------------------------|----------------------------------------|------------|
| `id`, `handle`, `title`, `url` | – | nativ                           | `product_category` oder `collection`   | C H D      |
| `description`    | HTML       | nativ                                | `.description`                         | C          |
| `image`          | Image      | nativ                                | `.metadata.image`                      | C          |
| `intro`          | RichText   | Metafeld `urbntrbl.intro`            | `.metadata.intro`                      | C          |
| `heroImage`      | Image      | Metafeld `urbntrbl.hero_image`       | `.metadata.hero_image`                 | C          |
| `productsCount`  | int        | nativ                                | `count` aus Query                      | C          |
| `products[]`     | Product    | nativ, paginiert                     | `GET /store/products?category_id=`     | C H D      |
| `filters[]`      | Filter     | nativ (Search & Discovery)           | Meilisearch-Facets (offen)             | C          |
| `sortOptions[]`  | SortOption | nativ                                | feste Liste im Frontend                | C          |

Entscheidung: Medusa-Seite nutzt `product_category` (hierarchisch, hat `handle`),
nicht `collection`. Festgelegt, damit das Mapping eindeutig ist; bei Port prüfen.

## Drop (Metaobjekt `drop`)

| Feld              | Typ                       | Medusa (`drop`-Modul)              |
|-------------------|---------------------------|------------------------------------|
| `handle`, `title`, `subtitle` | –             | `drop.handle`, `.title`, `.subtitle` |
| `launchAt`, `endAt` | datetime (UTC)          | `drop.launch_at`, `.end_at`        |
| `statusOverride`  | `auto`/`upcoming`/`live`/`archived` | `drop.status_override`   |
| `status`          | berechnet                 | berechnet, gleiche Funktion        |
| `heroMedia`       | Media                     | `drop.hero_media_url`              |
| `story`           | RichText                  | `drop.story`                       |
| `collection`      | Collection                | FK → `product_category`            |
| `teaserItems[]`   | DropTeaserItem            | `drop_teaser_item` (eigene Tabelle)|
| `lookbook[]`      | Image                     | `drop.lookbook` (JSON)             |
| `notifyTag`       | string                    | `drop.notify_key`                  |
| `seoTitle`, `seoDescription` | string         | `drop.seo_*`                       |
| `url`             | `/drops/<handle>`         | identisch                          |

**DropTeaserItem** (Metaobjekt `drop_teaser_item`): `name`, `image`, `note`.

**SizeGuide** (Metaobjekt `size_guide`): `title`, `table` (RichText mit Tabelle), `note`.
Medusa: Modul `size_guide`, `table` als HTML.

## Cart und CartLine

Neutrale Form, die `assets/ut-api.js` liefert und die Liquid-Seite `cart` abbildet.
Vollständig in `design/blueprints/cart.md`. Medusa: `GET /store/carts/:id`,
`line_items[]` mit `variant`, `unit_price`, `quantity`, `total`.

## Shop-Ebene

| Feld                      | Herkunft                                   | Medusa                        | Blueprints |
|---------------------------|--------------------------------------------|-------------------------------|------------|
| `taxMode`                 | Theme-Setting `price_tax_mode`             | Store-Config                  | P K        |
| `shippingInfoUrl`         | `shop.shipping_policy.url` / Setting       | Site-Config                   | P K        |
| `lowStockThreshold`       | Theme-Setting `low_stock_threshold`        | Site-Config                   | P          |
| `newBadgeDays`            | Theme-Setting `new_badge_days`             | Site-Config                   | C H        |
| `shippingReturnsText`     | Theme-Setting `pdp_shipping_returns_text`  | CMS                           | P          |
| `discountHint`            | Theme-Setting `cart_discount_hint`         | entfällt (Medusa hat Codes im Cart) | K    |
| `announcement`            | Section-Settings `announcement-bar`        | CMS                           | R          |
| Navigation (Haupt, Footer)| Shopify-Menüs (`linklists`)                | CMS / JSON-Config             | R          |
| Policies                  | `shop.policies`                            | CMS-Seiten                    | R K        |
| `customer` (Login-Zustand, E-Mail) | nativ                             | Medusa Customer               | D R        |

## Ableitung Blueprint → Entität

| Blueprint    | Product | Variant | Collection | Drop | SizeGuide | Cart | Shop |
|--------------|:-------:|:-------:|:----------:|:----:|:---------:|:----:|:----:|
| Home         | Card    | –       | ja         | ja   | –         | –    | ja   |
| Collection   | Card    | –       | ja         | –    | –         | –    | ja   |
| PDP          | voll    | voll    | –          | ref  | ja        | –    | ja   |
| Drop         | Card    | –       | ja         | voll | –         | –    | –    |
| Cart         | ref     | ref     | –          | ref  | –         | voll | ja   |

„Card“ = nur die ProductCard-Felder (siehe `blueprints/collection.md`).
