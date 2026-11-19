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
Zwischenablage und meldet das Ergebnis, auch im Fehlerfall. Ist **kein** Ersatz für die
Markierbarkeit des Textes: Fehlt JS, bleibt der Button ausgeblendet und der Text per
`user-select: all` markierbar. Browser lehnen `navigator.clipboard.writeText` je nach
Kontext ab (Safari, Berechtigungen, eingebettete Seiten); deshalb gibt es eine
Fallback-Kette (Abschnitt 7), und der Nutzer bekommt in jedem Ausgang eine Rückmeldung.

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
| `failedLabel`  | string | ja      | Locale `gift_cards.issued.copy_failed` | i18n                    |
| `target`       | id     | nein    | id des Elements mit dem sichtbaren Text | gleiches Konzept       |

`target` dient dem Fallback: Schlägt `writeText` fehl, wird der Inhalt dieses Elements
markiert (Pfad 2 und 3 in Abschnitt 7). Ohne `target` gibt es keinen Fallback, nur den
Hinweis `failedLabel`.

## 4. Einstellungen

n/a. Texte und Wert liefert die aufrufende Seite.

## 5. Zustände

| Zustand   | Auslöser                               | Darstellung                                                  |
|-----------|----------------------------------------|--------------------------------------------------------------|
| hidden    | JS fehlt, oder weder `navigator.clipboard.writeText` noch `document.queryCommandSupported('copy')` verfügbar | Button `[hidden]`, Status leer |
| idle      | JS aktiv                               | Button sichtbar (Secondary)                                  |
| copied    | Pfad 1 oder Pfad 2 erfolgreich         | Status „Kopiert“ für 2000 ms (`data-state="copied"`), danach leer |
| failed    | Pfad 1 und Pfad 2 gescheitert          | Status `failedLabel` für 6000 ms (`data-state="failed"`), Auswahl im `target` bleibt bestehen |

## 6. Verwendete Tokens

- Über `.ut-button` (`button.md`): `--ut-size-control-md` (44 px), Radius, Schrift, Motion
- Hover rot: lokale Properties `--_bg-hover`, `--_fg-hover`, `--_border-hover` zeigen auf
  `--ut-color-action-primary-bg-hover` (rot, 4.90:1 mit offwhite) und `--ut-color-action-primary-text`
- `--ut-color-text-default` (Status, 17.17:1 auf bg.default), kein Grün
- `--ut-font-size-sm`, `--ut-font-weight-bold`
- `--ut-space-2`, `--ut-space-3`

## 7. Verhalten und JS

- `connectedCallback`: Ist `navigator.clipboard.writeText` **oder**
  `document.queryCommandSupported('copy')` verfügbar, wird `hidden` vom Button entfernt.
  Sonst bleibt er ausgeblendet.
- Klick, Fallback-Kette:
  1. **Clipboard-API:** `navigator.clipboard.writeText(value)`. Erfolg → Meldung „Kopiert“.
  2. **Auswahl + `execCommand`:** Wird Pfad 1 abgelehnt (oder fehlt die API), wird der Fehlername
     mit `console.debug('[ut-copy-button]', err.name)` ausgegeben (nur Debug-Level, zur
     Ursachenklärung). Dann wird das `target` markiert und `document.execCommand('copy')` in
     `try/catch` ausgeführt. Während dieses Kopierens ersetzt ein einmaliger `copy`-Listener
     den Inhalt durch `value`, damit der rohe Code statt des angezeigten, mit Leerzeichen
     formatierten Textes in der Zwischenablage landet. Gibt der Aufruf `true` zurück: gleiche
     Meldung und gleiches Event wie bei Pfad 1.
  3. **Manueller Hinweis:** Scheitert auch das, wird `failedLabel` in die `aria-live`-Region
     geschrieben („Code markiert. Zum Kopieren Cmd oder Strg + C drücken.“). Die Auswahl
     bleibt bestehen.
- Reset: Meldung „Kopiert“ nach 2000 ms, `failedLabel` nach 6000 ms (länger, weil der Nutzer
  danach selbst handeln muss). Mehrfachklick setzt den Timer neu.
- Event `ut:copy-button:copied` (bubbling) mit `detail: { value }`, nur bei Erfolg
  (Pfad 1 oder 2), nie bei Pfad 3.
- Nutzt `ut-api`: nein (Browser-API, keine Commerce-Plattform).
- Ohne JS: Button ausgeblendet (`hidden`), Fallback `user-select: all` am Text.

## 8. Accessibility

- Echter `<button type="button">`, Name = sichtbarer Text.
- Zielgröße mindestens 44 px (`size.control-md`).
- Status in `aria-live="polite"`, die Region existiert beim Laden leer. Auch der Fehlerfall wird
  angesagt; ohne Rückmeldung wüsste ein Screenreader-Nutzer nicht, dass nichts kopiert wurde.
- Die Auswahl des Codes bleibt im Fehlerfall bestehen (sichtbar und für Strg/Cmd+C bereit).
- Hover und Fokus sichtbar (Fokusring global aus `base.css`); Hover-Farbe rot erreicht 4.90:1.
- Print: komplette Komponente ausgeblendet.

## 9. Texte (Locale-Keys)

| Key                          | DE            | EN         |
|------------------------------|---------------|------------|
| `gift_cards.issued.copy_code`| Code kopieren | Copy code  |
| `gift_cards.issued.copied`   | Kopiert       | Copied     |
| `gift_cards.issued.copy_failed` | Code markiert. Zum Kopieren Cmd oder Strg + C drücken. | Code selected. Press Cmd or Ctrl + C to copy. |

## 10. Port-Hinweise (Next.js + Medusa)

- Client Component `<CopyButton value label copiedLabel />` mit `useState` für `copied`.
  `navigator.clipboard` ist dort identisch; Prüfung auf Verfügbarkeit im `useEffect`.
- `document.execCommand` ist veraltet (deprecated), aber der einzige synchrone Fallback in Safari.
  Im React-Port bleibt die Kette gleich: erst Clipboard-API, dann `execCommand`, dann Hinweis.
- Liquid-spezifisch: `gift_card.code` (roh) vs. `format_code` (Anzeige) ersetzen.
- CSS 1:1.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [ ] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün
- [ ] Tastatur + Screenreader geprüft
- [x] Metafelder: keine
