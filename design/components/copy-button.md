# Komponente: `copy-button`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-copy-button`                                 |
| CSS-Datei       | `assets/component-copy-button.css`                |
| Custom Element  | `<ut-copy-button>`                                |
| JS-Datei        | `assets/ut-copy-button.js`                        |
| Liquid          | `snippets/copy-button.liquid`                     |
| Port-Typ        | Client Component                                  |

## 1. Zweck

Kopiert einen vorgegebenen Text (Phase: Gutscheincode, `blueprints/gift-card.md`) in die
Zwischenablage und meldet das Ergebnis. Ist **kein** Ersatz für die Markierbarkeit
des Textes: Fehlt JS oder die Clipboard-API, bleibt der Button ausgeblendet und der
Text per `user-select: all` markierbar.

## 2. Anatomie (BEM)

```
<ut-copy-button class="ut-copy-button" value="…" target="<id>">
├── button.ut-button.ut-button--secondary.ut-copy-button__trigger   [hidden] bis JS aktiviert
│   └── .ut-button__label        „Code kopieren“
└── span.ut-copy-button__status  aria-live="polite", leer bis nach dem Kopieren
```

Alle Breakpoints gleich. Button und Status stehen in einer Zeile, Status bricht um.

## 3. Datenvertrag (plattformneutral)

| Feld           | Typ    | Pflicht | Quelle Shopify                       | Quelle Medusa             |
|----------------|--------|---------|--------------------------------------|---------------------------|
| `value`        | string | ja      | `gift_card.code` (roh, ohne Leerzeichen) | `gift_card.code`      |
| `label`        | string | ja      | Locale `gift_cards.issued.copy_code` | i18n                      |
| `copiedLabel`  | string | ja      | Locale `gift_cards.issued.copied`    | i18n                      |
| `target`       | id     | nein    | id des Elements mit dem sichtbaren Text | gleiches Konzept       |

`target` dient nur dem Fallback: Schlägt `writeText` fehl (Berechtigung, unsicherer
Kontext), wird der Inhalt dieses Elements markiert, damit Strg/Cmd+C genügt.

## 4. Einstellungen

n/a. Texte und Wert liefert die aufrufende Seite.

## 5. Zustände

| Zustand   | Auslöser                               | Darstellung                                                  |
|-----------|----------------------------------------|--------------------------------------------------------------|
| hidden    | JS fehlt oder `navigator.clipboard` fehlt | Button `[hidden]`, Status leer                            |
| idle      | JS aktiv                               | Button sichtbar (Secondary)                                  |
| copied    | `writeText` erfolgreich                | Status „Kopiert“ für 2 s (`data-state="copied"`), danach leer |
| failed    | `writeText` abgelehnt                  | Text im `target` markiert, kein Fehlertext                   |

## 6. Verwendete Tokens

- Über `.ut-button` (`button.md`): `--ut-size-control-md` (44 px), Radius, Schrift, Motion
- Hover rot: lokale Properties `--_bg-hover`, `--_fg-hover`, `--_border-hover` zeigen auf
  `--ut-color-action-primary-bg-hover` (rot, 4.90:1 mit offwhite) und `--ut-color-action-primary-text`
- `--ut-color-text-default` (Status, 17.17:1 auf bg.default), kein Grün
- `--ut-font-size-sm`, `--ut-font-weight-bold`
- `--ut-space-2`, `--ut-space-3`

## 7. Verhalten und JS

- `connectedCallback`: Existiert `navigator.clipboard?.writeText`, wird `hidden` vom
  Button entfernt. Sonst bleibt er ausgeblendet.
- Klick: `navigator.clipboard.writeText(value)`. Erfolg → `status.textContent = copiedLabel`,
  nach 2000 ms leeren. Mehrfachklick setzt den Timer neu.
- Ablehnung → Fallback über `target` (siehe 3), keine Meldung.
- Event `ut:copy-button:copied` (bubbling) mit `detail: { value }`.
- Nutzt `ut-api`: nein (Browser-API, keine Commerce-Plattform).
- Ohne JS: Button ausgeblendet (`hidden`), Fallback `user-select: all` am Text.

## 8. Accessibility

- Echter `<button type="button">`, Name = sichtbarer Text.
- Zielgröße mindestens 44 px (`size.control-md`).
- Status in `aria-live="polite"`, die Region existiert beim Laden leer.
- Hover und Fokus sichtbar (Fokusring global aus `base.css`); Hover-Farbe rot erreicht 4.90:1.
- Print: komplette Komponente ausgeblendet.

## 9. Texte (Locale-Keys)

| Key                          | DE            | EN         |
|------------------------------|---------------|------------|
| `gift_cards.issued.copy_code`| Code kopieren | Copy code  |
| `gift_cards.issued.copied`   | Kopiert       | Copied     |

## 10. Port-Hinweise (Next.js + Medusa)

- Client Component `<CopyButton value label copiedLabel />` mit `useState` für `copied`.
  `navigator.clipboard` ist dort identisch; Prüfung auf Verfügbarkeit im `useEffect`.
- Liquid-spezifisch: `gift_card.code` (roh) vs. `format_code` (Anzeige) ersetzen.
- CSS 1:1.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [ ] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün
- [ ] Tastatur + Screenreader geprüft
- [x] Metafelder: keine
