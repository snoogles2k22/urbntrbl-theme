# ADR 0007: Installationen nur nach Scan und Freigabe

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Vor jeder Installation (npm-Paket, CLI, Shopify-App, Claude-Skill, Editor-Plugin):
Scan mit `nvidia-skillspector`, Risiko-Score im Chat nennen, auf explizites OK warten.
Ohne OK keine Installation. Das Repo hat null Dependencies und soll so bleiben.

## Begründung

- Supply-Chain-Risiko in npm ist real, ein Theme-Repo braucht fast nichts.
- Shopify-Apps injizieren CSS/JS in den Storefront und sind damit Teil der
  Angriffsfläche und der Portabilitätsfrage.
- Der Scan macht die Entscheidung explizit und nachvollziehbar.

## Konsequenzen

- Shopify CLI (bereits installiert, v5.0.1) und Node (v26) gelten als Basis.
  Updates davon werden ebenfalls angekündigt.
- Formatter/Linter (Prettier, Stylelint) sind bewusst nicht installiert. Formatierung
  per `.editorconfig`, Prüfung per `shopify theme check` (in der CLI enthalten).
