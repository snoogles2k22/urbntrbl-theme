# Migrations-Mapping: Liquid → Next.js (React) + Medusa v2

Stand: 2026-11-17 · Grundlage: `design/components/README.md`, `design/blueprints/`, `design/logic/drop.md`
Prinzipien und 1:1-Artefakte: `docs/portability.md`. Dieses Dokument ist der
detaillierte Plan pro Komponente und Seite.

## Lesart

- **Ziel**: `RSC` = React Server Component, `Client` = Client Component (`'use client'`),
  `CSS` = nur Markup + CSS, kein eigenes Verhalten.
- **Bleibt**: was unverändert übernommen wird.
- **Neu**: was neu geschrieben oder ersetzt werden muss.
- **Risiko**: `niedrig` (mechanische Übersetzung), `mittel` (Verhalten oder Daten
  ändern sich), `hoch` (Plattformfunktion fehlt in Medusa oder ist anders).
- **Aufwand** in Personentagen (PT) für eine erfahrene Person, die den Code kennt.
  Inklusive Tests, ohne Abstimmung. Schätzungen sind grob; die Spanne ist ernst gemeint.

Für alle Komponenten gilt: CSS-Datei, Tokens, BEM-Klassen, Locale-Keys und die Spec
bleiben. Das wird in den Tabellen nicht wiederholt.

---

## 1. Komponenten

### Primitive

| Komponente     | Ziel   | Neu                                                      | Risiko  | PT       |
|----------------|--------|----------------------------------------------------------|---------|----------|
| Button         | RSC    | Props statt Snippet-Parameter; `<Link>` für Link-Variante | niedrig | 0,25     |
| Icon           | RSC    | SVG-Sprite oder Inline-Komponenten                        | niedrig | 0,25     |
| Image          | RSC    | `next/image`; `srcset` aus `image_url` entfällt; Loader für Medusa-File-URLs | mittel | 0,5–1 |
| Badge          | RSC    | Ableitungslogik (sold_out > sale > badge) als Funktion    | niedrig | 0,25     |
| Price          | RSC    | `money` → `Intl.NumberFormat`; Grundpreis aus `metadata`; Steuer-Modus aus Config | mittel | 0,5–1 |
| Rich Text      | RSC    | Shopify-Rich-Text-JSON (Metafelder) → HTML-Renderer       | mittel  | 0,5      |
| Form Field     | RSC    | –                                                         | niedrig | 0,25     |
| Section Header | RSC    | –                                                         | niedrig | 0,25     |
| Empty State    | RSC    | –                                                         | niedrig | 0,25     |
| Stock Status   | Client | Bestand live aus Medusa statt Section Re-Render           | mittel  | 0,5      |

### Zusammengesetzt

| Komponente        | Ziel   | Neu                                                                 | Risiko  | PT     |
|-------------------|--------|---------------------------------------------------------------------|---------|--------|
| Product Card      | RSC    | Daten aus Store-API-Mapping; Hover-Bild aus `images[1]`             | niedrig | 0,5    |
| Product Grid      | RSC    | –                                                                   | niedrig | 0,25   |
| Teaser Card/Grid  | RSC    | Daten aus `drop_teaser_item`                                        | niedrig | 0,25   |
| Drop Card         | RSC    | Status-Funktion (TS)                                                | niedrig | 0,5    |
| Collection Header | RSC    | `product_category.metadata`                                         | niedrig | 0,25   |
| Hero              | RSC    | Inhalte aus CMS statt Section-Settings; Video-Handling              | mittel  | 1      |
| Split             | RSC    | CMS                                                                 | niedrig | 0,25   |
| Lookbook          | RSC    | –                                                                   | niedrig | 0,5    |
| Ticker            | CSS    | –                                                                   | niedrig | 0,25   |
| Accordion         | CSS    | `<details>` bleibt                                                  | niedrig | 0,25   |
| Pagination        | RSC    | `limit`/`offset` statt Liquid-`paginate`; URL-Schema `?page=` halten | niedrig | 0,5   |
| Newsletter        | Client | Shopify `customer_form` → eigener Endpunkt + Newsletter-Anbieter    | mittel  | 1      |
| Waitlist          | Client | Kunden-Tags → Modul `waitlist_entry` + Double-Opt-in-Flow           | hoch    | 2–3    |
| Buy Box           | RSC    | Layout-Hülle um Product Form                                        | niedrig | 0,5    |
| Cart (Seite)      | RSC    | –                                                                   | niedrig | 0,5    |
| Cart Line         | Client | Daten aus Medusa `line_items`                                       | niedrig | 0,5    |
| Cart Summary      | RSC    | Rabattcode-Slot aktivieren (Medusa kann Codes im Cart)              | mittel  | 1      |
| Announcement Bar  | RSC    | CMS                                                                 | niedrig | 0,25   |
| Footer            | RSC    | Menüs aus CMS/Config statt `linklists`                              | niedrig | 0,5    |

### Interaktiv

| Komponente      | Ziel   | Bleibt aus dem Custom Element           | Neu                                                              | Risiko  | PT    |
|-----------------|--------|-----------------------------------------|------------------------------------------------------------------|---------|-------|
| Header          | Client | Scroll-/Sticky-Logik                    | Menü aus CMS                                                     | niedrig | 1     |
| Drawer          | Client | Focus Trap, `inert`, Escape             | als Hook `useDrawer`, oder `<dialog>`                             | niedrig | 0,5–1 |
| Cart Count      | Client | Event-Logik                             | Cart-Context statt Window-Event                                  | niedrig | 0,25  |
| Cart Drawer     | Client | Zustände, A11y                          | Rendert aus Cart-Context statt Section Rendering; Optimistic Updates | mittel | 2–3 |
| Dialog          | Client | `<dialog>`-Nutzung                      | –                                                                | niedrig | 0,25  |
| Gallery         | Client | Tastatur, Thumbnails                    | `next/image`, ggf. Zoom-Bibliothek neu bewerten (ADR 0007)        | mittel  | 1–2   |
| Variant Picker  | Client | Options-Matrix-Logik                    | lokaler State statt Section Rendering; URL `?variant=` halten     | mittel  | 1,5–2 |
| Quantity Input  | Client | Min/Max/Debounce                        | –                                                                | niedrig | 0,25  |
| Product Form    | Client | Ablauf Add → Drawer                     | `ut-api` → Medusa-Adapter (`lib/api.ts`)                          | mittel  | 1–1,5 |
| Carousel        | Client | Scroll-Snap-Logik                       | –                                                                | niedrig | 0,5   |
| Facets          | Client | UI, URL-Sync                            | Facet-Daten aus Suchindex (Medusa hat keine Storefront-Facets)    | hoch    | 2–3 (+ Suche, siehe 3) |
| Countdown       | Client | komplette Logik                          | `clock.now()` aus Medusa-`Date`-Header                            | niedrig | 0,25  |
| Sticky Bar      | Client | IntersectionObserver                    | –                                                                | niedrig | 0,25  |

### Snippets und Logik

| Snippet / Logik                  | Ziel                       | Risiko  | PT   |
|----------------------------------|----------------------------|---------|------|
| `drop-status.liquid`             | `lib/drop-status.ts` + Tests T1–T8 | niedrig | 0,5 |
| `current-drop.liquid`            | Query im Drop-Modul        | niedrig | 0,25 |
| `structured-data-product.liquid` | JSON-LD in `generateMetadata` | niedrig | 0,5 |
| `metafield-*.liquid`             | Mapper `lib/mappers/product.ts` | niedrig | 0,5 |
| `ut-api.js`                      | `lib/api.ts` (Medusa JS SDK), gleiches Interface | mittel | 1–2 |

**Summe Komponenten und Snippets: ca. 28–36 PT.**

---

## 2. Seiten

| Seite        | Route (bleibt)            | Ziel                                             | Datenquelle Medusa                                  | Hauptrisiko                                                            | Risiko | PT (ohne Komponenten) |
|--------------|---------------------------|--------------------------------------------------|-----------------------------------------------------|------------------------------------------------------------------------|--------|------|
| Home         | `/`                       | RSC, ISR (Revalidate 60 s)                       | CMS-Dokument `home`, Drop-Modul, Kategorien         | Editor-Erlebnis: Merchant verliert Shopify-Theme-Editor                 | mittel | 1–2  |
| Collection   | `/collections/<handle>`   | RSC + Client-Facets, dynamisch bei Filtern       | `product_category`, Suchindex                       | Filter/Sortierung ohne Shopify Search & Discovery                       | hoch   | 2–3  |
| PDP          | `/products/<handle>`      | RSC, ISR; Product Form Client                    | `product`, `variant`, Inventory, `size_guide`, Drop | Bestand und Preise je Region; Variantenbilder                          | mittel | 2–3  |
| Drop         | `/drops/<handle>`         | RSC, kurze Revalidate (10 s) um `launch_at`      | Modul `drop`, `drop_teaser_item`, Kategorie         | Sichtbarkeit vor Launch muss das Backend erzwingen (heute Shopify)     | hoch   | 2–3  |
| Drop-Index   | `/pages/drops` → Redirect `/drops` | RSC                                     | Modul `drop`                                        | URL-Änderung → Redirect                                                | niedrig| 0,5  |
| Cart         | `/cart`                   | Client (Cart-Context), Seite RSC-Hülle            | Medusa Cart, Cart-ID im Cookie                      | Cart-Persistenz, Merge bei Login                                       | mittel | 1–2  |

**Summe Seiten: ca. 8–14 PT.**

URL-Schema `/collections/` und `/products/` wird bewusst beibehalten (SEO, Links aus
Social und Newsletter). Nur `/pages/drops` bekommt einen 301 auf `/drops`.

---

## 3. Plattform-Arbeit außerhalb des Themes

Das ist der größere Teil des Ports. Im Shopify-Theme liefert Shopify diese Dinge mit.

| Bereich                       | Heute (Shopify)                         | Medusa / Next.js                                                    | Risiko | PT     |
|-------------------------------|-----------------------------------------|---------------------------------------------------------------------|--------|--------|
| Checkout                      | Shopify-Checkout                        | eigener Checkout (Adresse, Versand, Zahlung, Bestätigung)           | hoch   | 8–15   |
| Zahlungen                     | Shopify Payments, PayPal, Klarna        | Payment-Provider-Module (Stripe; PayPal und Klarna separat prüfen)  | hoch   | 3–6    |
| Steuer                        | Kleinunternehmer-Einstellung            | Region ohne Steuer, Rechnungstext § 19 UStG                         | mittel | 0,5–1  |
| Transaktions-E-Mails          | Shopify-Benachrichtigungen              | Notification-Modul + Templates (Bestellung, Versand, Konto)         | mittel | 3–5    |
| Rechnungen                    | Shopify / App                           | Rechnungserzeugung mit § 19-Hinweis                                 | mittel | 2–3    |
| Kundenkonto                   | Shopify Customer Accounts               | Login, Registrierung, Bestellhistorie, Passwort-Reset               | mittel | 4–6    |
| Suche und Facets              | Search & Discovery                      | Meilisearch (oder Algolia) + Sync-Subscriber                        | hoch   | 5–8    |
| CMS für Seiteninhalte         | Theme-Editor, Section-Settings          | Headless CMS oder JSON-Configs; Keys aus Section-Schemas            | mittel | 3–5    |
| Drop-Modul                    | Metaobjekt + geplante Veröffentlichung  | Medusa-Modul `drop`, Admin-Widget, Sichtbarkeitsfilter              | hoch   | 3–5    |
| Warteliste und Versand        | Kunden-Tags + Flow/Klaviyo              | Modul `waitlist_entry`, Subscriber auf Inventory-Event              | hoch   | 2–4    |
| Size Guide                    | Metaobjekt                              | Modul `size_guide` + Admin-Widget                                   | niedrig| 1      |
| Datenmigration Produkte       | –                                       | Export Produkte, Varianten, Bilder, Metafelder → Medusa-Import       | mittel | 3–5    |
| Datenmigration Kunden         | –                                       | Kunden, Adressen, Marketing-Consent. Passwörter sind **nicht** migrierbar | hoch | 2–3 |
| Bestellhistorie               | –                                       | Import alter Bestellungen (nur lesend) oder Verzicht                | mittel | 2–4    |
| Redirects                     | Shopify URL-Redirects                   | Next.js `redirects` / Middleware                                    | niedrig| 0,5–1  |
| Rechtliches und Consent       | Shopify Privacy-API, Cookie-Banner-App  | Consent-Management, Tracking neu                                    | mittel | 1–2    |
| Hosting und Betrieb           | Shopify                                 | Medusa-Server, Postgres, Redis, Next.js-Hosting, Monitoring, Backups | mittel | 3–5   |

**Summe Plattform: ca. 46–79 PT.**

## 4. Gesamtbild

| Block                       | PT       |
|-----------------------------|----------|
| Komponenten und Snippets    | 28–36    |
| Seiten                      | 8–14     |
| Plattform                   | 46–79    |
| **Summe**                   | **82–129** |
| Puffer Abnahme, Bugs, Launch (20 %) | 16–26 |

Der Theme-Teil (Komponenten und Seiten) macht rund 40 % aus. Das ist das Ergebnis
der Architektur: CSS, Tokens, Specs und JS-Logik wandern mit. Der Rest ist
Plattform-Arbeit, die kein Theme-Design einsparen kann.

## 5. Top-Risiken

| Nr. | Risiko                                                      | Wirkung                                    | Gegenmaßnahme heute (im Shopify-Theme)                                  |
|-----|-------------------------------------------------------------|--------------------------------------------|--------------------------------------------------------------------------|
| R1  | Checkout und Zahlungen selbst bauen                          | größter Aufwand, Umsatzrisiko              | nichts im Theme; früh entscheiden, ob Medusa-Checkout oder externer Checkout |
| R2  | Facets ohne Shopify Search & Discovery                       | Collection-Seite verliert Filter           | `<ut-facets>` nur gegen ein neutrales Facet-Format bauen (`{ id, label, values[{ value, label, count, active }] }`) |
| R3  | Drop-Sichtbarkeit vor Launch muss das Backend erzwingen      | Produkte vorzeitig kaufbar                 | Status-Logik rein halten und testen (T1–T8); Sichtbarkeit in `logic/drop.md` dokumentiert |
| R4  | Kunden-Passwörter nicht migrierbar                           | alle Kunden müssen Passwort neu setzen     | Kundenkonten im Shopify-Theme minimal halten; Login per E-Mail-Link im Port prüfen |
| R5  | Consent-Nachweise (Newsletter, Warteliste) gehen verloren    | Liste nach Port nicht nutzbar **[RECHT-PRÜFEN]**  | Double-Opt-in von Anfang an, Shopify-Consent-Felder exportierbar halten |
| R6  | Merchant verliert Theme-Editor                               | Inhalte nur noch über CMS oder Code        | Section-Settings jetzt schon schlank halten (ADR 0004)                    |
| R7  | Rich-Text-Metafelder sind Shopify-JSON                       | Renderer nötig, Formatierungsverlust       | Rich Text nur, wo nötig; sonst `single_line_text_field`                   |
| R8  | Section Rendering API steckt in mehreren Elementen           | mehr Umbau als geplant                     | Section-Rendering-Aufrufe nur über `ut-api.js` (`sections.render(id)`), nicht direkt im Element |

R2 und R8 werden als Regel in Phase A übernommen (CLAUDE.md, ADR 0003).

## 6. Reihenfolge für den Port (Vorschlag)

1. Plattform-Grundlage: Medusa, Regionen, Steuer, Produkte importieren, Drop- und Size-Guide-Modul.
2. Next.js-Grundgerüst mit Tokens, Base-CSS, Primitiven (Phase A 1:1).
3. PDP und Collection gegen echte Daten, Suche anbinden.
4. Cart und Checkout.
5. Drop-Seite, Warteliste, Home, CMS.
6. Kundenkonto, E-Mails, Rechnungen.
7. Datenmigration Kunden, Redirects, Parallelbetrieb, Umschalten.
