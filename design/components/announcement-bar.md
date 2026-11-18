# Komponente: `announcement-bar`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-announcement-bar`                            |
| CSS-Datei       | `assets/component-announcement-bar.css`           |
| Custom Element  | kein JS                                           |
| JS-Datei        | n/a                                               |
| Liquid          | `sections/announcement-bar.liquid` (Section Group `header`) |
| Port-Typ        | Server Component                                  |

## 1. Zweck

Eine Zeile über dem Header auf allen Seiten (Rahmen, `blueprints/README.md`). In v1
kündigt sie nur den nächsten Drop-Termin an. **[ANNAHME]** Inhalt Phase B: „Drop 1 ·
20.03.2027“, **kein Preis**, kein Rabatt, kein Countdown. Sie ist **kein** Ticker
(`.ut-ticker`, Phase F) und kein Cookie-/Consent-Banner.

## 2. Anatomie (BEM)

```
.ut-announcement-bar            <aside data-tone="inverse">
└── .ut-announcement-bar__inner Container, zentriert
    └── .ut-announcement-bar__text   <p>, optional als <a> (__link)
        └── .ut-announcement-bar__link
```

Alle Breakpoints gleich: eine Zeile, zentriert, bei Überlänge Umbruch (kein
Abschneiden, kein Marquee).

## 3. Datenvertrag (plattformneutral)

| Feld    | Typ           | Pflicht | Quelle Shopify                                   | Quelle Medusa           |
|---------|---------------|---------|--------------------------------------------------|-------------------------|
| `text`  | string        | ja      | Section-Setting `text`, leer → Locale `layout.announcement_bar.default_text` | CMS / Site-Config |
| `url`   | URL \| null   | nein    | Section-Setting `link`                           | CMS / Site-Config       |

Der Drop-Termin steht in v1 als Text im Locale bzw. Setting, nicht aus dem
Drop-Metaobjekt (`launch_at`). Die Kopplung an `current-drop.liquid` folgt mit
Phase F, sobald das Snippet existiert.

## 4. Einstellungen (Section)

| ID     | Typ  | Default | Beschreibung                                                     |
|--------|------|---------|------------------------------------------------------------------|
| `text` | text | leer    | Überschreibt den Standardtext. Leer = Text aus `locales/`        |
| `link` | url  | leer    | Macht den Text zum Link (z. B. Drop-Seite)                       |

## 5. Zustände

| Zustand   | Auslöser              | Darstellung                         |
|-----------|-----------------------|-------------------------------------|
| default   | –                     | Text ohne Link                      |
| linked    | `link` gesetzt        | `__link`, Unterstreichung bei Hover |

## 6. Verwendete Tokens

- Scope `inverse` (`data-tone="inverse"`): `--ut-color-bg-default` (black), `--ut-color-text-default` (offwhite), `--ut-color-action-primary-bg-hover` (red-bright, Hover)
- `--ut-font-family-heading`, `--ut-font-size-xs`, `--ut-font-weight-bold`, `--ut-font-width-condensed`, `--ut-font-letter-spacing-caps`, `--ut-font-line-height-snug`
- `--ut-space-2`, `--ut-layout-gutter`, `--ut-layout-gutter-lg`, `--ut-layout-container-max`
- `--ut-border-width-hairline`, `--ut-border-width-thick`

Kontrast: offwhite auf black 17.17:1, red-bright auf black 4.65:1 (Hover-Text).
Kein Display-Font: Schriftgröße 12px liegt unter `font.display.min-size`.

## 7. Verhalten und JS

Kein JS. Kein Schließen-Button in v1.

## 8. Accessibility

- `<aside aria-label="…">` (Key `layout.announcement_bar.label`), damit die Landmark benannt ist.
- Link mit sprechendem Text (der Ankündigungstext selbst).
- Versalien nur per CSS (`text-transform`), der Text bleibt im DOM normal geschrieben.

## 9. Texte (Locale-Keys)

| Key                                     | DE                    | EN                     |
|-----------------------------------------|-----------------------|------------------------|
| `layout.announcement_bar.label`         | Ankündigung           | Announcement           |
| `layout.announcement_bar.default_text`  | Drop 1 · 20.03.2027   | Drop 1 · 20 March 2027 |

Schema-Keys: `sections.announcement_bar.*` in `locales/*.schema.json`.

## 10. Port-Hinweise (Next.js + Medusa)

- Server Component `<AnnouncementBar text url />`, Daten aus Site-Config.
- Sobald Phase F steht: Termin aus `drop.launch_at` formatieren (`Intl.DateTimeFormat`, Europe/Berlin).
- CSS 1:1.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Tastatur + Screenreader geprüft
- [x] Metafelder: keine
