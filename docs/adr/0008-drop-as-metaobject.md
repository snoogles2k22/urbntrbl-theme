# ADR 0008: Drop als Metaobjekt mit eigener Seite

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Ein Drop ist ein Shopify-Metaobjekt `drop` mit eigener Web-Seite
(`/drops/<handle>`, Template `templates/metaobject/drop.json`). Das Lineup liegt in
einer referenzierten Kollektion. Produkte verweisen per Metafeld `urbntrbl.drop`
zurück auf ihren Drop. Kaufbarkeit vor Launch wird über Shopifys geplante
Veröffentlichung gesteuert, nicht vom Theme. Vorschau vor Launch läuft über
`teaser_items` (eigenes Metaobjekt), weil unveröffentlichte Produkte in Liquid
nicht lesbar sind.

## Alternativen

- **Kollektion mit Metafeldern** (`launch_at` an der Collection): einfacher, aber
  Drop-Seite und Lineup wären dasselbe Objekt, und Teaser-Inhalte vor Launch hätten
  keinen Platz. Zudem ist eine Collection ohne veröffentlichte Produkte leer und
  zeigt nichts.
- **Page mit Metafeldern**: keine Liste aller Drops abfragbar, kein typisiertes Modell.
- **App (Launchpad o. ä.)**: Dependency, Portabilität null, Scan nötig (ADR 0007).

## Begründung

- Metaobjekte sind typisiert, listbar (`shop.metaobjects.drop.values`), im Editor
  als dynamische Quelle wählbar und haben eigene URLs. Das deckt Drop-Seite,
  Drop-Übersicht, Hero-Automatik und PDP-Eyebrow ab.
- Beim Port wird das Metaobjekt ein Medusa-Modul mit denselben Feldern. Die
  Status-Logik ist eine Funktion, die in Liquid und TypeScript identisch ist.

## Konsequenzen

- Pro Drop drei Dinge im Admin anlegen: Kollektion, Metaobjekt, Publish-Datum der
  Produkte. Wird in `docs/metafields.md` als Checkliste dokumentiert.
- Produkt → Drop ist manuell gesetzt. Vergisst der Merchant es, fehlt nur der
  Eyebrow auf der PDP, nichts bricht.
- Maximal 50 Drops über `shop.metaobjects` ohne Pagination. Bei Überschreiten
  Archiv-Darstellung umbauen.
