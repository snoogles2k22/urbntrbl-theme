# Seiten-Blueprints

Ein Blueprint pro Seitentyp. Er legt fest, welche Sections in welcher Reihenfolge
stehen, welche Komponenten sie nutzen, welche Daten sie brauchen und in welchen
Zuständen die Seite sein kann. Aus den Blueprints sind abgeleitet:

- `design/components/README.md`: das Komponenten-Inventar (nur was ein Blueprint braucht)
- `docs/data-model.md`: Entitäten und Felder, die das Theme liest
- `docs/metafields.md`: die Metafelder und Metaobjekte, die über Shopify-Standard hinausgehen

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
4. `footer` (Section Group `footer`) mit Newsletter, Navigation, Rechtliches
5. `cart-drawer` (Section, einmal pro Seite) mit `<ut-cart-drawer>`

Der Rahmen wird in `home.md` nicht wiederholt.
