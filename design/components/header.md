# Komponente: `header`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-header` (Wrapper der Section: `.ut-header-section`) |
| CSS-Datei       | `assets/component-header.css`                     |
| Custom Element  | `<ut-header>`                                     |
| JS-Datei        | `assets/ut-header.js`                             |
| Liquid          | `sections/header.liquid` (Section Group `header`) |
| Port-Typ        | Client Component (Breakpoint-Logik), Inhalt Server |

## 1. Zweck

Kopfzeile auf allen Seiten außer Gutschein-Seite und Passwortseite: Wortmarke bzw.
Logo mit Link zur Startseite, Hauptnavigation, Warenkorb-Zähler und Mobile-Menü.
Kein Mega-Menü, keine Untermenüs, keine Suche, kein Kundenkonto (kein Blueprint
fordert sie bisher).

**[ANNAHME]** Navigation Phase B: „Drop 1“, „Über uns“, „Kontakt“. Die Einträge sind
Shopify-Menüdaten (Admin → Inhalte → Menüs, Handle `main-menu`) und nicht Teil des
Themes. Ziel-URLs sind offen (siehe 10).

## 2. Anatomie (BEM)

```
.ut-header-section                    Section-Wrapper von Shopify, sticky (wenn --sticky)
└── <ut-header class="ut-header [ut-header--sticky]">
    ├── .ut-header__inner             Grid, max. layout.container-max
    │   ├── .ut-header__menu-toggle   <button aria-controls="MenuDrawer">, nur mobil und nur mit JS
    │   ├── a.ut-header__brand        Link zur Startseite
    │   │   ├── .ut-header__wordmark  Text (shop.name) in Display, solange kein Logo gesetzt ist
    │   │   └── img.ut-header__logo   wenn Setting logo gesetzt
    │   ├── nav.ut-header__nav        Desktop-Navigation (ab md)
    │   │   └── ul.ut-header__list > li > a.ut-header__link[aria-current]
    │   └── .ut-header__actions       .ut-cart-count
    └── <ut-drawer id="MenuDrawer">   Mobile-Menü (drawer.md)
        └── ul.ut-header__drawer-list > li > a.ut-header__drawer-link
```

| Breakpoint      | Layout                                                                 |
|-----------------|------------------------------------------------------------------------|
| < md (768px)    | `[Menü-Button] [Wortmarke zentriert] [Warenkorb]`, Navigation im Drawer |
| ≥ md            | `[Wortmarke] [Navigation] [Warenkorb]`, kein Menü-Button               |
| ohne JS, < md   | `[Wortmarke] [Warenkorb]`, Navigation als zweite Zeile, kein Menü-Button |

Höhe mindestens `layout.header-height` (64px), die Wortmarke (32px) passt mit Luft.

## 3. Datenvertrag (plattformneutral)

| Feld          | Typ                                   | Pflicht | Quelle Shopify                       | Quelle Medusa            |
|---------------|---------------------------------------|---------|--------------------------------------|--------------------------|
| `brandName`   | string                                | ja      | `shop.name`                          | Site-Config              |
| `logo`        | Image \| null                         | nein    | Theme-Setting `logo` (Platzhalter)   | Site-Config              |
| `homeUrl`     | URL                                   | ja      | `routes.root_url`                    | `/`                      |
| `navItems[]`  | `{ title, url, active }`              | nein    | `linklists[section.settings.menu].links` (`link.title`, `link.url`, `link.current`) | CMS / JSON-Config |
| `itemCount`   | int                                   | ja      | siehe `cart-count.md`                | Cart-Context             |

Nur die erste Menüebene wird gerendert. Untermenüs werden ignoriert.

## 4. Einstellungen (Section)

| ID       | Typ       | Default     | Beschreibung                                  |
|----------|-----------|-------------|-----------------------------------------------|
| `menu`   | link_list | `main-menu` | Menü für Desktop-Navigation und Mobile-Menü   |
| `sticky` | checkbox  | true        | Header bleibt beim Scrollen oben              |

Logo kommt aus dem globalen Setting `logo` (Registry `docs/data-model.md`).

## 5. Zustände

| Zustand        | Auslöser                       | Darstellung                                         |
|----------------|--------------------------------|-----------------------------------------------------|
| default        | –                              | wie Anatomie                                        |
| sticky         | `sticky` = true                | `.ut-header--sticky`, Wrapper `position: sticky`, `z.sticky` |
| menu open      | Klick Menü-Button              | Drawer offen, Button `aria-expanded="true"`         |
| no menu        | Menü leer oder nicht vorhanden | Navigation und Menü-Button werden nicht gerendert   |
| current page   | `link.current`                 | `aria-current="page"`, Unterstreichung              |
| logo           | Setting `logo` gesetzt         | `<img>` statt Wortmarke                             |
| no JS          | `html.no-js`                   | Menü-Button versteckt, Navigation sichtbar          |

## 6. Verwendete Tokens

- Wortmarke: `--ut-component-wordmark-font-family`, `-font-size` (= `font.display.min-size`, 32px), `-font-weight`, `-letter-spacing`, dazu `font-synthesis: none`
- `--ut-color-bg-default`, `--ut-color-text-default`, `--ut-color-border-default`, `--ut-color-action-primary-bg-hover` (Hover Links und Icons: red auf offwhite 4.90:1)
- `--ut-layout-header-height`, `--ut-layout-container-max`, `--ut-layout-gutter`, `--ut-layout-gutter-lg`
- `--ut-size-control-md`
- `--ut-space-1`, `--ut-space-2`, `--ut-space-4`, `--ut-space-6`
- `--ut-font-family-heading`, `--ut-font-size-sm`, `--ut-font-size-xl`, `--ut-font-weight-bold`, `--ut-font-width-condensed`, `--ut-font-letter-spacing-caps`, `--ut-font-line-height-tight`
- `--ut-border-width-hairline`, `--ut-border-width-thick`
- `--ut-z-sticky`

Display-Font nur an `.ut-header__wordmark` über die Komponenten-Tokens, nie an Links.
Navigationslinks sind Archivo.

## 7. Verhalten und JS

- `<ut-header>` schließt das Mobile-Menü, wenn der Viewport auf ≥ md wechselt (`matchMedia('(min-width: 768px)')`).
- Öffnen, Schließen, Fokus und `aria-expanded` übernimmt `<ut-drawer>` (Auslöser über `aria-controls`).
- Ohne JS: Navigation ist auf allen Breakpoints sichtbar (`.no-js`), es gibt keinen toten Menü-Button.
- Nutzt `ut-api`: nein. Der Zähler hört auf das Event (`cart-count.md`).

## 8. Accessibility

- `<header>` ist die Section-Wurzel (Landmark `banner`). Navigation in `<nav aria-label>` (Key `layout.header.nav_label`).
- Menü-Button: `aria-label` „Menü öffnen“, `aria-controls`, `aria-expanded` (vom Drawer gepflegt), Zielgröße 44px.
- Brand-Link: Name ist der Shop-Name (Text bzw. `alt` des Logos).
- Aktive Seite: `aria-current="page"`, nicht nur Farbe.
- Kontrast: text.default auf bg.default 17.17:1, Hover red 4.90:1.
- Skip-Link aus `theme.liquid` steht vor dem Header.

## 9. Texte (Locale-Keys)

| Key                        | DE               | EN              |
|----------------------------|------------------|-----------------|
| `layout.header.nav_label`  | Hauptnavigation  | Main navigation |
| `layout.header.menu`       | Menü             | Menu            |
| `layout.header.menu_open`  | Menü öffnen      | Open menu       |

Menüeinträge selbst sind Inhalt aus Shopify-Menüs, keine Locale-Keys.
Schema-Keys: `sections.header.*`.

## 10. Port-Hinweise (Next.js + Medusa)

- `<Header>` als Server Component mit Daten aus Site-Config/CMS, darin Client
  Components `<MobileMenu>` (Drawer) und `<CartCount>`.
- `linklists` → Navigation aus CMS oder JSON-Config. `link.current` → `usePathname()`.
- Offen: Ziel-URLs der Einträge „Drop 1“ (`/drops/<handle>` laut `blueprints/drop.md`, Handle offen), „Über uns“, „Kontakt“ (Shopify-Seiten, Handles offen).

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Tastatur + Screenreader geprüft (Verhalten per Headless-Browser getestet)
- [x] Metafelder: keine
