# Komponente: `drawer`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-drawer`                                      |
| CSS-Datei       | `assets/component-drawer.css`                     |
| Custom Element  | `<ut-drawer>`                                     |
| JS-Datei        | `assets/ut-drawer.js` (exportiert `UtDrawer`)     |
| Liquid          | `snippets/drawer.liquid`                          |
| Port-Typ        | Client Component                                  |

## 1. Zweck

Seitlich einfahrendes, modales Panel. Phase B nutzt es für das Mobile-Menü im Header.
Später erweitern Cart Drawer (`<ut-cart-drawer>`, Phase E) und Filter mobil
(`<ut-facets>`, Phase C) die Klasse `UtDrawer`. Der Drawer kennt keinen Inhalt, keine
Plattform und kein `ut-api`. Er ist **kein** Dropdown und kein zentriertes Modal
(`<ut-dialog>`).

## 2. Anatomie (BEM)

```
<ut-drawer id>                       Custom Element, Steuerung
└── dialog.ut-drawer                 natives <dialog>, volle Viewport-Fläche = Overlay
    └── .ut-drawer__panel            Panel, max. size.drawer breit
        ├── .ut-drawer__header
        │   ├── .ut-drawer__title    <h2>, benennt den Dialog (aria-labelledby)
        │   └── .ut-drawer__close    <button data-drawer-close>, Icon close
        └── .ut-drawer__body         Inhalt (vom Aufrufer, als captured HTML)
Modifier: .ut-drawer--start (Default, links in LTR) | .ut-drawer--end (rechts)
```

Alle Breakpoints: Panel `min(100%, size.drawer)` breit, volle Höhe. Das `<dialog>`
selbst ist die Overlay-Fläche (`bg.overlay`), nicht `::backdrop`, weil ältere Browser
Custom Properties in `::backdrop` nicht erben.

## 3. Datenvertrag (plattformneutral)

| Feld      | Typ                | Pflicht | Beschreibung                                  |
|-----------|--------------------|---------|-----------------------------------------------|
| `id`      | string             | ja      | eindeutig, Ziel von `aria-controls`           |
| `title`   | string             | ja      | sichtbarer Titel, Name des Dialogs            |
| `content` | HTML               | ja      | Inhalt des Body                               |
| `side`    | `start` \| `end`   | nein    | Default `start`                               |

## 4. Einstellungen

n/a. Inhalt und Titel kommen von der aufrufenden Section.

## 5. Zustände

| Zustand | Auslöser                                             | Darstellung                                    |
|---------|------------------------------------------------------|------------------------------------------------|
| closed  | Default, Escape, Klick auf Overlay oder `[data-drawer-close]` | `<dialog>` ohne `open`                 |
| open    | Klick auf einen Auslöser `[aria-controls="<id>"]`, `open()` | `dialog[open]`, Panel fährt ein, Seite scrollt nicht (`html:has(.ut-drawer[open])`) |

## 6. Verwendete Tokens

- `--ut-color-bg-overlay`, `--ut-color-bg-default`, `--ut-color-text-default`, `--ut-color-border-default`, `--ut-color-action-primary-bg-hover` (Hover Close-Icon, red 4.90:1 gegen bg.default)
- `--ut-size-drawer` (neu, 30rem), `--ut-size-control-md`, `--ut-layout-header-height`, `--ut-layout-gutter`
- `--ut-space-4`, `--ut-space-6`
- `--ut-font-size-sm`, `--ut-font-weight-bold`, `--ut-font-width-condensed`, `--ut-font-letter-spacing-caps`
- `--ut-border-width-hairline`, `--ut-shadow-lg`
- `--ut-motion-duration-base`, `--ut-motion-easing-enter`

## 7. Verhalten und JS

- `<ut-drawer>` sucht sein `<dialog>` als direktes Kind.
- Auslöser: jedes Element mit `aria-controls="<id>"` irgendwo im Dokument (Klick-Delegation
  auf `document`). Der Drawer setzt `aria-expanded` auf allen Auslösern.
- Methoden: `open(trigger?)`, `close()`, `toggle(trigger?)`, Getter `isOpen`.
- Events (bubbling, auf dem Element): `ut:drawer:open`, `ut:drawer:close`, `detail: { id }`.
- Escape: natives `cancel` des `<dialog>`. Klick auf die Overlay-Fläche (Ziel ist das
  `<dialog>` selbst) schließt.
- Ohne JS: Der Drawer öffnet nicht. Der Aufrufer muss eine Alternative rendern
  (Header: Navigation sichtbar unter `.no-js`, Auslöser ausgeblendet). Keine toten Buttons.
- Nutzt `ut-api`: nein.

## 8. Accessibility

- Natives modales `<dialog>` per `showModal()`: Fokus bleibt im Dialog, Rest der Seite ist inert, Escape schließt.
- `aria-labelledby` zeigt auf `__title`.
- Fokus beim Öffnen: erstes fokussierbares Element (Close-Button). Beim Schließen zurück auf den Auslöser.
- Close-Button: `aria-label` aus `layout.drawer.close`, Icon dekorativ, Zielgröße `size.control-md` (44px).
- Animation über globale `prefers-reduced-motion`-Regel in `base.css` abgeschaltet.

## 9. Texte (Locale-Keys)

| Key                   | DE          | EN     |
|-----------------------|-------------|--------|
| `layout.drawer.close` | Schließen   | Close  |

## 10. Port-Hinweise (Next.js + Medusa)

- Client Component `<Drawer id title side open onOpenChange>` oder Hook `useDrawer`
  (`docs/migration.md`). `<dialog>` bleibt, damit Focus Trap und Inert nativ sind.
- Klick-Delegation über `aria-controls` wird zu React-State im Auslöser.
- CSS 1:1.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Tastatur + Screenreader geprüft (Verhalten per Headless-Browser getestet, kein Screenreader)
- [x] Metafelder: keine
