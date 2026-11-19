# Komponente: `newsletter`

| Feld            | Wert                                              |
|-----------------|---------------------------------------------------|
| Status          | In Arbeit                                         |
| BEM-Block       | `.ut-newsletter`                                  |
| CSS-Datei       | `assets/component-newsletter.css`                 |
| Custom Element  | kein JS                                           |
| JS-Datei        | n/a                                               |
| Liquid          | `snippets/newsletter-form.liquid` (genutzt von `sections/footer.liquid`, später `sections/newsletter.liquid` auf Home, Phase F) |
| Port-Typ        | Client Component (Formular-Zustand), Markup Server |

## 1. Zweck

Anmeldung zum Newsletter mit E-Mail-Adresse über das Shopify-Kundenformular
(`{% form 'customer' %}`, Tag `newsletter`, `blueprints/home.md`). Rendert Überschrift,
Kurztext, Feld mit Absenden-Button, Einwilligungstext mit Link zur
Datenschutzerklärung und die Rückmeldung nach dem Absenden. Ist **nicht** die
Warteliste (`.ut-waitlist`, Phase D), auch wenn sie denselben Mechanismus nutzt
(`design/logic/drop.md` Abschnitt 5).

## 2. Anatomie (BEM)

```
.ut-newsletter
├── .ut-newsletter__heading      <h2>, Archivo (unter 32px, kein Display)
├── .ut-newsletter__text
└── form.ut-newsletter__form     Shopify customer form, id = Parameter
    ├── input[type=hidden] contact[tags]=newsletter
    ├── .ut-form-field--inline   E-Mail + Button (form-field.md, button.md)
    ├── .ut-newsletter__status   role="status": Erfolg (Icon check + Text) oder leer
    └── .ut-newsletter__consent  Einwilligungstext mit Link
```

Alle Breakpoints gleich, Breite vom Container.

## 3. Datenvertrag (plattformneutral)

| Feld          | Typ          | Pflicht | Quelle Shopify                        | Quelle Medusa                         |
|---------------|--------------|---------|---------------------------------------|---------------------------------------|
| `formId`      | string       | ja      | Parameter `id`                        | –                                     |
| `email`       | string       | nein    | `form.email`, sonst `customer.email`  | Customer-Context                      |
| `privacyUrl`  | URL \| null  | nein    | Parameter, Fallback `shop.privacy_policy.url` | CMS-Seite                    |
| `status`      | `idle` \| `success` \| `error` | ja | `form.posted_successfully?`, `form.errors` | Response des eigenen Endpunkts |
| `tags`        | string       | ja      | fest `newsletter`                     | Newsletter-Anbieter / `waitlist_entry` |

## 4. Einstellungen

Snippet-Parameter: `id` (Pflicht), `heading` (bool `show_heading`, Default true),
`privacy_url`. Texte kommen aus `locales/`. Die Home-Section (Phase F) bekommt die
Blueprint-Settings `heading`, `text`, `success_text`, `tone`.

## 5. Zustände

| Zustand   | Auslöser                       | Darstellung                                                  |
|-----------|--------------------------------|--------------------------------------------------------------|
| idle      | –                              | Feld und Button                                              |
| success   | `form.posted_successfully?`    | Feld ersetzt durch Status „Danke …“ mit Icon `check`, Farbe `text.default` (**kein Grün**) |
| error     | `form.errors`                  | Feld mit `aria-invalid`, Fehlertext (`form-field.md`, `text.error`) |

Erfolg wird bewusst nicht in `text.success` (Grün) gezeigt: Grün ist nicht Teil der
Marke und hält im Scope `inverse` keinen Kontrast. Icon und Text tragen die Information.

## 6. Verwendete Tokens

- `--ut-color-text-default`, `--ut-color-text-muted`, `--ut-color-text-link`, `--ut-color-action-primary-bg-hover` (Link-Hover)
- `--ut-font-size-xs`, `--ut-font-size-sm`, `--ut-font-size-xl`, `--ut-font-weight-bold`, `--ut-font-line-height-snug`
- `--ut-space-2`, `--ut-space-3`, `--ut-space-4`
- `--ut-border-width-thick`
- Über Form Field und Button: deren Tokens (Primary-Hover rot, im Scope `inverse` red-bright)

Kontrast im Scope `inverse` (Footer): text.default 17.17:1, text.muted 9.76:1,
Fehler red-bright 4.65:1, Button-Hover red-bright mit black 4.65:1.

## 7. Verhalten und JS

Kein JS. Shopify postet das Formular und leitet mit `?customer_posted=true#<id>`
zurück. Der Fokus landet über den Anker beim Formular.

Prüfpunkte auf dem Dev-Shop (ergänzend zu V1–V3 in `logic/drop.md`):

| Nr. | Frage                                                                                 |
|-----|---------------------------------------------------------------------------------------|
| V4  | Zeigen bei zwei Newsletter-Formularen auf einer Seite (Footer + Home) beide den Erfolgszustand? Falls ja: Erfolg nur zeigen, wenn `request` den Anker der eigenen Form-ID trägt, oder Home-Section ohne Footer-Formular. |

## 8. Accessibility

- Label „E-Mail-Adresse“ visuell versteckt, aber vorhanden (`hide_label`), `autocomplete="email"`, `required`.
- Status als `role="status"`. Bei Seiten-Reload wird er nicht angesagt, darum steht der Erfolg als Text an der Stelle des Feldes, die per Anker angesprungen wird.
- Fehler über `aria-invalid` und `aria-describedby` (Form Field).
- Link zur Datenschutzerklärung mit sprechendem Text.

## 9. Texte (Locale-Keys)

| Key                                   | DE | EN |
|---------------------------------------|----|----|
| `general.newsletter.heading`          | Newsletter | Newsletter |
| `general.newsletter.text`             | Neue Drops zuerst. Kein Spam. | New drops first. No spam. |
| `general.newsletter.email_label`      | E-Mail-Adresse | Email address |
| `general.newsletter.submit`           | Anmelden | Sign up |
| `general.newsletter.success`          | Danke! Bitte bestätige deine Anmeldung über den Link in der E-Mail. | Thanks! Please confirm your sign-up via the link in the email. |
| `general.newsletter.error`            | Bitte gib eine gültige E-Mail-Adresse ein. | Please enter a valid email address. |
| `general.newsletter.consent_html`     | Mit der Anmeldung willigst du ein, per E-Mail über neue Drops informiert zu werden. Abmeldung jederzeit möglich. Mehr in der {{ link }}. | By signing up you agree to receive emails about new drops. You can unsubscribe at any time. More in our {{ link }}. |
| `general.newsletter.privacy_link`     | Datenschutzerklärung | privacy policy |

**[RECHT-PRÜFEN]** Einwilligungstext, Erfolgstext (setzt Double-Opt-in voraus, `logic/drop.md` V2)
und Platz des Hinweises. Annahmen, keine Rechtsberatung.

## 10. Port-Hinweise (Next.js + Medusa)

- Shopify `customer_form` → eigener Endpunkt + Newsletter-Anbieter (`docs/migration.md`, Risiko R5 Consent-Nachweise).
- Client Component `<NewsletterForm>` mit Zustand `idle | submitting | success | error`; Markup und CSS 1:1.
- `form.posted_successfully?` entfällt, Status kommt aus der Response.

## 11. Abnahme

- [x] Alle Abschnitte gefüllt
- [x] CSS nur Tokens, Layer `components`, BEM
- [ ] `shopify theme check` grün (CLI nicht installiert, lesend geprüft)
- [ ] Formular auf dem Dev-Shop abgeschickt (V2, V4)
- [ ] **[RECHT-PRÜFEN]** Einwilligungstext geprüft
- [x] Metafelder: keine
