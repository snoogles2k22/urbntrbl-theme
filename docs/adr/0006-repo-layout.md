# ADR 0006: Repo-Layout, Shopify im Root, portable Teile daneben

**Status:** gültig · **Datum:** 2026-11-17

## Entscheidung

Die acht Shopify-Ordner (`assets`, `blocks`, `config`, `layout`, `locales`,
`sections`, `snippets`, `templates`) liegen im Repo-Root. Alles Portable liegt in
`design/` (Tokens, Specs), `docs/` (ADRs, Registry, Portabilität) und `scripts/`.

## Begründung

- Shopify CLI und die GitHub-Integration erwarten die Theme-Ordner im Root (oder
  brauchen `--path`). Root ist der Weg des geringsten Widerstands.
- Shopify ignoriert unbekannte Ordner beim Push. `design/`, `docs/`, `scripts/`
  stören nicht und landen nicht im Shop.
- Beim Port wird ein neues Repo (oder Monorepo-Paket) angelegt, `design/`, `docs/`
  und `scripts/` werden kopiert, die Shopify-Ordner nicht.

## Konsequenzen

- Kein Monorepo jetzt. Wenn der Port startet, wird entschieden, ob das Theme ein
  Paket in einem Monorepo wird oder archiviert.
- `.shopifyignore` dokumentiert explizit, was nicht in den Shop gehört.
