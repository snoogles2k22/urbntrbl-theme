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

Fußzeile auf allen Seiten mit Layout: Newsletter (`newsletter.md`), optionale
Footer-Navigation, Rechtliches (Impressum, Datenschutz, AGB, Widerruf), die
Preis-Fußnote zum Marker `*` in Produktlisten (`price.md`, Review K1/O5) und
Copyright. Keine Social-Links, keine Zahlungs-Icons, kein Länder-/Sprachwähler
(kein Blueprint fordert sie bisher).

## 2. Anatomie (BEM)

```
footer.ut-footer-section             Section-Wrapper (Landmark contentinfo)
└── .ut-footer[data-tone]            Ton default | inverse (Scope aus tokens.json)
    └── .ut-footer__inner            Container
        ├── .ut-footer__top
        │   ├── .ut-footer__newsletter   .ut-newsletter
        │   └── nav.ut-footer__nav       optional, Menü (erste Ebene)
        │       └── ul.ut-footer__list > li > a.ut-footer__link
        └── .ut-footer__bottom
            ├── nav.ut-footer__legal     ul.ut-footer__legal-list > li > a.ut-footer__link | span.ut-footer__placeholder
            ├── p.ut-footer__footnote    Preis-Fußnote (+ Link Versandinformationen)
            └── p.ut-footer__copyright
```

| Breakpoint   | Layout                                                 |
|--------------|--------------------------------------------------------|
| < md (768px) | alles einspaltig                                       |
| ≥ md         | `__top` zweispaltig (Newsletter 1fr, Navigation auto)  |

## 3. Datenvertrag (plattformneutral)

| Feld              | Typ                         | Pflicht | Quelle Shopify                                   | Quelle Medusa |
|-------------------|-----------------------------|---------|--------------------------------------------------|---------------|
| `navItems[]`      | `{ title, url, active }`    | nein    | `linklists[section.settings.menu].links`         | CMS / Config  |
| `legal.imprint`   | URL \| null                 | ja*     | Setting `imprint_url`                            | CMS-Seite     |
| `legal.privacy`   | URL \| null                 | ja*     | Setting `privacy_url`, Fallback `shop.privacy_policy.url` | CMS-Seite |
| `legal.terms`     | URL \| null                 | ja*     | Setting `terms_url`, Fallback `shop.terms_of_service.url` | CMS-Seite |
| `legal.withdrawal`| URL \| null                 | ja*     | Setting `withdrawal_url`, Fallback `shop.refund_policy.url` **[ANNAHME]** | CMS-Seite |
| `taxMode`         | `included` \| `kleinunternehmer` \| `none` | ja | Theme-Setting `price_tax_mode`            | Store-Config  |
| `shippingInfoUrl` | URL \| null                 | nein    | `shop.shipping_policy.url`, Fallback `price_shipping_page` (wie `price.liquid`) | CMS-Seite |
| `shopName`, `year`| string, int                 | ja      | `shop.name`, `'now' \| date: '%Y'`               | Site-Config   |

\* Pflicht vor Launch. Bis die Seiten existieren, rendert der Footer den Text als
**Platzhalter** ohne Link (`.ut-footer__placeholder`), nie einen toten Link.

## 4. Einstellungen (Section)

| ID                | Typ       | Default   | Beschreibung                                          |
|-------------------|-----------|-----------|-------------------------------------------------------|
| `tone`            | select    | `inverse` | `default` / `inverse`, setzt `data-tone` (Scope, ADR 0004) |
| `show_newsletter` | checkbox  | true      | Newsletter-Formular anzeigen                          |
| `menu`            | link_list | leer      | optionale Footer-Navigation                           |
| `imprint_url`     | url       | leer      | Impressum                                             |
| `privacy_url`     | url       | leer      | Datenschutzerklärung (auch Link im Newsletter)        |
| `terms_url`       | url       | leer      | AGB                                                   |
| `withdrawal_url`  | url       | leer      | Widerrufsbelehrung                                    |

## 5. Zustände

| Zustand          | Auslöser                           | Darstellung                                    |
|------------------|------------------------------------|------------------------------------------------|
| default          | –                                  | wie Anatomie                                   |
| no menu          | Menü leer                          | `__nav` nicht gerendert, Newsletter volle Breite |
| no newsletter    | `show_newsletter` aus              | `__newsletter` nicht gerendert                 |
| legal placeholder| keine URL für einen Rechtslink     | `span.ut-footer__placeholder` statt Link       |
| tax mode         | `price_tax_mode`                   | Fußnote `footnote_kleinunternehmer` / `footnote_included` / `footnote_none` |

## 6. Verwendete Tokens

- `--ut-color-bg-default`, `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-border-default`, `--ut-color-action-primary-bg-hover` (Link-Hover)
- `--ut-layout-container-max`, `--ut-layout-gutter`, `--ut-layout-gutter-lg`, `--ut-layout-section-gap`
- `--ut-space-1`, `--ut-space-2`, `--ut-space-4`, `--ut-space-6`, `--ut-space-10`
- `--ut-font-size-xs`, `--ut-font-size-sm`, `--ut-font-line-height-snug`
- `--ut-border-width-hairline`, `--ut-border-width-thick`
- `--ut-size-control-sm`

Kontrast im Scope `inverse`: text.default 17.17:1, text.muted 9.76:1, Hover red-bright
4.65:1 (alle auf brand.black). Im Ton `default`: 17.17, 5.87, Hover red 4.90.
Kein roter Text auf Graustufen, kein Grün.

## 7. Verhalten und JS

Kein JS. Der Newsletter ist ein normales Formular (`newsletter.md`).

## 8. Accessibility

- Section-Wurzel ist `<footer>` (Landmark `contentinfo`).
- Zwei benannte Navigationen: `layout.footer.nav_label`, `layout.footer.legal_label`.
- Fußnote beginnt mit „*“ und entspricht dem Marker `.ut-price__marker` (der ist `aria-hidden`,
  darum steht der Hinweis als vollständiger Satz im Footer).
- Links unterstrichen erkennbar über Hover (Dicke) und Farbe; Zielhöhe `size.control-sm`.

## 9. Texte (Locale-Keys)

| Key                                    | DE                      | EN                   |
|----------------------------------------|-------------------------|----------------------|
| `layout.footer.nav_label`              | Footer-Navigation       | Footer navigation    |
| `layout.footer.legal_label`            | Rechtliches             | Legal                |
| `layout.footer.legal.imprint`          | Impressum               | Legal notice         |
| `layout.footer.legal.privacy`          | Datenschutz             | Privacy              |
| `layout.footer.legal.terms`            | AGB                     | Terms                |
| `layout.footer.legal.withdrawal`       | Widerruf                | Right of withdrawal  |
| `layout.footer.shipping_info`          | Versandinformationen    | Shipping information |
| `layout.footer.copyright`              | © {{ year }} {{ shop }} | © {{ year }} {{ shop }} |
| `products.price.footnote_kleinunternehmer` | * Gemäß § 19 UStG wird keine Umsatzsteuer berechnet, zzgl. Versandkosten. | (bestehend, `price.md`) |
| `products.price.footnote_included`     | * inkl. MwSt., zzgl. Versandkosten (bestehend) | |
| `products.price.footnote_none`         | * zzgl. Versandkosten (neu) | * plus shipping  |

**[RECHT-PRÜFEN]** Wortlaut der Fußnote nach § 19 UStG und ihr Platz im Footer (Review O5),
Zuordnung „Widerruf“ → Shopify-Rückerstattungsrichtlinie, Vollständigkeit der Rechtslinks
(z. B. Versand, Zahlung, OS-Plattform-Hinweis). Annahmen, keine Rechtsberatung.
Der Marker steht bewusst nicht im sichtbaren Locale-Wert, damit „[RECHT-PRÜFEN]“
nie im Shop erscheint.

## 10. Port-Hinweise (Next.js + Medusa)

- Server Component `<Footer>`; Menüs und Rechtslinks aus CMS/Config statt `linklists`
  und Section-Settings (`docs/migration.md`).
- `taxMode` aus Store-Config (wie `<Price>`), Fußnote mit identischen Keys.
- Newsletter als Client Component (`newsletter.md`).

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Rechtslink-URLs gesetzt (vor Launch)
- [ ] **[RECHT-PRÜFEN]** Fußnote und Rechtslinks geprüft
- [x] Metafelder: keine
