# Brand assets

Source material for the Baumgertner identity. **Not served to the web** — nothing in this folder is deployed. Files the site actually uses live in `public/`, generated from the SVG sources here.

## Structure

| Folder | Contents |
|---|---|
| `svg/` | Vector masters. The source of truth for everything else. |
| `png/b-merkki/` | The `B` mark as raster, 128–2048px, black and white |
| `png/sanamerkki/` | Wordmark as raster, 300–4800px, black and white |
| `png/sanamerkki-suojatilalla/` | Wordmark with clear space baked in |
| `png/ikonit/` | Square app/favicon renders, 16–1024px |
| `png/taustalla/` | Logo locked onto a solid background |
| `png/sahkoposti/` | Email signature renders |
| `some/` | Social media templates, sized per platform |

## Geometry

Both marks are built on a 104×100 grid with a 12-unit stroke, a 20-unit outer radius and an 8-unit inner radius. The design system's radius scale (`4 / 10 / 20px`) is derived from these proportions.

The wordmark has an aspect ratio of roughly 19.3:1 — it is very wide. Give it room, and never set it below the width where the monoline strokes start to disappear.

## Colour

Pure black `#000000` and pure white `#FFFFFF` only. The mark is never tinted, never gradiated, and never given a glow or shadow.

## Using the marks in the app

Prefer inlining the SVG path as a React component with `fill="currentColor"` rather than referencing the black or white files directly. One component then works on any background and inherits colour from the design tokens, which is how a monochrome identity should behave.

## Web assets

`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `og-image.png` are generated from `svg/` into `public/`. Regenerate them from source rather than editing them by hand.
