# Konsistenz-Review 2026-11-17

Geprüft: `design/blueprints/*`, `design/components/README.md` (Inventar),
`design/components/price.md`, `design/logic/drop.md` (neu), `docs/data-model.md`,
`docs/metafields.md`, `assets/ut-api.js`, `CLAUDE.md`.

Methode: Jede in einem Blueprint genannte Komponente, jedes Feld und jede Einstellung
wurde gegen Inventar, Datenmodell, Metafeld-Registry und Code abgeglichen. Dazu kommen
ein maschineller Abgleich der `.ut-*`-Blöcke (Blueprint vs. Inventar) und ein
inhaltlicher Durchgang.

Schweregrad: **hoch** = falsches Verhalten oder Rechtsrisiko, **mittel** = Lücke, die
beim Bauen zu Rückfragen oder Umbau führt, **niedrig** = Formulierung oder Ordnung.

**[RECHT-PRÜFEN]** markiert Umsetzungsannahmen, die vor Launch rechtlich geprüft werden sollten.
Das ist keine Rechtsberatung.

## Befunde

| Nr.  | Schwere | Ort                                | Befund                                                                                                                         | Korrektur                                                                                                   | Status   |
|------|---------|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|----------|
| K1   | hoch    | `components/price.md`              | **[RECHT-PRÜFEN]** Kompaktvariante ließ den Grundpreis weg (§ 4 PAngV, Grundpreis neben Gesamtpreis). | Grundpreis ist jetzt eine globale Einstellung `price_show_unit_price` und gilt dann in allen Varianten einschließlich `--compact`. Entscheidung 2026-11-17: optional statt Pflicht, weil Stückware in der Regel nicht betroffen ist. Steuer- und Versandhinweis in Listen per Fußnoten-Marker. | geändert |
| K2   | hoch    | `components/price.md`              | **[RECHT-PRÜFEN]** Streichpreis nutzt `compare_at_price` ohne Regel. Bei Preisermäßigungen muss der niedrigste Preis der letzten 30 Tage als Referenz dienen (§ 11 PAngV). Shopify prüft das nicht. | Regel in Spec und Admin-Checkliste: `compare_at_price` nur mit 30-Tage-Tiefstpreis setzen. Optionales Label „Niedrigster Preis der letzten 30 Tage“. | behoben  |
| K3   | hoch    | `blueprints/drop.md`, `metafields.md`, `data-model.md` | Status kennt nur `upcoming`, `live`, `archived`. Die Drop-Logik braucht `sold_out` und neue Felder (`stock_display`, `waitlist_mode`, `archive_when_sold_out`, `edition_size`). | Alle drei Dokumente auf `logic/drop.md` gezogen. Blueprint verweist für Logik nur noch auf die Logik-Spec. | behoben  |
| K4   | mittel  | `blueprints/collection.md`         | Zustand „as drop lineup“ verweist auf eine Entscheidung in `drop.md`, die dort nicht steht.                                    | Entscheidung: Kollektions-Metafeld `urbntrbl.drop` (Rückreferenz). Collection Header zeigt daraus den Eyebrow. | behoben  |
| K5   | mittel  | `blueprints/cart.md`, `ut-api.js`  | Cart-Blueprint nennt Felder als „neutrale Form aus ut-api.js“, die `/cart.js` nicht liefert (`purchaseLimit`, `available`, `dropTitle`). Kommentar in `ut-api.js` kennt `variantTitle` nicht, und das Event `ut:cart:updated` hat keine Quelle (`add` vs. `update`), obwohl der Drawer darauf reagieren soll. | Cart-Blueprint trennt JS-Felder und Liquid-Felder. `ut-api.js` liefert `{ cart, source }` im Event-Detail, Kommentar ergänzt. | behoben  |
| K6   | mittel  | Inventar                           | Inventar spiegelt die Drop-Logik nicht: Countdown nutzt jetzt `ut-api`, Stock Status wird Custom Element, Waitlist fehlt. Spec-Datei `cart.md` kollidiert namentlich mit `blueprints/cart.md`. | Inventar angepasst. Spec heißt `cart-page.md`.                                                               | behoben  |
| K7   | mittel  | Inventar, ADR 0003, CLAUDE.md      | Section Rendering API wird in Variant Picker, Facets, Cart Drawer, Stock Status und Drop-Sections genutzt, ist aber nicht im Adapter vorgesehen (Migrations-Risiko R8). | Regel: Section Rendering nur über `ut-api.js` (`sections.render(id)`). Spalte „Nutzt ut-api“ angepasst. CLAUDE.md Regel 3 ergänzt. | behoben  |
| K8   | mittel  | Blueprints, `data-model.md`        | Theme-Settings sind über fünf Dokumente verstreut (`low_stock_threshold`, `new_badge_days`, `pdp_shipping_returns_text`, `cart_discount_hint`, `price_*`, Drop-Settings). Es gibt keine Stelle, die sagt, was angelegt und was geplant ist. | Abschnitt „Theme-Settings-Registry“ in `data-model.md` mit Status.                                          | behoben  |
| K9   | mittel  | `blueprints/collection.md`         | Facets sind gegen Shopify-Filterobjekte beschrieben. Für den Port braucht es ein neutrales Format (Migrations-Risiko R2).      | Neutrales Facet-Format im Blueprint festgelegt.                                                              | behoben  |
| K10  | niedrig | `blueprints/drop.md`               | Zeitzonen-Zeile ist unklar formuliert (`shop.timezone? nicht in Liquid`). Der `date`-Filter rendert bereits in der Shop-Zeitzone. | Zeile korrigiert.                                                                                            | behoben  |
| K11  | niedrig | `blueprints/drop.md`               | Archiv-Zustand begründet sichtbare Preise mit „PAngV irrelevant, nicht kaufbar“. Das stimmt nicht, solange Produkte im Kanal sind (Testfall T5). | Begründung entfernt. Preise werden immer vollständig nach Price-Spec angezeigt.                              | behoben  |
| K12  | niedrig | `blueprints/drop.md`, `metafields.md` | `notify_tag` war als Muster-validiertes Pflichtfeld gedacht, die Logik-Spec leitet es aus dem Handle ab.                  | Optional, Default `drop-<handle>`.                                                                           | behoben  |
| K13  | niedrig | `blueprints/product.md`            | Stock-Status-Regel steht im Blueprint und widerspricht `stock_display` der Logik-Spec nicht, dupliziert sie aber.               | Blueprint verweist auf `logic/drop.md`, Abschnitt 3.                                                         | behoben  |
| K14  | niedrig | `metafields.md`                    | Admin-Checkliste pro Drop nennt weder `end_at` (Produkte aus Kanal nehmen) noch das neue Kollektions-Metafeld.                 | Checkliste ergänzt.                                                                                          | behoben  |
| K15  | niedrig | `CLAUDE.md`, `blueprints/README.md` | Neue Ordner `design/logic/`, `docs/reviews/` und `docs/migration.md` fehlen in der Struktur.                                | Ergänzt.                                                                                                     | behoben  |

## Offen (Entscheidung nötig, nicht in diesem Review gelöst)

| Nr. | Thema                                                                                   | Wann                  |
|-----|-----------------------------------------------------------------------------------------|-----------------------|
| O1  | ~~Token-Scope für `tone: inverse`~~ **Entschieden 2026-11-17:** Generator-Erweiterung `$scopes`, kein Handmapping (ADR 0001). | erledigt |
| O2  | Versand der Warteliste-Benachrichtigungen (Flow + Shopify Email, Klaviyo, manuell). Hängt an den Prüfpunkten V1 und V2 in `logic/drop.md`. | vor erstem Drop     |
| O3  | Serverseitiges Kauflimit per Shopify Function (Cart Validation).                         | vor erstem limitierten Drop |
| O4  | Checkout-Strategie im Port (Medusa-Checkout vs. externer Checkout), größter Aufwandsposten in `migration.md`. | vor Port-Start      |
| O5  | Fußnoten-Text für Listen (K1): Wortlaut und Platz im Footer. **Umgesetzt Phase B** in `components/footer.md` (Keys `products.price.footnote_*`, je nach `price_tax_mode`), Wortlaut **[RECHT-PRÜFEN]**. | Phase B (Footer), Prüfung vor Launch |

## Abgleich ohne Befund

- Jeder `.ut-*`-Block und jedes `<ut-*>`-Element aus Blueprints und `logic/drop.md` steht im Inventar (maschinell geprüft, nach Korrektur eines erfundenen `<ut-form>` in der neuen Logik-Spec).
- Jedes Metafeld in Blueprints und Datenmodell steht in der Registry und umgekehrt.
- Medusa-Ziele in Datenmodell, Registry und `migration.md` stimmen überein (`product_category` für Kollektionen, Module `drop`, `size_guide`, `waitlist_entry`).
- Locale-Keys der Price-Spec existieren in `locales/de.json` und `locales/en.default.json`.
- `shopify theme check`: keine Befunde.
