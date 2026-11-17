# ADR 0003: Vanilla JS, Web Components, API-Adapter

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Interaktive Komponenten sind Custom Elements mit Präfix `ut-`, ES-Module, kein
Bundler, kein Framework. Jeder Zugriff auf die Plattform (Cart, Produkt, Suche) läuft
über `assets/ut-api.js`. Elemente importieren nur dieses Modul und kennen keine
Shopify-Endpunkte. Events sind namespaced: `ut:<element>:<event>`.

## Begründung

- Web Components laufen in Shopify (Liquid rendert das Markup, das Element hängt sich
  dran) und in Next.js (als Client-Modul geladen, oder die Logik wird in einen Hook
  überführt). In beiden Fällen bleibt das Verhalten laut Spec identisch.
- Der Adapter ist die einzige Datei mit Plattformwissen. Beim Port wird sie durch
  eine Medusa-Implementierung mit gleichem Interface ersetzt. Elemente bleiben.
- Progressive Enhancement: Liquid rendert funktionierendes HTML (Formulare, Links),
  das Element veredelt. Ohne JS gibt es keine toten Buttons.
- Kein Bundler, weil Shopify Assets direkt ausliefert und HTTP/2 Multiplexing die
  Kosten mehrerer kleiner Module trägt.

## Konsequenzen

- Keine Dependencies. Wer eine braucht, schreibt ein ADR und folgt ADR 0007.
- Kein globales `window.*`-Objekt. Zugriff ausschließlich per `import { cart } from 'ut-api.js'`.
- Section Rendering API (Shopify) wird in einem eigenen Adapter-Teil gekapselt, sobald
  sie gebraucht wird (Variant Picker, Cart Drawer).
