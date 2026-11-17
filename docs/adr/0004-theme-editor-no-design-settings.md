# ADR 0004: Theme-Editor ohne Design-Settings

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

`config/settings_schema.json` und Section-Schemas enthalten nur Inhalt und Verhalten:
Texte, Bilder, Links, Ein/Aus, Anzahl, rechtliche Modi (z. B. Steuerhinweis). Keine
`color`-, `font_picker`-, `range`-Settings für Abstände oder ähnliche Design-Werte.

## Begründung

- Zwei Wahrheiten (Tokens und Theme-Editor) würden beim Port beide nachgebaut werden
  müssen. Eine Wahrheit (Tokens) ist eine Datei.
- Shopifys `font_picker` liefert Fonts über Shopifys CDN mit eigener `@font-face`-
  Logik, die es in Next.js nicht gibt. Selbst gehostete Fonts in `assets/fonts/` gehen
  mit.
- Die Marke wird vom Team definiert, nicht pro Section im Editor nachjustiert.

## Konsequenzen

- Händler-Wunsch „Farbe mal eben ändern“ = Token-Commit. Das ist gewollt.
- Sections dürfen Varianten anbieten (`select: default | inverse`), die auf Token-Scopes
  zeigen, aber keine freien Werte.
- Ein Hinweistext im Editor (`settings_schema.general.tokens_notice`) erklärt das.
