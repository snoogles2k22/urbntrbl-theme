# Seiten-Blueprints

Ein Blueprint pro Seitentyp. Er legt fest, welche Sections in welcher Reihenfolge
stehen, welche Komponenten sie nutzen, welche Daten sie brauchen und in welchen
Zuständen die Seite sein kann. Aus den Blueprints sind abgeleitet:

- `design/components/README.md`: das Komponenten-Inventar (nur was ein Blueprint braucht)
- `docs/data-model.md`: Entitäten und Felder, die das Theme liest
- `docs/metafields.md`: die Metafelder und Metaobjekte, die über Shopify-Standard hinausgehen

Verhalten, das mehrere Seiten betrifft, steht nicht im Blueprint, sondern in
`design/logic/` (derzeit `drop.md`). Port-Plan: `docs/migration.md`.

Reihenfolge, in der die Blueprints gelesen werden sollten: `product.md` (meiste
Komponenten), `collection.md`, `drop.md` (eigenes Datenmodell), `cart.md`, `home.md`
(setzt alle anderen zusammen).

| Blueprint       | Shopify-Template                       | Route                     |
|-----------------|----------------------------------------|---------------------------|
| `home.md`       | `templates/index.json`                 | `/`                       |
| `collection.md` | `templates/collection.json`            | `/collections/<handle>`   |
| `product.md`    | `templates/product.json`               | `/products/<handle>`      |
| `drop.md`       | `templates/metaobject/drop.json` und `templates/page.drops.json` | `/drops/<handle>`, `/pages/drops` |
| `cart.md`       | `templates/cart.json` und Cart Drawer  | `/cart`, overlay überall  |
| `gift-card.md`  | `templates/gift_card.liquid` (ohne Layout) | `/gift_cards/<token>` |

## Lesart der Tabellen

- **Section**: Liquid-Section (Dateiname) und ihre Reihenfolge im Template.
- **Komponenten**: BEM-Blöcke (`.ut-*`) und Custom Elements (`<ut-*>`), die die Section rendert.
- **Daten**: plattformneutrale Felder. Quelle Shopify in `docs/data-model.md`.
- **Settings**: Editor-Einstellungen der Section, nur Inhalt und Verhalten (ADR 0004).
- **Zustände**: Varianten der ganzen Seite, nicht einzelner Komponenten.

## Gemeinsamer Rahmen (alle Seiten)

Aus `layout/theme.liquid`, in dieser Reihenfolge:

1. `announcement-bar` (Section Group `header`)
2. `header` (Section Group `header`) mit `<ut-header>`, `<ut-drawer>` (Menü), `<ut-cart-count>`
3. `{{ content_for_layout }}`
4. `footer` (Section Group `footer`) mit Newsletter, Rechtliches (Menü `footer`), Preis-Hinweis
5. `cart-drawer` (Section, einmal pro Seite) mit `<ut-cart-drawer>`

Der Rahmen wird in `home.md` nicht wiederholt.

### Sections des Rahmens (Phase B)

| Section                 | Group    | Komponenten                                                         | Settings (Editor)                                                                 |
|-------------------------|----------|---------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `announcement-bar.liquid` | header | `.ut-announcement-bar`                                              | `text` (leer = Locale-Default, **[ANNAHME]** „Drop 1 · 20.03.2027“, kein Preis), `link` (url) |
| `header.liquid`         | header   | `<ut-header>`, `.ut-header`, `<ut-drawer>` (Menü), `<ut-cart-count>`, `.ut-icon` | `menu` (link_list, Default `main-menu`, **[ANNAHME]** Drop 1, Über uns, Kontakt), `sticky` (bool) |
| `footer.liquid`         | footer   | `.ut-footer`, `.ut-newsletter`, `.ut-form-field`, `.ut-button`      | `tone` (`default`/`inverse`, Default `inverse`), `show_newsletter` (bool), `menu` (link_list, Default `footer`: Rechtslinks) |

Zustände des Rahmens: Header ohne Menü (nur Wortmarke und Warenkorb), Header ohne JS
(Navigation sichtbar, kein Menü-Button), Footer ohne Rechtsmenü (kein Rechtsblock, vor
Launch Pflicht). Rechtslinks kommen aus dem Menü `footer` und werden nie wegen leerer
Richtlinien ausgeblendet. Der Preis-Hinweis (§ 19 UStG) steht immer im Footer, die
Fußnote folgt `price_tax_mode` (**[RECHT-PRÜFEN]**).
Gutschein-Seite und Passwortseite rendern den Rahmen nicht.
