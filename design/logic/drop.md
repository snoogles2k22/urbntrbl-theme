# Logik-Spec: Drops

Status: Spec (kein Code) · Datum: 2026-11-17
Bezug: `design/blueprints/drop.md` (Seite), `docs/adr/0008` (Metaobjekt), `docs/metafields.md`, `docs/data-model.md`

Diese Spec beschreibt das **Verhalten** rund um Drops, unabhängig von Seiten und
Komponenten: Status, Countdown, Restmenge, Ausverkauf, Warteliste. Seiten-Layouts
stehen im Blueprint, Darstellung in den Komponenten-Specs. Jede Regel hier gilt in
Liquid und im späteren Medusa-Port identisch.

Rechtliche Hinweise in dieser Spec sind Umsetzungsannahmen, keine Rechtsberatung.
Punkte mit **[RECHT-PRÜFEN]** vor Launch prüfen lassen.

---

## 1. Status-Maschine

Vier Zustände. `sold_out` ist neu gegenüber dem ersten Blueprint-Stand.

```
             launch_at erreicht              alle Lineup-Produkte nicht verfügbar
 upcoming ─────────────────────▶ live ─────────────────────────────▶ sold_out
                                  ▲  │                                   │
                                  │  │ end_at erreicht                    │ end_at erreicht
                                  │  ▼                                   │ oder archive_when_sold_out
                                  │ archived ◀────────────────────────────┘
                                  │
                                  └──── Restock (Produkt wieder verfügbar, vor end_at)
```

### Berechnung (Snippet `drop-status.liquid`, später `lib/drop-status.ts`)

```
input: drop, now, lineup_available (bool: mind. ein Lineup-Produkt verfügbar)

if drop.status_override != "auto":          return drop.status_override
if now < drop.launch_at:                    return "upcoming"
if drop.end_at and now >= drop.end_at:      return "archived"
if not lineup_available:
    return drop.archive_when_sold_out ? "archived" : "sold_out"
return "live"
```

- `lineup_available` wird über `drop.collection.products` ermittelt (erste 50 Produkte,
  Abbruch beim ersten verfügbaren). Drops mit mehr als 50 Produkten sind nicht vorgesehen.
- `sold_out` ist **abgeleitet** und damit umkehrbar: Kommt Bestand zurück (Retoure,
  Nachlieferung), wird der Drop wieder `live`, sofern `end_at` nicht erreicht ist.
- `archived` ist endgültig, solange niemand `end_at` oder den Override ändert.
- Override `sold_out` ist erlaubt, z. B. um einen Drop trotz Restbestand zu schließen.
  Dann muss der Merchant die Produkte auch aus dem Online-Store-Kanal nehmen, sonst
  sind sie auf der PDP weiter kaufbar. Die Admin-Checkliste in `metafields.md` nennt das.

### Wer was durchsetzt

| Regel                          | Durchgesetzt von                                    | Theme zeigt nur an |
|--------------------------------|-----------------------------------------------------|--------------------|
| Nicht kaufbar vor Launch       | Shopify: geplante Veröffentlichung im Online Store  | ja                 |
| Nicht kaufbar bei Ausverkauf   | Shopify: `inventory_policy = deny`                  | ja                 |
| Nicht kaufbar nach `end_at`    | Merchant: Produkte aus Kanal nehmen (manuell)       | ja                 |
| Kauflimit pro Bestellung       | Theme (clientseitig), später Shopify Function       | teilweise          |

Das Theme erzwingt nie Kaufbarkeit. Ein Status, den das Theme falsch berechnet,
führt höchstens zu falscher Anzeige, nie zu einem Verkauf, der nicht sein darf.

### Events

| Event                   | Detail                         | Ausgelöst von                      |
|-------------------------|--------------------------------|------------------------------------|
| `ut:countdown:end`      | `{ target: ISO-String }`       | `<ut-countdown>` bei 0             |
| `ut:drop:status`        | `{ handle, status }`           | Drop-Sections nach Re-Render, wenn Status sich ändert |
| `ut:waitlist:submitted` | `{ kind: 'drop' \| 'restock', ref }` | Warteliste-Formular nach Erfolg |

---

## 2. Countdown

### Eingaben

- `launch_at` (UTC) aus dem Metaobjekt, als ISO-String in `<time datetime="…">`.
- Gerendert wird immer zuerst die **absolute** Zeit in Shop-Zeitzone, z. B.
  „Start: Sa., 22.11.2026, 18:00 Uhr“. Der Liquid-`date`-Filter rendert in der
  Zeitzone des Shops. Das ist die No-JS-Variante und bleibt auch mit JS sichtbar.
- `<ut-countdown>` ergänzt die relative Restzeit.

### Uhrzeit-Quelle

Die Client-Uhr kann falsch gehen, die Render-Zeit der Seite kann durch Caching
Minuten alt sein. Darum:

1. Beim ersten Countdown auf der Seite holt `ut-api` einmal die Serverzeit aus dem
   `Date`-Header einer leichten Anfrage (`HEAD` auf die Shop-Root-URL) und speichert
   den Offset zur Client-Uhr.
2. Alle Countdowns rechnen mit `Date.now() + offset`.
3. Schlägt die Anfrage fehl, gilt Offset 0 (Client-Uhr).

Neue Adapter-Methode in `assets/ut-api.js` (in der Phase, in der Countdown gebaut wird):

```
clock.now()  -> Promise<number>   // ms seit Epoch, serverkorrigiert, gecacht pro Seite
```

Medusa-Port: gleiche Methode, `Date`-Header von jeder Store-API-Antwort.

### Anzeige

| Restzeit       | Format (DE)                    | Aktualisierung |
|----------------|--------------------------------|----------------|
| > 48 h         | „3 Tage 4 Std.“                | pro Minute     |
| 1 h bis 48 h   | „27:04:12“ (Std:Min:Sek)       | pro Sekunde    |
| < 1 h          | „04:12“ (Min:Sek)              | pro Sekunde    |
| ≤ 0            | „Gleich geht's los“            | –              |

- Ein gemeinsamer Takt für alle Countdowns auf der Seite (statischer Timer in der Klasse).
- Bei `visibilitychange` auf hidden pausieren, bei visible sofort neu berechnen.
- Keine Flip- oder Zähl-Animation. Bei `prefers-reduced-motion` ohnehin nicht.
- `role="timer"`, `aria-live="off"`. Ein visuell versteckter Text wiederholt die
  absolute Startzeit. Screenreader bekommen keine Sekundenansagen.
- Kompaktvariante (`compact`-Attribut) für Drop Cards: nur „in 3 Tagen“ / „in 4 Std.“
  / „gleich“, Aktualisierung pro Minute.

### Ablauf bei 0

1. `<ut-countdown>` setzt `[data-state="ended"]` und feuert `ut:countdown:end`.
2. Die Drop-Sections (Hero, Lineup) hören darauf und laden sich per Section Rendering
   API neu (`?section_id=…&_ut=<timestamp>` gegen Cache). Der **erste** Versuch startet
   nicht bei 0, sondern nach einem zufälligen Versatz von 0 bis 5 Sekunden.
3. Ist der Status im neuen Markup (`data-drop-status`) noch `upcoming`, folgen weitere
   Versuche. Jeder Versuch wartet eine Basiszeit plus zufälligen Versatz (Jitter):

   | Versuch | Basis | Versatz (gleichverteilt) | Fenster      |
   |---------|-------|--------------------------|--------------|
   | 1       | 0 s   | 0 bis 5 s                | 0 bis 5 s    |
   | 2       | 5 s   | 0 bis 5 s                | 5 bis 10 s   |
   | 3       | 10 s  | 0 bis 10 s               | 10 bis 20 s  |
   | 4       | 20 s  | 0 bis 10 s               | 20 bis 30 s  |
   | 5       | 30 s  | 0 bis 15 s               | 30 bis 45 s  |
   | 6       | 60 s  | 0 bis 30 s               | 60 bis 90 s  |

   Die Zeiten gelten jeweils ab dem vorherigen Versuch. Der Versatz wird pro Versuch
   neu gezogen (`Math.random()`). Zweck: Alle offenen Seiten erreichen 0 zur selben
   Sekunde. Ohne Versatz träfen sie Shopify gleichzeitig und wiederholt im Gleichtakt
   (Thundering Herd). Mehrere Sections derselben Seite laden in **einer** Anfrage
   (`?sections=a,b`), damit eine Seite nicht mehrere Anfragen pro Versuch erzeugt.
4. Nach dem letzten Versuch erscheint ein Link „Seite neu laden“.
5. Wechselt der Status, wird das neue Markup eingesetzt und `ut:drop:status` gefeuert.
   Der Fokus bleibt, wo er war. Eine `aria-live="polite"`-Region meldet „Der Drop ist live“.
6. Ist der Tab bei 0 im Hintergrund, beginnen die Versuche erst bei `visibilitychange`
   auf sichtbar, wieder mit Versuch 1 und dessen Versatz.

Die Basiszeiten und Versatzgrenzen sind Konstanten im Element, keine Settings. Ändern
sie sich nach den Messungen zu Prüfpunkt V3, wird diese Tabelle angepasst.

Warum nicht sofort kaufbar zeigen, sobald die Uhr 0 zeigt: Shopify veröffentlicht
geplante Produkte mit Verzögerung, und der Seiten-Cache braucht ebenfalls. Das Theme
zeigt das Lineup erst, wenn Shopify es wirklich ausliefert. Sonst würden Kunden auf
Produkte klicken, die noch 404 liefern.

---

## 3. Restmenge

### Quelle

- `variant.inventory_quantity` in Liquid, zum Render-Zeitpunkt.
- Nur aussagekräftig, wenn die Variante Bestand trackt und `inventory_policy = deny`.
  Sonst wird keine Restmenge angezeigt.
- `/products/<handle>.js` liefert keine Bestandszahlen. Aktualisierung geht nur über
  Section Rendering.

### Anzeigemodi (Feld `stock_display` am Drop, Default `low_only`)

| Modus      | Anzeige                                 | Voraussetzung                       |
|------------|-----------------------------------------|-------------------------------------|
| `hidden`   | nichts außer „Ausverkauft“              | –                                   |
| `low_only` | „Nur noch wenige“ ab ≤ Schwellwert      | Theme-Setting `low_stock_threshold` (Default 3) |
| `exact`    | „Noch 7 verfügbar“ ab ≤ Schwellwert, darüber nichts | –                        |
| `edition`  | „7 von 50 verfügbar“, immer             | Produkt-Metafeld `edition_size`     |

Für Produkte außerhalb eines Drops gilt immer `low_only`.

Ebene: Die Restmenge bezieht sich auf die **gewählte Variante** (PDP) bzw. die Summe
aller Varianten (Product Card, nur `low_only` und `edition`). Bei `edition` summiert die
Card alle Varianten und vergleicht mit `edition_size`.

**[RECHT-PRÜFEN]** Angezeigte Zahlen müssen echte Bestände sein. Keine künstliche Verknappung,
keine Mindest- oder Fake-Werte (UWG § 5, Irreführung). `edition_size` darf nur gesetzt
werden, wenn die Auflage wirklich begrenzt ist und nicht nachproduziert wird.

### Aktualität

- Die Restmenge ist so alt wie die gerenderte Seite.
- Auf der PDP wird `.ut-stock-status` neu gerendert bei: Variantenwechsel (ohnehin per
  Section Rendering), Fehler beim Add-to-Cart, und Rückkehr in den Tab nach mehr als
  60 Sekunden.
- Kein Dauer-Polling in v1. Bei einem Drop mit viel Traffic würde Polling jeder offenen
  Seite Last erzeugen, ohne Kaufbarkeit zu garantieren.
- Damit wird Stock Status ein kleines Custom Element `<ut-stock-status>` (Inventar angepasst).

---

## 4. Ausverkauf

### Ebenen

| Ebene    | Bedingung                                  | Darstellung                                                                        |
|----------|--------------------------------------------|------------------------------------------------------------------------------------|
| Variante | `variant.available == false`               | Option im Picker durchgestrichen und `aria-disabled`, Button „Ausverkauft“ disabled, Warteliste-CTA (wenn aktiv) |
| Produkt  | `product.available == false`               | Card: Badge „Ausverkauft“, Preis bleibt sichtbar. PDP: wie Variante, Badge         |
| Drop     | Status `sold_out`                          | Hero-Badge „Ausverkauft“, Lineup bleibt sichtbar, Warteliste „Restock-Info“ (wenn aktiv) |

Ausverkaufte Produkte bleiben im Lineup und in Kollektionen sichtbar, sortiert ans Ende
(Shopify-Einstellung „Ausverkaufte Produkte ans Ende“ in Search & Discovery, sonst
Theme-seitig nicht sortierbar). Sie werden nicht ausgeblendet, weil der Drop sonst leer
wirkt und Wartelisten-Anmeldungen verloren gehen.

### Wettlauf beim Kauf

Shopify reserviert keine Artikel im Warenkorb. Bestand sinkt erst beim Checkout-Abschluss.

| Situation                                           | Verhalten                                                                 |
|-----------------------------------------------------|---------------------------------------------------------------------------|
| Add-to-Cart auf veralteter Seite, Variante leer     | Shopify antwortet 422 mit Text. Inline-Fehler am Button (`aria-live`), Stock Status und Picker neu rendern |
| Menge im Cart > Restbestand                         | Shopify kappt oder lehnt ab. Cart-Line zeigt Fehler, Menge springt auf gültigen Wert |
| Artikel im Cart, im Checkout ausverkauft            | Shopify-Checkout zeigt Meldung. Cart Drawer lädt bei jedem Öffnen neu     |
| Hinweis während Live-Drop                            | Optional (Theme-Setting `drop_cart_hint`): „Artikel im Warenkorb sind nicht reserviert.“ im Cart Drawer |

Bot-Schutz und Warteschlange (Checkout Queue) sind Shopify-Plus-Funktionen und nicht
Teil des Themes.

---

## 5. Warteliste

Zwei Arten, ein Mechanismus.

| Art          | Wann sichtbar                                  | Bezug        | Kunden-Tag                     |
|--------------|------------------------------------------------|--------------|--------------------------------|
| Drop-Notify  | Drop `upcoming`                                | Drop         | `drop-<handle>` oder `notify_tag` |
| Restock      | Variante ausverkauft, Drop nicht `archived`    | Variante     | `restock-<variant_id>`         |

Aktiviert über Feld `waitlist_mode` am Drop: `none`, `drop`, `restock`, `both` (Default).
Für Produkte außerhalb von Drops steuert Theme-Setting `restock_waitlist_enabled`
(Default aus).

### Mechanismus v1 (ohne App)

- Shopify-Formular `{% form 'customer' %}` mit `contact[email]` und `contact[tags]`
  (`newsletter, waitlist, <tag>`).
- Shopify legt den Kontakt mit Marketing-Einwilligung an. Double-Opt-in wird im Admin
  aktiviert (Einstellungen → Kundenkonten bzw. Marketing). **[RECHT-PRÜFEN]** Pflicht-Voraussetzung
  vor Go-Live.
- Einwilligungstext direkt am Formular, z. B. „Ich möchte per E-Mail benachrichtigt werden,
  wenn <Produkt/Drop> verfügbar ist. Abmeldung jederzeit möglich.“ plus Link zur
  Datenschutzerklärung. Text kommt aus `locales/`.
- Erfolgs- und Fehlermeldung inline mit `aria-live="polite"`, Formular bleibt ohne JS
  funktionsfähig (Shopify leitet mit `?customer_posted=true` zurück).
- Angemeldete Kunden: E-Mail vorbefüllt.

### Offene Prüfpunkte auf dem Dev-Shop

| Nr. | Frage                                                                                           | Warum wichtig                       |
|-----|-------------------------------------------------------------------------------------------------|-------------------------------------|
| V1  | Werden Tags bei einer **bereits existierenden** E-Mail ergänzt oder ignoriert?                  | Sonst gehen Restock-Anmeldungen bestehender Kunden verloren |
| V2  | Greift Double-Opt-in auch für das Customer-Formular mit Tags?                                  | Einwilligungsnachweis               |
| V3  | Wie schnell veröffentlicht Shopify geplante Produkte nach `launch_at`?                         | Retry-Zeiten im Countdown          |

Ergebnisse kommen in diese Spec. Fällt V1 negativ aus, braucht Restock ein Tool
(siehe unten), Drop-Notify kann bleiben.

### Versand der Benachrichtigung

Nicht im Theme. Das Theme sammelt nur Anmeldungen. Optionen für den Versand:

| Option                          | Art                   | Bemerkung                                           |
|---------------------------------|-----------------------|-----------------------------------------------------|
| Shopify Flow + Shopify Email    | Shopify-eigene Apps   | Trigger „Bestand > 0“ und Segment per Tag. Installation nach ADR 0007 |
| Klaviyo                         | Drittanbieter         | Back-in-Stock eingebaut, eigene Formulare, ersetzt dann v1 |
| Manuell                          | Kundensegment per Tag | für den ersten Drop ausreichend                     |

Entscheidung in einem eigenen ADR, sobald V1 und V2 geklärt sind.

### Medusa-Port

Tabelle `waitlist_entry`: `email`, `kind`, `drop_id` | `variant_id`, `consent_text`,
`consent_at`, `confirmed_at` (Double-Opt-in), `notified_at`. Bestehende Anmeldungen
werden aus den Shopify-Kunden-Tags migriert. Die Einwilligung muss dabei nachweisbar
mitwandern (`consent_at` aus Shopifys Marketing-Consent-Feldern).

---

## 6. Daten (Änderungen gegenüber dem bisherigen Stand)

### Metaobjekt `drop`

| Feld                    | Typ                       | Pflicht | Default    | Neu/geändert |
|-------------------------|---------------------------|---------|------------|--------------|
| `status_override`       | Choices `auto`, `upcoming`, `live`, `sold_out`, `archived` | ja | `auto` | geändert (+ `sold_out`) |
| `stock_display`         | Choices `hidden`, `low_only`, `exact`, `edition` | ja | `low_only` | neu |
| `waitlist_mode`         | Choices `none`, `drop`, `restock`, `both` | ja | `both` | neu |
| `archive_when_sold_out` | `boolean`                 | nein    | false      | neu          |
| `notify_tag`            | `single_line_text_field`  | nein    | leer = `drop-<handle>` | geändert (optional) |

### Produkt

| Feld           | Typ              | Bedeutung                                    | Neu |
|----------------|------------------|----------------------------------------------|-----|
| `edition_size` | `number_integer` | Gesamtauflage, nur bei echter Limitierung    | ja  |

### Theme-Settings (geplant)

| ID                         | Typ      | Default | Zweck                                    |
|----------------------------|----------|---------|------------------------------------------|
| `low_stock_threshold`      | range 1–10 | 3     | Schwellwert „Nur noch wenige“            |
| `restock_waitlist_enabled` | checkbox | false   | Restock-Warteliste außerhalb von Drops   |
| `drop_cart_hint`           | checkbox | true    | Hinweis „nicht reserviert“ im Cart Drawer während Live-Drop |

### Komponenten (Inventar)

- `<ut-countdown>` nutzt `ut-api` (`clock.now()`).
- `.ut-stock-status` wird `<ut-stock-status>` (Re-Render bei Tab-Rückkehr).
- Neu: `.ut-waitlist` (Shopify-Formular mit Redirect, kein eigenes Custom Element in v1). Seiten P D.

---

## 7. Texte (Locale-Keys)

| Key                                   | DE                                                      |
|---------------------------------------|---------------------------------------------------------|
| `drops.status.upcoming`               | Demnächst                                               |
| `drops.status.live`                   | Live                                                    |
| `drops.status.sold_out`               | Ausverkauft                                             |
| `drops.status.archived`               | Beendet                                                 |
| `drops.countdown.starts_at_html`      | Start: {{ date }}                                       |
| `drops.countdown.days_hours`          | {{ days }} Tage {{ hours }} Std.                        |
| `drops.countdown.ending`              | Gleich geht's los                                       |
| `drops.countdown.reload`              | Seite neu laden                                         |
| `drops.countdown.now_live`            | Der Drop ist live                                       |
| `products.stock.low`                  | Nur noch wenige                                         |
| `products.stock.exact`                | Noch {{ count }} verfügbar                              |
| `products.stock.edition`              | {{ count }} von {{ total }} verfügbar                   |
| `products.stock.sold_out`             | Ausverkauft                                             |
| `waitlist.drop.heading`               | Erinnere mich                                           |
| `waitlist.restock.heading`            | Benachrichtigen, wenn verfügbar                         |
| `waitlist.consent`                    | Ich möchte per E-Mail benachrichtigt werden, wenn {{ subject }} verfügbar ist. Abmeldung jederzeit möglich. |
| `waitlist.success`                    | Fast geschafft: Bitte bestätige deine Anmeldung in der E-Mail, die wir dir geschickt haben. |
| `waitlist.error`                      | Das hat nicht geklappt. Bitte prüfe deine E-Mail-Adresse. |
| `cart.drop_hint`                      | Artikel im Warenkorb sind nicht reserviert.             |

EN-Texte entstehen mit den Komponenten.

---

## 8. Testfälle

| Nr. | Ausgangslage                                                       | Erwartung                                              |
|-----|--------------------------------------------------------------------|--------------------------------------------------------|
| T1  | `launch_at` morgen, Override `auto`                                | `upcoming`, Countdown „1 Tag …“, Teaser, Notify-Form    |
| T2  | `launch_at` vor 1 Min., Produkte noch nicht veröffentlicht         | Countdown „Gleich geht's los“, Retries, danach live     |
| T3  | live, alle Varianten Bestand 0, `archive_when_sold_out` false      | `sold_out`, Lineup sichtbar, Restock-Form              |
| T4  | wie T3, dann Retoure einer Variante                                 | `live`                                                 |
| T5  | `end_at` erreicht, Produkte noch im Kanal                          | `archived`, Cards „Drop beendet“, PDP weiter kaufbar (Merchant-Fehler, Checkliste) |
| T6  | Override `sold_out` bei Restbestand                                 | `sold_out` angezeigt                                   |
| T7  | `stock_display = edition`, `edition_size` leer                     | Fallback `low_only`                                    |
| T8  | Variante `inventory_policy = continue`                             | keine Restmenge, nie „Ausverkauft“                     |
| T9  | Client-Uhr 10 Min. vor                                              | Countdown korrekt durch Server-Offset                  |
| T10 | JS aus                                                              | absolute Startzeit sichtbar, Formulare funktionieren   |
| T13 | 100 Tabs erreichen gleichzeitig 0 (simuliert, `Math.random` gestubbt) | Erste Anfragen verteilt über 0 bis 5 s, keine zwei Versuche desselben Tabs im Abstand unter der Basiszeit |
| T14 | Hero und Lineup auf derselben Seite                                 | eine Anfrage pro Versuch (`?sections=`), nicht zwei     |
| T15 | Tab bei 0 im Hintergrund, 2 Min. später sichtbar                    | Versuch 1 startet mit Versatz nach dem Sichtbarwerden   |
| T11 | Add-to-Cart auf veralteter PDP, Variante leer                      | Inline-Fehler, Stock Status aktualisiert               |
| T12 | Restock-Anmeldung mit existierender Kunden-E-Mail                  | siehe V1                                               |

## 9. Port-Hinweise

- Status-Funktion ist rein (Eingaben → Status) und wird 1:1 nach TypeScript übertragen,
  inklusive Testfälle T1 bis T8 als Unit-Tests.
- `lineup_available` kommt in Medusa aus einer Abfrage über die Varianten der Kategorie.
- Geplante Veröffentlichung gibt es in Medusa nicht: Produkte des Drops serverseitig
  ausfiltern, solange Status `upcoming` ist. Das ist dann echte Durchsetzung im Backend
  (heute macht es Shopify).
- Restmenge: Medusa liefert `inventory_quantity` je Variante live. Polling oder
  Server-Sent Events werden damit möglich, sind aber eine neue Entscheidung.
- Warteliste: eigenes Modul statt Kunden-Tags (Abschnitt 5).
