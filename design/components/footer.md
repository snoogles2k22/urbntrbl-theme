# Komponente: `footer`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-footer` (Wrapper der Section: `.ut-footer-section`) |
| CSS-Datei       | `assets/component-footer.css`                     |
| Custom Element  | kein JS                                           |
| JS-Datei        | n/a                                               |
| Liquid          | `sections/footer.liquid` (Section Group `footer`) |
| Port-Typ        | Server Component (Newsletter darin Client)        |

## 1. Zweck

Fußzeile auf allen Seiten mit Layout: Newsletter (`newsletter.md`), Rechtliches
(Impressum, Datenschutz, AGB, Widerruf), Preis-Hinweis nach § 19 UStG, die Fußnote zum
Marker `*` in Produktlisten (`price.md`, Review K1/O5) und Copyright. Keine
Social-Links, keine Zahlungs-Icons, kein Länder-/Sprachwähler, keine allgemeine
Footer-Navigation (kein Blueprint fordert sie bisher).

**Rechtslinks kommen aus dem Shopify-Menü `footer` (`linklists.footer`)**, nicht aus
Einzel-Settings und nicht aus dem Vorhandensein der Richtlinientexte. Das Menü enthält
die Policy-URLs; es ist die einzige Quelle für Titel, URL und Reihenfolge.

## 2. Anatomie (BEM)

```
footer.ut-footer-section             Section-Wrapper (Landmark contentinfo)
└── .ut-footer[data-tone]            Ton default | inverse (Scope aus tokens.json)
    └── .ut-footer__inner            Container
        ├── .ut-footer__newsletter       .ut-newsletter (optional)
        └── .ut-footer__bottom
            ├── nav.ut-footer__legal     ul.ut-footer__legal-list > li > a.ut-footer__link (aus linklists.footer)
            ├── p.ut-footer__price-note  Preis-Hinweis § 19 UStG, immer gerendert
            ├── p.ut-footer__footnote    Fußnote zum Marker * (+ Link Versandinformationen)
            └── p.ut-footer__copyright
```

Alle Breakpoints einspaltig, Container begrenzt auf `layout.container-max`.

## 3. Datenvertrag (plattformneutral)

| Feld              | Typ                         | Pflicht | Quelle Shopify                                   | Quelle Medusa |
|-------------------|-----------------------------|---------|--------------------------------------------------|---------------|
| `legalLinks[]`    | `{ title, url, active }`    | ja*     | `linklists[section.settings.menu].links` (`link.title`, `link.url`, `link.current`), Menü-Handle `footer` | CMS / Config |
| `privacyUrl`      | URL \| null                 | nein    | `shop.privacy_policy.url` (nur für den Link im Newsletter-Einwilligungstext) | CMS-Seite |
| `taxMode`         | `included` \| `kleinunternehmer` \| `none` | ja | Theme-Setting `price_tax_mode`            | Store-Config  |
| `shippingInfoUrl` | URL \| null                 | nein    | `shop.shipping_policy.url`, Fallback `price_shipping_page` (wie `price.liquid`) | CMS-Seite |
| `shopName`, `year`| string, int                 | ja      | `shop.name`, `'now' \| date: '%Y'`               | Site-Config   |

\* Pflicht vor Launch. Der Footer rendert **jeden Menüeintrag mit `href`**. Er blendet
nichts aus, weil die Richtlinie in Shopify noch leer ist, und er ersetzt keinen Eintrag
durch Platzhaltertext. Ein Link auf eine noch leere Richtlinie ist vor Launch ein
Pflegefehler im Admin, kein Theme-Fall (Abnahme unten). Sollen Impressum, Datenschutz,
AGB und Widerruf in dieser Reihenfolge stehen, wird sie im Menü gepflegt; der Footer
sortiert nicht um, weil Titel und Handles Shop-Daten sind.

## 4. Einstellungen (Section)

| ID                | Typ       | Default   | Beschreibung                                          |
|-------------------|-----------|-----------|-------------------------------------------------------|
| `tone`            | select    | `inverse` | `default` / `inverse`, setzt `data-tone` (Scope, ADR 0004) |
| `show_newsletter` | checkbox  | true      | Newsletter-Formular anzeigen                          |
| `menu`            | link_list | `footer`  | Menü mit den Rechtslinks (Impressum, Datenschutz, AGB, Widerruf) |

Entfallen sind `imprint_url`, `privacy_url`, `terms_url` und `withdrawal_url` (ersetzt
durch das Menü; sie waren ohne Wert, darum fehlten die Links). Es kommt kein neues
Setting hinzu. Der Preis-Hinweis hat bewusst keinen Schalter.

## 5. Zustände

| Zustand          | Auslöser                           | Darstellung                                    |
|------------------|------------------------------------|------------------------------------------------|
| default          | –                                  | wie Anatomie                                   |
| no legal menu    | Menü `footer` fehlt oder ist leer  | `__legal` nicht gerendert. **[RECHT-PRÜFEN]** Vor Launch Pflicht, Menü anlegen |
| no newsletter    | `show_newsletter` aus              | `__newsletter` nicht gerendert                 |
| empty policy     | Menülink zeigt auf leere Richtlinie | Link bleibt mit `href` stehen (kein Ausblenden) |
| price note       | immer                              | `__price-note` mit `layout.footer.price_note`, unabhängig von Settings |
| footnote         | `price_tax_mode`                   | `kleinunternehmer` und `none`: `footnote_none` („* zzgl. Versandkosten“, die Steuerangabe steht im Preis-Hinweis); `included`: `footnote_included` |

## 6. Verwendete Tokens

- `--ut-color-bg-default`, `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-border-default`, `--ut-color-action-primary-bg-hover` (Link-Hover)
- `--ut-layout-container-max`, `--ut-layout-gutter`, `--ut-layout-gutter-lg`, `--ut-layout-section-gap`
- `--ut-space-1`, `--ut-space-2`, `--ut-space-4`, `--ut-space-6`, `--ut-space-10`
- `--ut-font-size-xs`, `--ut-font-size-sm`, `--ut-font-line-height-snug` (Preis-Hinweis, Fußnote und Copyright teilen sich Stil: `text.muted`, `font-size.xs`)
- `--ut-border-width-hairline`, `--ut-border-width-thick`
- `--ut-size-control-sm`

Kontrast im Scope `inverse`: text.default 17.17:1, text.muted 9.76:1, Hover red-bright
4.65:1 (alle auf brand.black). Im Ton `default`: 17.17, 5.87, Hover red 4.90.
Kein roter Text auf Graustufen, kein Grün.

## 7. Verhalten und JS

Kein JS. Der Newsletter ist ein normales Formular (`newsletter.md`).

Preis-Hinweis und Fußnote: Der Preis-Hinweis (`layout.footer.price_note`) wird immer
gerendert und nennt § 19 UStG. Er gilt für den Kleinunternehmer-Betrieb. Wechselt der
Shop auf Regelbesteuerung (`price_tax_mode: included`), widerspricht er der Fußnote
„inkl. MwSt.“ und muss dann geändert oder entfernt werden. **[RECHT-PRÜFEN]**

## 8. Accessibility

- Section-Wurzel ist `<footer>` (Landmark `contentinfo`).
- Eine benannte Navigation: `layout.footer.legal_label`.
- Fußnote beginnt mit „*“ und entspricht dem Marker `.ut-price__marker` (der ist `aria-hidden`,
  darum steht der Hinweis als vollständiger Satz im Footer).
- Links unterstrichen erkennbar über Hover (Dicke) und Farbe; Zielhöhe `size.control-sm`.

## 9. Texte (Locale-Keys)

| Key                                    | DE                      | EN                   |
|----------------------------------------|-------------------------|----------------------|
| `layout.footer.legal_label`            | Rechtliches             | Legal                |
| `layout.footer.price_note`             | Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer erhoben und ausgewiesen. | All prices are final prices. No VAT is levied or shown pursuant to § 19 UStG (German small business regulation). |
| `layout.footer.shipping_info`          | Versandinformationen    | Shipping information |
| `layout.footer.copyright`              | © {{ year }} {{ shop }} | © {{ year }} {{ shop }} |
| `products.price.footnote_included`     | * inkl. MwSt., zzgl. Versandkosten (bestehend) | * incl. VAT, plus shipping |
| `products.price.footnote_none`          | * zzgl. Versandkosten (bestehend) | * plus shipping |
| `products.price.footnote_kleinunternehmer` | bleibt für den Styleguide und `price.md`, im Footer ersetzt durch Preis-Hinweis + `footnote_none` | |

Die Titel der Rechtslinks sind keine Locale-Keys, sie kommen aus dem Menü (in
Shopify über Translate & Adapt übersetzbar). Entfallen sind die Keys
`layout.footer.nav_label` und `layout.footer.legal.*`.

**[RECHT-PRÜFEN]** Wortlaut des Preis-Hinweises nach § 19 UStG (durch Steuerberater oder
Rechtstexte-Anbieter bestätigen lassen) und sein Platz im Footer (Review O5), Zuordnung
der Menüeinträge zu den Richtlinien (Widerruf → Rückerstattungsrichtlinie), Vollständigkeit
der Rechtslinks (z. B. Versand, Zahlung, OS-Plattform-Hinweis). Annahmen, keine Rechtsberatung.
Der Marker steht bewusst nicht im sichtbaren Locale-Wert, damit „[RECHT-PRÜFEN]“
nie im Shop erscheint.

## 10. Port-Hinweise (Next.js + Medusa)

- Server Component `<Footer>`; Rechtslinks aus CMS/Config statt `linklists`
  (`docs/migration.md`). Datenform `legalLinks[]` bleibt gleich.
- `taxMode` aus Store-Config (wie `<Price>`), Fußnote mit identischen Keys.
- Newsletter als Client Component (`newsletter.md`).

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Menü `footer` enthält Impressum, Datenschutz, AGB, Widerruf in dieser Reihenfolge (vor Launch)
- [ ] Alle vier Richtlinien in Shopify gefüllt, jeder Footer-Link öffnet eine Seite mit Inhalt (vor Launch)
- [ ] **[RECHT-PRÜFEN]** Preis-Hinweis und Rechtslinks geprüft
- [x] Metafelder: keine
