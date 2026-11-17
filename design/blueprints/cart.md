# Blueprint: Warenkorb (Drawer und Seite)

Drawer: Section `cart-drawer.liquid`, in `theme.liquid` einmal gerendert, Overlay auf jeder Seite.
Seite: `templates/cart.json` · Route: `/cart`

## Zweck

Positionen prüfen, Menge ändern, zum Checkout. Drawer ist der Primärweg (öffnet nach
Add-to-Cart und über den Header-Icon), die Seite ist Fallback ohne JS und Ziel des
Drawer-Links „Warenkorb ansehen“. Beide rendern dieselben Komponenten mit derselben
Datenform aus `ut-api.js`.

## Layout

```
Drawer (rechts, max 480px, lg)        Seite
┌───────────────────────┐             ┌────────────────────────────────────┐
│ Warenkorb (3)      [×]│             │ main-cart                          │
├───────────────────────┤             │ ┌──────────────────┐ ┌───────────┐ │
│ .ut-cart-line         │             │ │ .ut-cart-line ×n │ │ .ut-cart- │ │
│  Bild Titel Variante  │             │ │                  │ │  summary  │ │
│  <ut-quantity-input>  │             │ │                  │ │  Subtotal │ │
│  ut-price  [Entfernen]│             │ │                  │ │  Hinweise │ │
│ .ut-cart-line         │             │ │                  │ │  Note     │ │
├───────────────────────┤             │ │                  │ │  Checkout │ │
│ .ut-cart-summary      │             │ └──────────────────┘ └───────────┘ │
│  Zwischensumme        │             ├────────────────────────────────────┤
│  Steuer-/Versandhinw. │             │ cart-recommendations (optional)    │
│  Rabatt-Hinweis       │             └────────────────────────────────────┘
│  [Zur Kasse]          │
│  Warenkorb ansehen    │
└───────────────────────┘
```

## Sections

| # | Section                      | Komponenten                                                                                                             | Settings (Editor)                                                                                  |
|---|------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| 1 | `cart-drawer.liquid`         | `<ut-cart-drawer>` (erweitert `<ut-drawer>`), `.ut-cart-drawer`, `.ut-cart-line`, `<ut-quantity-input>`, `.ut-price`, `.ut-cart-summary`, `.ut-button`, `.ut-empty-state` | `show_note` (bool), `show_discount_hint` (bool), `empty_cta_source` (`current_drop`/`collection`), `empty_collection` (collection) |
| 2 | `main-cart.liquid`           | `.ut-cart`, `.ut-cart-line`, `<ut-quantity-input>`, `.ut-price`, `.ut-cart-summary`, `.ut-form-field` (Note), `.ut-button`, `.ut-empty-state` | wie Drawer, zusätzlich `show_continue_shopping` (bool)                                             |
| 3 | `cart-recommendations.liquid`| `.ut-section-header`, `<ut-carousel>`, `.ut-product-card`                                                                | `heading`, `limit`, `source` (`recommendations`/`current_drop`)                                    |

## Datenbedarf

Neutrale Form (aus `ut-api.js`, in Liquid aus `cart`):

| Feld                     | Typ          | Quelle Shopify                                   |
|--------------------------|--------------|--------------------------------------------------|
| `cart.itemCount`         | int          | `cart.item_count`                                |
| `cart.totalPrice`        | Money        | `cart.total_price`                               |
| `cart.currency`          | ISO          | `cart.currency.iso_code`                         |
| `cart.note`              | string       | `cart.note`                                      |
| `cart.lines[]`           | Line         | `cart.items`                                     |
| `line.key`               | string       | `item.key`                                       |
| `line.title`, `variantTitle` | string   | `item.product_title`, `item.variant_title`       |
| `line.image`             | Image        | `item.image`                                     |
| `line.url`               | URL          | `item.url`                                       |
| `line.quantity`          | int          | `item.quantity`                                  |
| `line.price`, `comparePrice` | Money    | `item.final_line_price`, `item.original_line_price` |
| `line.purchaseLimit`     | int \| null  | `item.product.metafields.urbntrbl.purchase_limit` |
| `line.available`         | int          | `item.variant.inventory_quantity` (für max im Quantity-Input, wenn `inventory_policy == deny`) |
| `line.dropTitle`         | string \| null | `item.product.metafields.urbntrbl.drop.title`  |
| `settings.taxMode`, `shippingInfoUrl`, `showNotesInCart` | siehe `components/price.md` |             |

Rabattcodes werden **nicht** im Warenkorb eingegeben (Shopify erlaubt das nur im
Checkout). Stattdessen Hinweis „Rabattcodes im Checkout einlösen“ (Setting).

## Zustände

| Zustand        | Bedingung                                  | Darstellung                                                                          |
|----------------|--------------------------------------------|--------------------------------------------------------------------------------------|
| empty          | `itemCount == 0`                           | `.ut-empty-state` mit CTA: aktueller Drop (live) sonst Standard-Kollektion            |
| default        | Positionen vorhanden                       | Liste + Summary                                                                      |
| updating       | API-Call läuft                             | betroffene Line `aria-busy`, Quantity-Input disabled, Summary gedimmt                 |
| error          | API-Fehler (z. B. Bestand überschritten)   | Inline-Meldung an der Line (`aria-live="polite"`), Menge auf letzten gültigen Wert   |
| limit reached  | `quantity >= purchaseLimit`                | Plus-Button disabled, Hinweis „Max. N pro Bestellung“                                |
| just added     | Add-to-Cart von PDP                        | Drawer öffnet, neue Line oben, Fokus auf Drawer-Titel                                 |

## Verhalten (`<ut-cart-drawer>`)

- Öffnet auf Event `ut:cart:updated` (wenn Quelle `add`) und auf Klick `<ut-cart-count>`.
- Rendert aus der neutralen Cart-Form: in v1 per Section Rendering API (`?sections=cart-drawer`) nachgeladen, nicht clientseitig templated. So bleibt Liquid die einzige Template-Sprache.
- Focus Trap, `Escape` schließt, Fokus kehrt zum Auslöser zurück, `inert` auf dem Rest.
- Ohne JS: Header-Icon linkt auf `/cart`, PDP-Formular postet nach `/cart/add` mit Redirect auf `/cart`.

## Accessibility

- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` Titel.
- Quantity: `<input type="number">` mit `inputmode="numeric"`, Plus/Minus-Buttons mit `aria-label`, Änderungen debounced (300 ms).
- Entfernen: Button mit Produktnamen im `aria-label`.
- Zwischensumme als `<dl>`.

## Port-Hinweise

- Section Rendering API entfällt; der Drawer wird ein Client Component, das die neutrale Cart-Form aus dem Medusa-Adapter rendert. Die CSS- und Zustandsdefinitionen bleiben.
- Cart-ID in Cookie/LocalStorage (Medusa), statt Shopify-Session.
- Rabattcodes: Medusa erlaubt sie im Cart; dann wird der Hinweis durch `ut-form-field` + Apply ersetzt (bereits als Slot in `.ut-cart-summary__discount` vorsehen).
