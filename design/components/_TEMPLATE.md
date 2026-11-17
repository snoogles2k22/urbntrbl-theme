# Komponente: `<name>`

> Datei kopieren nach `design/components/<name>.md`. Alle Abschnitte ausfüllen, **bevor**
> Liquid, CSS oder JS geschrieben wird. Leere Abschnitte mit „n/a“ und Begründung.

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | Entwurf / In Arbeit / Fertig                      |
| BEM-Block       | `.ut-<name>` (Präfix `ut-` ist Pflicht, siehe CLAUDE.md Regel 2) |
| CSS-Datei       | `assets/component-<name>.css`                     |
| Custom Element  | `<ut-<name>>` oder „kein JS“                      |
| JS-Datei        | `assets/ut-<name>.js` oder n/a                    |
| Liquid          | `sections/<…>.liquid` / `snippets/<…>.liquid`     |
| Port-Typ        | Server Component / Client Component / beides      |

## 1. Zweck

Ein Absatz: Was löst die Komponente, wo kommt sie vor, was ist sie **nicht**.

## 2. Anatomie (BEM)

```
.ut-<name>
├── .ut-<name>__<element>
├── .ut-<name>__<element>
│   └── .ut-<name>__<sub-element>
└── Modifier: .ut-<name>--<variant>, .ut-<name>--<state>
```

Skizze oder Beschreibung des Layouts pro Breakpoint (sm / md / lg).

## 3. Datenvertrag (plattformneutral)

Was die Komponente braucht, unabhängig davon, ob es aus Liquid-Objekten oder aus Medusa kommt.

| Feld          | Typ            | Pflicht | Quelle Shopify                  | Quelle Medusa                    |
|---------------|----------------|---------|---------------------------------|----------------------------------|
| `title`       | string         | ja      | `product.title`                 | `product.title`                  |
| `price`       | Money (minor)  | ja      | `product.price`                 | `variant.calculated_price`       |
| `image`       | Image          | nein    | `product.featured_image`        | `product.thumbnail`              |
| `<metafeld>`  | …              | nein    | `product.metafields.urbntrbl.x` | `product.metadata.x`             |

## 4. Einstellungen (Theme-Editor)

Nur Inhalt und Verhalten, keine Design-Werte (siehe ADR 0004).

| ID            | Typ        | Default | Beschreibung                       |
|---------------|------------|---------|------------------------------------|
| `heading`     | text       | ""      | …                                  |

## 5. Zustände

| Zustand       | Auslöser                | Darstellung (Modifier / Attribut)      |
|---------------|-------------------------|----------------------------------------|
| default       | –                       | –                                      |
| loading       | API-Call läuft          | `[aria-busy="true"]`                   |
| error         | API-Fehler              | `.ut-<name>--error`, Meldung sichtbar  |
| empty         | keine Daten             | `.ut-<name>--empty`                    |
| disabled      | …                       | `[disabled]` / `.ut-<name>--disabled`  |

## 6. Verwendete Tokens

Liste der `--ut-*` Properties. Dient als Prüfliste: Was hier nicht steht, darf im CSS nicht vorkommen.

- `--ut-color-…`
- `--ut-space-…`
- `--ut-font-…`

## 7. Verhalten und JS

- Funktioniert ohne JS? Was geht, was nicht (Progressive Enhancement).
- Custom Element: Attribute, Properties, Events (`ut:<name>:<event>`), Methoden.
- Welche `ut-api.js`-Methoden werden genutzt.

## 8. Accessibility

- Rolle / Landmark, ARIA-Attribute
- Tastaturbedienung (Tab-Reihenfolge, Escape, Pfeiltasten)
- Fokus-Management (Drawer/Modal: Focus Trap, Rückgabe)
- Kontrast: alle Text/Hintergrund-Paare aus Abschnitt 6 erfüllen AA
- Screenreader-Texte über `locales/`

## 9. Texte (Locale-Keys)

| Key                                   | DE                         | EN                   |
|---------------------------------------|----------------------------|----------------------|
| `<bereich>.<name>.<text>`             | …                          | …                    |

## 10. Port-Hinweise (Next.js + Medusa)

- Server oder Client Component, und warum.
- Was aus dem Custom Element 1:1 übernommen wird (Logik), was zu React-State wird.
- Liquid-spezifische Filter, die ersetzt werden müssen (`money`, `image_url`, `t`).
- Offene Fragen.

## 11. Abnahme

- [ ] Alle Abschnitte gefüllt
- [ ] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün
- [ ] Tastatur + Screenreader geprüft
- [ ] Metafelder in `docs/metafields.md`
