# Metafeld-Registry

Jedes Metafeld und Metaobjekt, das das Theme liest, steht hier **vor** der ersten
Verwendung. Abgeleitet aus `design/blueprints/`; Spalte **Blueprint** nennt die
Quelle. Namespace ist immer `urbntrbl`, Keys in `snake_case`. Definitionen werden im
Shopify-Admin unter Einstellungen → Benutzerdefinierte Daten angelegt, mit
Storefront-Zugriff, damit sie in Liquid und im Theme-Editor als dynamische Quelle
verfügbar sind.

## Konventionen

- **Typ** ist der Shopify-Metafeld-Typ.
- **Medusa** nennt das Ziel beim Port (Details in `data-model.md`).
- **Zugriff im Theme** nur über Snippets `snippets/metafield-<key>.liquid`, nie direkt in
  Sections (ADR 0005).
- **Status**: `geplant` (hier definiert, im Admin noch nicht angelegt), `angelegt`, `in Benutzung`.

## Produkt (`product`)

| Key                 | Typ                              | Validierung                                  | Verwendet in                 | Medusa                               | Blueprint | Status  |
|---------------------|----------------------------------|----------------------------------------------|------------------------------|--------------------------------------|-----------|---------|
| `subtitle`          | `single_line_text_field`         | max 80 Zeichen                               | Product Card, Buy Box        | `product.subtitle`                   | C P       | geplant |
| `material`          | `single_line_text_field`         | –                                            | Accordion „Material & Fit“   | `product.material`                   | P         | geplant |
| `fit_notes`         | `single_line_text_field`         | max 160 Zeichen                              | Accordion „Material & Fit“   | `product.metadata.fit_notes`         | P         | geplant |
| `care_instructions` | `rich_text_field`                | –                                            | Accordion „Pflege“           | `product.metadata.care_instructions` | P         | geplant |
| `badge`             | `single_line_text_field`         | Choices: `new`, `limited`, `restock`, `collab` | Product Card, Buy Box     | `product.metadata.badge`             | C P H D   | geplant |
| `lookbook`          | `list.file_reference`            | nur Bilder, max 12                           | Section `product-lookbook`   | `product.metadata.lookbook`          | P         | geplant |
| `size_guide`        | `metaobject_reference`           | Typ `size_guide`                             | Buy Box → `<ut-dialog>`      | Relation `size_guide`                | P         | geplant |
| `drop`              | `metaobject_reference`           | Typ `drop`                                   | Buy Box Eyebrow, Cart Line   | Relation `drop`                      | P K       | geplant |
| `purchase_limit`    | `number_integer`                 | min 1, max 10                                | Quantity Input, Cart         | `product.metadata.purchase_limit`    | P K       | geplant |
| `edition_size`      | `number_integer`                 | min 1; nur bei echter Limitierung **[RECHT-PRÜFEN]** | Stock Status (Modus `edition`) | `product.metadata.edition_size`  | C P D     | geplant |

`sale`, `sold_out` und `new` (per Alter) sind **keine** Badge-Werte, sie werden
abgeleitet. `badge` ist für redaktionelle Kennzeichnung. Steht beides an, gewinnt
`sold_out` > `sale` > `badge`.

`purchase_limit` wird nur clientseitig durchgesetzt (Quantity-Max, Cart-Hinweis).
Serverseitig braucht es eine Shopify Function (Cart Validation); das ist eine
spätere Entscheidung mit eigenem ADR.

## Kollektion (`collection`)

| Key          | Typ                | Validierung | Verwendet in       | Medusa                          | Blueprint | Status  |
|--------------|--------------------|-------------|--------------------|---------------------------------|-----------|---------|
| `intro`      | `rich_text_field`  | –           | Collection Header  | `product_category.metadata.intro` | C       | geplant |
| `hero_image` | `file_reference`   | nur Bilder  | Collection Header  | `product_category.metadata.hero_image` | C  | geplant |
| `drop`       | `metaobject_reference` | Typ `drop` | Collection Header Eyebrow | aus `drop.collection` (FK), kein eigenes Feld | C | geplant |

## Metaobjekte

### `drop` (Web-Seite aktiviert, URL-Schema `/drops/<handle>`)

| Feld              | Typ                                   | Pflicht | Validierung                                       |
|-------------------|---------------------------------------|---------|---------------------------------------------------|
| `title`           | `single_line_text_field`              | ja      | Display-Name                                      |
| `subtitle`        | `single_line_text_field`              | nein    | max 120                                           |
| `launch_at`       | `date_time`                           | ja      | –                                                 |
| `end_at`          | `date_time`                           | nein    | > `launch_at`                                     |
| `status_override` | `single_line_text_field`              | ja      | Choices `auto`, `upcoming`, `live`, `sold_out`, `archived`; Default `auto` |
| `stock_display`   | `single_line_text_field`              | ja      | Choices `hidden`, `low_only`, `exact`, `edition`; Default `low_only` |
| `waitlist_mode`   | `single_line_text_field`              | ja      | Choices `none`, `drop`, `restock`, `both`; Default `both` |
| `archive_when_sold_out` | `boolean`                       | nein    | Default false                                     |
| `hero_media`      | `file_reference`                      | ja      | Bild oder Video                                   |
| `story`           | `rich_text_field`                     | nein    | –                                                 |
| `collection`      | `collection_reference`                | ja      | –                                                 |
| `teaser_items`    | `list.metaobject_reference`           | nein    | Typ `drop_teaser_item`, max 24                    |
| `lookbook`        | `list.file_reference`                 | nein    | nur Bilder, max 24                                |
| `notify_tag`      | `single_line_text_field`              | nein    | Pattern `drop-[a-z0-9-]+`; leer = `drop-<handle>` |
| `seo_title`       | `single_line_text_field`              | nein    | max 70                                            |
| `seo_description` | `single_line_text_field`              | nein    | max 160                                           |

Status: geplant. Medusa: Modul `drop`. Verhalten der Felder: `design/logic/drop.md`.

### `drop_teaser_item`

| Feld    | Typ                      | Pflicht |
|---------|--------------------------|---------|
| `name`  | `single_line_text_field` | ja      |
| `image` | `file_reference`         | ja      |
| `note`  | `single_line_text_field` | nein    |

Status: geplant. Medusa: Tabelle `drop_teaser_item`.

### `size_guide`

| Feld    | Typ                      | Pflicht |
|---------|--------------------------|---------|
| `title` | `single_line_text_field` | ja      |
| `table` | `rich_text_field`        | ja      |
| `note`  | `single_line_text_field` | nein    |

Status: geplant. Medusa: Modul `size_guide`.

## Admin-Checkliste pro Drop

1. Kollektion anlegen (manuell), Produkte zuordnen.
2. Produkte: Online-Store-Kanal mit geplantem Veröffentlichungsdatum = `launch_at`; Metafeld `drop` setzen; Bestand tracken mit `inventory_policy = deny`; `edition_size` nur bei echter Limitierung.
3. Metaobjekt `drop` anlegen: Felder füllen, `collection` verknüpfen, `teaser_items` für die Vorschau, `stock_display` und `waitlist_mode` wählen.
4. Kollektion: Metafeld `drop` auf das neue Metaobjekt setzen.
5. Preise: `compare_at_price` nur setzen, wenn er der niedrigste Preis der letzten 30 Tage ist (§ 11 PAngV) oder als UVP gekennzeichnet wird. **[RECHT-PRÜFEN]**
6. Prüfen: `/drops/<handle>` zeigt Teaser; nach `launch_at` Lineup.
7. Bei `end_at` (oder Override `sold_out`/`archived`): Produkte aus dem Online-Store-Kanal nehmen, wenn sie nicht mehr kaufbar sein sollen. Das Theme verhindert keinen Kauf.

## Nicht als Metafeld (bewusst)

| Bedarf                      | Lösung                                     | Grund                                   |
|-----------------------------|--------------------------------------------|-----------------------------------------|
| Announcement-Text           | Section-Settings `announcement-bar`        | Inhalt, im Editor gepflegt              |
| Hover-Bild der Product Card | `product.media[1]`                         | nativ vorhanden                         |
| Steuer-/Versandhinweis      | Theme-Settings (`price_*`)                 | Verhalten, global                       |
| „Neu“-Badge                 | `product.created_at` + Setting             | abgeleitet                              |
| Warteliste                  | Kunden-Tags (`drop-*`, `restock-*`)        | kein Metafeld möglich für Kundenlisten; siehe `logic/drop.md` |

## Änderungslog

| Datum      | Änderung                                                              |
|------------|-----------------------------------------------------------------------|
| 2026-11-17 | Registry angelegt                                                     |
| 2026-11-17 | Aus Blueprints abgeleitet: Produkt-Felder ergänzt (`lookbook`, `drop`, `purchase_limit`), Metaobjekte `drop`, `drop_teaser_item`, `size_guide` definiert, `shop.announcement` gestrichen (Setting) |
| 2026-11-17 | Drop-Logik und Review: `product.edition_size`, `collection.drop`, Drop-Felder `stock_display`, `waitlist_mode`, `archive_when_sold_out`, Status `sold_out`, Checkliste erweitert |
