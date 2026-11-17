# Blueprint: Drop-Seite und Drop-Übersicht

Template: `templates/metaobject/drop.json` · Route: `/drops/<handle>`
Übersicht: `templates/page.drops.json` · Route: `/pages/drops`

## Zweck

Ein Drop ist eine zeitlich begrenzte Veröffentlichung mit eigenem Namen, Datum, Story
und Lineup. Die Seite hat drei Leben: **Teaser** vor dem Launch (Countdown, Erinnerung),
**Live** während des Verkaufs (Lineup kaufbar) und **Archiv** danach (Lookbook, Hinweis
auf nächsten Drop). Drop ist die zentrale Marketing-Einheit, darum ein eigenes
Datenmodell (ADR 0008) statt „Kollektion mit Metafeldern“.

## Datenmodell: Metaobjekt `drop`

| Feld             | Typ (Shopify)                      | Pflicht | Beschreibung                                                                 |
|------------------|------------------------------------|---------|------------------------------------------------------------------------------|
| `title`          | single_line_text_field             | ja      | Drop-Name (Display-Name des Metaobjekts)                                     |
| `subtitle`       | single_line_text_field             | nein    | Claim / Untertitel                                                           |
| `launch_at`      | date_time                          | ja      | Startzeitpunkt (UTC, Anzeige in Shop-Zeitzone)                               |
| `end_at`         | date_time                          | nein    | Ende; leer = offen bis ausverkauft                                           |
| `status_override`| single_line_text_field (Choices: `auto`, `upcoming`, `live`, `archived`) | ja, Default `auto` | Manuelles Überschreiben des berechneten Status |
| `hero_media`     | file_reference (image/video)       | ja      | Hero                                                                         |
| `story`          | rich_text_field                    | nein    | Story / Beschreibung                                                         |
| `collection`     | collection_reference               | ja      | Lineup-Kollektion. Produkte des Drops liegen in dieser Kollektion            |
| `teaser_items`   | list.metaobject_reference (`drop_teaser_item`) | nein | Vorschau vor Launch, da unveröffentlichte Produkte in Liquid nicht lesbar sind |
| `lookbook`       | list.file_reference                | nein    | Bilder, auch im Archiv-Zustand                                               |
| `notify_tag`     | single_line_text_field             | nein    | Kunden-Tag für „Erinnere mich“, z. B. `drop-ss26-01`                          |
| `seo_title`, `seo_description` | single_line_text_field | nein  | Overrides                                                                    |

Metaobjekt `drop_teaser_item`: `name` (text), `image` (file_reference), `note` (text, z. B. „Limitiert auf 50“).

Status-Berechnung (Snippet `drop-status.liquid`, auch in Medusa identisch):

```
if status_override != auto → status_override
elif now < launch_at        → upcoming
elif end_at and now > end_at → archived
else                        → live
```

Die Berechnung läuft in Liquid zur Render-Zeit. Shopifys Cache kann den Umschlag um
Minuten verzögern, darum ergänzt `<ut-countdown>` clientseitig: läuft der Countdown
ab, lädt es die Section per Section Rendering API nach.

Kaufbarkeit vor Launch wird **nicht** vom Theme erzwungen, sondern über Shopifys
geplante Veröffentlichung der Produkte im Online-Store-Kanal (Publish-Datum =
`launch_at`). Das Theme zeigt vor Launch nur `teaser_items`.

## Layout: Drop-Seite

```
┌──────────────────────────────────────────────┐
│ drop-hero                                    │
│  Hero-Media · Eyebrow „Drop“ · Titel · Sub   │
│  .ut-badge Status · Datum                    │
│  <ut-countdown> (nur upcoming)               │
│  CTA: Notify (upcoming) / Zum Lineup (live)  │
├──────────────────────────────────────────────┤
│ drop-story (.ut-rich-text, optional)         │
├──────────────────────────────────────────────┤
│ drop-lineup                                  │
│  upcoming: .ut-teaser-grid aus teaser_items  │
│  live:     .ut-product-grid aus collection   │
│  archived: .ut-product-grid, Cards ohne Buy, │
│            Badge „Drop beendet“               │
├──────────────────────────────────────────────┤
│ drop-lookbook (.ut-lookbook)                 │
├──────────────────────────────────────────────┤
│ drop-notify (upcoming: Formular; sonst       │
│  „Nächster Drop“ Teaser-Card, falls vorhanden)│
└──────────────────────────────────────────────┘
```

## Sections (Drop-Seite)

| # | Section                 | Komponenten                                                                         | Settings (Editor)                                     |
|---|-------------------------|-------------------------------------------------------------------------------------|-------------------------------------------------------|
| 1 | `drop-hero.liquid`      | `.ut-hero--drop`, `.ut-badge`, `<ut-countdown>`, `.ut-button`                       | `hero_height` (`md`/`lg`/`full`), `show_date` (bool)  |
| 2 | `drop-story.liquid`     | `.ut-rich-text`, `.ut-section-header`                                                | `width` (`narrow`/`wide`)                             |
| 3 | `drop-lineup.liquid`    | `.ut-product-grid`, `.ut-product-card`, `.ut-teaser-grid`, `.ut-teaser-card`, `.ut-badge`, `.ut-button` | `columns_desktop`, `limit` (0 = alle), `show_all_link` (bool, Link zur Collection mit Filtern) |
| 4 | `drop-lookbook.liquid`  | `.ut-lookbook`, `.ut-image`                                                          | `layout` (`grid`/`masonry`/`scroll`)                  |
| 5 | `drop-notify.liquid`    | `.ut-newsletter`, `.ut-form-field`, `.ut-button`, `.ut-drop-card` (nächster Drop)    | `heading`, `text`, `success_text`                     |

## Drop-Übersicht (`/pages/drops`)

Eine Section `drops-index.liquid`: liest `shop.metaobjects.drop.values`, sortiert nach
`launch_at` absteigend, gruppiert in „Aktuell“ (live), „Demnächst“ (upcoming) und
„Archiv“. Komponenten: `.ut-section-header`, `.ut-drop-card` (Hero-Bild, Titel, Datum,
Status-Badge, Link), `<ut-countdown>` in upcoming-Cards (kompakt). Settings:
`show_archive` (bool), `archive_limit` (int).

Hinweis Shopify: `shop.metaobjects.<type>.values` liefert maximal 50 Einträge ohne
Pagination. Reicht für Jahre; bei Überschreiten Archiv über Collection-Tags lösen.

## Datenbedarf (zusätzlich zum Metaobjekt)

| Feld                        | Quelle                                                          |
|-----------------------------|-----------------------------------------------------------------|
| Lineup-Produkte             | `drop.collection.products` (ProductCard-Felder, siehe `collection.md`) |
| `now`                       | Liquid `'now' | date`                                           |
| Shop-Zeitzone               | `shop.timezone`? nicht in Liquid: Anzeige über `date` mit Shop-Offset, Countdown clientseitig mit ISO-UTC |
| Kunde angemeldet            | `customer` (für Notify: vorbefülltes E-Mail-Feld)               |

Rückrichtung Produkt → Drop: Metafeld `product.metafields.urbntrbl.drop`
(metaobject_reference). Wird vom Merchant gesetzt; die PDP zeigt daraus den
Drop-Eyebrow. Eine automatische Rückauflösung über die Collection ist in Liquid
zu teuer (alle Drops iterieren) und wird nicht gemacht.

## Zustände

| Zustand   | Hero                                  | Lineup                        | Notify                   | SEO                                   |
|-----------|---------------------------------------|-------------------------------|--------------------------|---------------------------------------|
| upcoming  | Countdown, Datum, CTA „Erinnere mich“ | Teaser-Grid (keine Preise)    | Formular                 | indexierbar, `Event`-Structured-Data  |
| live      | Badge „Live“, CTA „Zum Lineup“ (Anchor) | Produkt-Grid kaufbar        | Nächster-Drop-Card o. nichts | indexierbar                       |
| archived  | Badge „Beendet“, kein CTA             | Produkt-Grid, Cards zeigen „Ausverkauft“/„Drop beendet“, Preise bleiben (PAngV irrelevant, nicht kaufbar) | Nächster-Drop-Card | indexierbar, Hinweis im Title „(Archiv)“ |
| no teaser | upcoming ohne `teaser_items`          | Lineup-Section nicht gerendert |                         |                                       |

## Accessibility

- Countdown: `role="timer"`, `aria-live="off"` (kein Sekunden-Spam), Text-Alternative „Startet am <Datum>“ sichtbar.
- Notify-Formular: Shopify `customer_form` (Newsletter) mit `tags: notify_tag`; Erfolgs- und Fehlermeldung als `aria-live="polite"`.
- Hero-Video: ohne Autoplay-Ton, `prefers-reduced-motion` respektieren (Poster statt Video).

## Port-Hinweise

- Medusa: eigenes Modul `drop` (Entität mit den Feldern oben, Relation zu `product_category` oder `collection`, `teaser_items` als JSON-Spalte oder eigene Entität).
- Status-Berechnung als geteilte Funktion (`lib/drop-status.ts`), identische Logik.
- Geplante Veröffentlichung: Medusa hat kein Publish-Datum; Produkt-Sichtbarkeit über `sales_channel` + Cron oder `drop.status` serverseitig filtern.
- Notify: statt Kunden-Tag ein eigenes `drop_subscriber`-Modell oder Klaviyo-Liste.
