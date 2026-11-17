# Komponente: `price`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | Spec (kein Code)                                  |
| BEM-Block       | `.ut-price`                                       |
| CSS-Datei       | `assets/component-price.css`                      |
| Custom Element  | kein JS                                           |
| JS-Datei        | n/a                                               |
| Liquid          | `snippets/price.liquid`                           |
| Port-Typ        | Server Component (reine Darstellung)              |

## 1. Zweck

Zeigt den Preis eines Produkts oder einer Variante inklusive aller in Deutschland
pflichtigen Zusatzangaben (PAngV): Streichpreis bei Angeboten, Grundpreis bei
Mengenware, Steuerhinweis und Versandkostenhinweis mit Link. Wird in Product Card
(kompakt, ohne Hinweise) und auf der Produktseite sowie im Warenkorb (voll) verwendet.
Keine Logik zur Preisberechnung, nur Darstellung dessen, was die Plattform liefert.

## 2. Anatomie (BEM)

```
.ut-price
├── .ut-price__from          „ab“-Präfix, wenn Varianten unterschiedlich kosten
├── .ut-price__amount        aktueller Preis (Gesamtpreis)
├── .ut-price__compare       Streichpreis (<s>), nur bei --sale
├── .ut-price__unit          Grundpreis, z. B. „(12,50 € / 100 g)“
├── .ut-price__notes         Container für rechtliche Hinweise (nur voll-Variante)
│   ├── .ut-price__tax-note      Slot: Steuerhinweis (siehe 4 und 9)
│   └── .ut-price__shipping-note Slot: „zzgl. Versandkosten“ mit Link
└── Modifier
    ├── .ut-price--sale        Angebot (compare > amount)
    ├── .ut-price--compact     Card-Variante: ohne __notes, ohne __unit
    ├── .ut-price--size-sm | --size-lg
    └── .ut-price--unavailable Variante nicht verfügbar (Preis ausgegraut)
```

Layout: `amount` und `compare` inline, `unit` in eigener Zeile darunter, `notes` als
`<small>`-Block mit `text-muted`. Keine Breakpoint-Abhängigkeit.

## 3. Datenvertrag (plattformneutral)

| Feld               | Typ                        | Pflicht | Quelle Shopify                                   | Quelle Medusa                                         |
|--------------------|----------------------------|---------|--------------------------------------------------|-------------------------------------------------------|
| `amount`           | Money (minor units)        | ja      | `variant.price` / `product.price`                | `variant.calculated_price.calculated_amount`           |
| `compareAt`        | Money \| null              | nein    | `variant.compare_at_price`                       | `variant.calculated_price.original_amount`             |
| `currency`         | ISO 4217                   | ja      | `cart.currency.iso_code` / `localization`        | `region.currency_code`                                 |
| `isFrom`           | boolean                    | nein    | `product.price_varies`                           | min/max über Varianten berechnet                       |
| `unitPrice`        | { amount, unit, base }     | nein    | `variant.unit_price`, `unit_price_measurement`   | `variant.metadata.unit_price_*` (eigene Konvention)    |
| `taxMode`          | `included` \| `kleinunternehmer` \| `none` | ja | Theme-Setting `price_tax_mode`              | Store-Config / Env                                      |
| `shippingInfoUrl`  | URL \| null                | nein    | `shop.shipping_policy.url`, Fallback Theme-Setting `price_shipping_page` | CMS-Seite „Versand“               |
| `available`        | boolean                    | ja      | `variant.available`                              | `variant.inventory_quantity > 0 \|\| allow_backorder`  |

Formatierung: Shopify via `money` / `money_with_currency` (Shop-Einstellung
`de-DE`: `12,50 €`). Medusa via `Intl.NumberFormat(locale, { style: 'currency' })`.

## 4. Einstellungen (Theme-Editor, global in `settings_schema.json`)

Rechtliche Hinweise sind Verhalten, keine Design-Werte, darum erlaubt (ADR 0004).

| ID                    | Typ    | Default           | Beschreibung                                                   |
|-----------------------|--------|-------------------|----------------------------------------------------------------|
| `price_tax_mode`      | select | `kleinunternehmer`| `included` → „inkl. MwSt.“; `kleinunternehmer` → § 19-Hinweis; `none` → kein Steuerhinweis |
| `price_shipping_page` | url    | leer              | Fallback-Link für den Versandhinweis, wenn keine Shipping Policy hinterlegt ist |
| `price_show_notes_in_cart` | checkbox | true         | Hinweise auch im Warenkorb-Drawer zeigen                        |

Snippet-Parameter: `product`/`variant`, `compact` (bool), `size` (`sm`/`md`/`lg`).

## 5. Zustände

| Zustand       | Auslöser                            | Darstellung                                           |
|---------------|-------------------------------------|-------------------------------------------------------|
| regular       | kein compareAt oder compareAt ≤ amount | nur `__amount`                                     |
| sale          | compareAt > amount                  | `.ut-price--sale`, `__compare` als `<s>`, `__amount` in `text-sale` |
| from          | `isFrom`                            | `__from` sichtbar                                     |
| unavailable   | `available == false`                | `.ut-price--unavailable`, Farbe `text-subtle`         |
| compact       | Card-Kontext                        | `.ut-price--compact`, `__notes` und `__unit` nicht gerendert (nicht nur versteckt) |

## 6. Verwendete Tokens

- `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-text-subtle`, `--ut-color-text-sale`, `--ut-color-text-link`
- `--ut-font-size-sm`, `--ut-font-size-md`, `--ut-font-size-lg`, `--ut-font-size-xs` (notes)
- `--ut-font-weight-regular`, `--ut-font-weight-semibold`
- `--ut-font-family-body`
- `--ut-space-1`, `--ut-space-2`

## 7. Verhalten und JS

Kein JS. Auf der Produktseite tauscht `<ut-variant-picker>` (eigene Spec) bei
Variantenwechsel das gerenderte Snippet per Section Rendering API aus, die Komponente
selbst bleibt statisch. Der Versand-Link ist ein normaler `<a>`.

## 8. Accessibility

- Streichpreis: `<s>` plus visuell versteckter Text „Regulärer Preis“ davor, „Angebotspreis“ vor `__amount` (Keys unten).
- `__notes` als `<small>`; Link im Versandhinweis mit sprechendem Text („Versandkosten“), kein „hier“.
- Keine Farbe als einziger Träger der Sale-Information: Streichpreis ist semantisch (`<s>`) und textlich gekennzeichnet.
- Kontrast: `text-muted` auf `bg-default` muss AA für small text halten; nach Brand-Freigabe prüfen.

## 9. Texte (Locale-Keys)

| Key                                         | DE                                                   | EN                                              |
|---------------------------------------------|------------------------------------------------------|-------------------------------------------------|
| `products.price.from`                       | ab                                                   | from                                            |
| `products.price.regular_price`              | Regulärer Preis                                      | Regular price                                   |
| `products.price.sale_price`                 | Angebotspreis                                        | Sale price                                      |
| `products.price.unit_price_separator`       | /                                                    | /                                               |
| `products.price.tax_note_included`          | inkl. MwSt.                                          | incl. VAT                                       |
| `products.price.tax_note_kleinunternehmer`  | Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.   | No VAT shown pursuant to § 19 UStG (German small business regulation). |
| `products.price.shipping_note_html`         | zzgl. {{ link }}                                     | plus {{ link }}                                 |
| `products.price.shipping_link_text`         | Versandkosten                                        | shipping costs                                  |

Der Versandhinweis wird als `shipping_note_html` mit `link:` Parameter gerendert, damit
Satzbau und Link-Position pro Sprache frei sind.

## 10. Port-Hinweise (Next.js + Medusa)

- Server Component `<Price>` mit Props exakt wie Datenvertrag in 3. Keine Client-Logik.
- `taxMode` kommt aus Store-Config (Env oder Settings-Tabelle), nicht aus dem Produkt.
- Grundpreis: Medusa kennt kein `unit_price` nativ. Konvention `variant.metadata.unit_price_amount`,
  `unit_price_unit`, `unit_price_base` festlegen, bevor Produkte importiert werden.
- `money`-Filter wird zu `Intl.NumberFormat`. Locale aus Region ableiten.
- Shipping-Link zeigt auf CMS-Seite, URL aus Site-Config.
- Offen: Mehrwährung (Shopify Markets) vs. Medusa Regions. Entscheidung vor Port.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [ ] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün
- [ ] Tastatur + Screenreader geprüft
- [ ] Metafelder in `docs/metafields.md` (keine für diese Komponente)
