# Blueprint: Gutschein-Seite

Template: `templates/gift_card.liquid` · Route: `/gift_cards/<token>` (Link aus der Shopify-Gutschein-E-Mail)

## Zweck

Zeigt einem Empfänger seinen Gutschein: Wert, Restguthaben, Code, Ablaufdatum, Link
zum Shop und optional Apple Wallet. Shopify verlangt das Template; ohne eigenes
Template fällt der Shop auf eine Standardseite zurück, die nicht dem Design folgt.

Die Seite rendert mit `{% layout none %}`, also ohne Header, Footer und Cart Drawer.
Sie lädt nur `tokens.css`, `base.css` und die benötigten Komponenten-CSS.

## Layout

```
┌──────────────────────────────┐
│ Shop-Name / Logo             │
│ h1 „Dein Gutschein über 50 €“│
│ .ut-badge (abgelaufen/inaktiv)│
│ Restguthaben (wenn ≠ Wert)   │
│ Code (groß, markierbar)      │
│ gültig bis …                 │
│ [Jetzt einkaufen]            │
│ Apple Wallet (wenn vorhanden)│
└──────────────────────────────┘
```

## Komponenten

`.ut-gift-card` (Seiten-Block, eigene CSS-Datei `component-gift-card.css`), `.ut-button`,
`.ut-badge`, `.ut-icon` nicht nötig.

## Datenbedarf

| Feld                     | Quelle Shopify                 |
|--------------------------|--------------------------------|
| Anfangswert              | `gift_card.initial_value`      |
| Restguthaben             | `gift_card.balance`            |
| Code                     | `gift_card.code \| format_code` |
| Ablaufdatum              | `gift_card.expires_on`         |
| abgelaufen / deaktiviert | `gift_card.expired`, `gift_card.enabled` |
| Apple Wallet             | `gift_card.pass_url`           |
| Logo                     | Theme-Setting `logo`           |

Keine Metafelder.

## Zustände

| Zustand      | Bedingung                 | Darstellung                                  |
|--------------|---------------------------|----------------------------------------------|
| aktiv        | `enabled` und nicht `expired` | Code und CTA                             |
| teilweise eingelöst | `balance != initial_value` | Restguthaben zusätzlich                 |
| abgelaufen   | `expired`                 | Badge „Abgelaufen“, Code bleibt sichtbar     |
| deaktiviert  | nicht `enabled`           | Badge „Deaktiviert“                          |

## Bewusst nicht in v1

- **QR-Code** für Einlösung im Ladengeschäft: Es gibt kein Ladengeschäft mit POS. Shopifys
  QR-Skript würde ein externes Skript nachladen.
- **Kopieren-Button:** bräuchte ein Custom Element. Der Code ist per `user-select: all`
  mit einem Klick markierbar.
- **Drucken-Button:** Browser-Druck genügt; Print-CSS blendet den CTA aus.

## Accessibility und SEO

- `noindex`, weil die URL einen persönlichen Token enthält.
- Code in `<code>` mit Abstand-Formatierung aus `format_code`; Screenreader lesen ihn zeichenweise.

## Port-Hinweise

- Medusa hat Gift Cards als Modul; die Seite wird eine Route `/gift-cards/[code]`.
  Die Shopify-URL `/gift_cards/<token>` lebt nur in alten E-Mails weiter, Redirect nicht möglich (Token fremd).
