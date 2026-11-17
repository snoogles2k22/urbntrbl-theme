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

Spalte **JS** sagt, ob `ut-api.js` das Feld liefert (aus `/cart.js`). Felder ohne JS
gibt es nur in Liquid. Weil der Drawer per Section Rendering neu gerendert wird, reicht
das in v1. Im Port liefert der Medusa-Adapter alle Felder (Metadaten und Bestand
hängen an der Variante).

| Feld                     | Typ          | Quelle Shopify                                   | JS  |
|--------------------------|--------------|--------------------------------------------------|-----|
| `cart.itemCount`         | int          | `cart.item_count`                                | ja  |
| `cart.totalPrice`        | Money        | `cart.total_price`                               | ja  |
| `cart.currency`          | ISO          | `cart.currency.iso_code`                         | ja  |
| `cart.note`              | string       | `cart.note`                                      | nein (v1) |
| `cart.lines[]`           | Line         | `cart.items`                                     | ja  |
| `line.key`               | string       | `item.key`                                       | ja  |
| `line.variantId`, `productId` | id      | `item.variant_id`, `item.product_id`             | ja  |
| `line.title`, `variantTitle` | string   | `item.product_title`, `item.variant_title`       | ja  |
| `line.image`             | Image        | `item.image`                                     | ja  |
| `line.url`               | URL          | `item.url`                                       | ja  |
| `line.quantity`          | int          | `item.quantity`                                  | ja  |
| `line.price`             | Money        | `item.final_line_price`                          | ja  |
| `line.comparePrice`      | Money        | `item.original_line_price`                       | ja  |
| `line.purchaseLimit`     | int \| null  | `item.product.metafields.urbntrbl.purchase_limit` | nein |
| `line.available`         | int          | `item.variant.inventory_quantity` (für max im Quantity-Input, wenn `inventory_policy == deny`) | nein |
| `line.dropTitle`         | string \| null | `item.product.metafields.urbntrbl.drop.value.title` | nein |
| `settings.taxMode`, `shippingInfoUrl`, `showNotesInCart` | siehe `components/price.md` | | nein |

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

- Öffnet auf Event `ut:cart:updated` mit `detail.source == 'add'` und auf Klick `<ut-cart-count>`.
- In v1 per Section Rendering API nachgeladen (über `ut-api.js`, `sections.render('cart-drawer')`), nicht clientseitig templated. So bleibt Liquid die einzige Template-Sprache.
- Während eines Live-Drops zeigt der Drawer optional „Artikel im Warenkorb sind nicht reserviert“ (Setting `drop_cart_hint`, siehe `logic/drop.md` Abschnitt 4).
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
