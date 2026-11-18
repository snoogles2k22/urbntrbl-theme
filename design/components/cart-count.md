# Komponente: `cart-count`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-cart-count`                                  |
| CSS-Datei       | `assets/component-cart-count.css`                 |
| Custom Element  | `<ut-cart-count>`                                 |
| JS-Datei        | `assets/ut-cart-count.js`                         |
| Liquid          | `snippets/cart-count.liquid`                      |
| Port-Typ        | Client Component                                  |

## 1. Zweck

Warenkorb-Symbol im Header mit Anzahl der Artikel. Link auf `/cart` (funktioniert
ohne JS), aktualisiert sich bei `ut:cart:updated` und öffnet den Cart Drawer, sobald
es ihn gibt (Phase E, `blueprints/cart.md`). Zeigt **keinen** Betrag und keine
Positionen.

## 2. Anatomie (BEM)

```
<ut-cart-count class="ut-cart-count">
└── a.ut-cart-count__link            href = Cart-Route
    ├── .ut-icon (cart)              dekorativ
    ├── .ut-cart-count__label        visuell versteckt: „Warenkorb, 2 Artikel“
    └── .ut-cart-count__bubble       sichtbare Zahl, aria-hidden, [hidden] bei 0, „99+“ ab 100
```

Alle Breakpoints gleich. Zahl sitzt oben rechts (logisch: `inset-inline-end`) am Icon.

## 3. Datenvertrag (plattformneutral)

| Feld        | Typ   | Pflicht | Quelle Shopify                     | Quelle Medusa                  |
|-------------|-------|---------|------------------------------------|--------------------------------|
| `itemCount` | int   | ja      | `cart.item_count` (Liquid), danach `ut:cart:updated` → `detail.cart.itemCount` | Cart-Context `cart.items` Summe `quantity` |
| `cartUrl`   | URL   | ja      | `routes.cart_url`                  | `/cart`                        |

## 4. Einstellungen

n/a.

## 5. Zustände

| Zustand | Auslöser          | Darstellung                          |
|---------|-------------------|--------------------------------------|
| empty   | `itemCount == 0`  | Bubble `[hidden]`, Label „0 Artikel“ |
| filled  | `itemCount > 0`   | Bubble mit Zahl                      |
| overflow| `itemCount > 99`  | Bubble „99+“, Label nennt exakte Zahl |

## 6. Verwendete Tokens

- `--ut-color-bg-inverse`, `--ut-color-text-inverse` (Bubble, 17.17:1), `--ut-color-action-primary-bg-hover` (Hover Icon, red 4.90:1 gegen bg.default)
- `--ut-size-control-md`, `--ut-size-icon-sm`
- `--ut-space-1`
- `--ut-font-size-xs`, `--ut-font-weight-bold`, `--ut-font-line-height-tight`
- `--ut-radius-full`

Bubble ist schwarz, nicht rot: Rot ist Hover und Sale, Live-Status ist schwarz mit rotem Punkt.

## 7. Verhalten und JS

- Ohne JS: Link auf `/cart`, Zahl aus Liquid.
- Hört auf `window` `ut:cart:updated` (`ut-api.js`) und setzt Zahl und Label neu.
  Kein eigener API-Call: Nutzt `ut-api` nur über das Event.
- Klick: Existiert ein `<ut-cart-drawer>` mit Methode `open()`, wird der Link-Default
  verhindert und der Drawer geöffnet. Sonst normaler Link.
- Plural über `Intl.PluralRules(<html lang>)` mit `data-items-one` / `data-items-other`.
- Property `count` (Setter) für andere Elemente.
- Bekannte Lücke: Nach Zurück-Navigation aus dem Back-Forward-Cache kann die Zahl
  veraltet sein. Lösung kommt mit Phase E (`cart.get()` auf `pageshow`).

## 8. Accessibility

- Ein Link, ein Name: „Warenkorb, 2 Artikel“ im versteckten Label; Bubble `aria-hidden`.
- Zielgröße `size.control-md` (44px).
- Keine Live-Region: Rückmeldung nach Add-to-Cart gibt der Cart Drawer (Phase E).

## 9. Texte (Locale-Keys)

| Key                           | DE         | EN     |
|-------------------------------|------------|--------|
| `layout.cart_count.label`     | Warenkorb  | Cart   |
| `layout.cart_count.items_one` | Artikel    | item   |
| `layout.cart_count.items_other` | Artikel  | items  |

Zusammensetzung „{label}, {n} {items}“ in Liquid und JS identisch.

## 10. Port-Hinweise (Next.js + Medusa)

- Client Component `<CartCount />` liest aus dem Cart-Context statt Window-Event (`docs/migration.md`).
- Öffnen des Drawers über Context-Action statt `querySelector`.
- CSS 1:1.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Tastatur + Screenreader geprüft (Verhalten per Headless-Browser getestet)
- [x] Metafelder: keine
