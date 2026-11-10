# DiákMédia: Jedlik pilot

A React + Vite pilot of the DiákMédia editorial platform for the Jedlik Ányos Gimnázium.
The public site uses the existing landing-page design as the single publication view; separate school themes and multi-school browsing are deferred.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

Vite's dev and preview servers fall back to `index.html`, so refreshing a nested route (for example `/cikk/...`) works.
For static hosting, configure the host to rewrite unknown paths to `index.html`.

## Routes

| Path | View |
| --- | --- |
| `/` | The Szikra landing page with latest articles, polls, short formats and categories |
| `/kategoriak`, `/kategoria/:id` | Category index and category-filtered articles |
| `/cikk/:slug` | Article detail, driven entirely by article data |
| `/tartalom/:id` | A közzétett szerkesztőségi tartalom teljes oldala |
| `/felperc` | Régi hivatkozás; a címlapra irányít |
| `/kereses?q=` | Search within the Szikra articles |

Legacy `/iskola/*` and `/orszagos` links redirect to the pilot homepage.

## Publication

The only public school in the pilot is the Jedlik Ányos Gimnázium (`jedlik-anyos`); its student publication is Szikra.
Article and short-format demo data are limited to that publication. The pilot site's branding and visual language use the existing landing-page design rather than a separate school theme.

## Admin

The editorial admin interface lives at `/admin` (see `ADMIN.md`). It is isolated from the public site.
Text fields in the editor use a local Hungarian Hunspell dictionary to flag possible misspellings; names and technical terms may also be flagged.

The homepage shows the sample articles and published admin content using the same card designs as the admin card preview.

## Likes and sharing (demo)

Likes are stored in `localStorage` only. The share buttons open a modal with a generated post preview, caption and link,
and simulate a successful post. Nothing is sent to any social network.

## Typography

Montserrat 900 (titles), Montserrat 800 (subtitles), Inter 400 to 600 (body and navigation) and Permanent Marker for
handwritten stickers, all bundled through Fontsource. Permanent Marker has no glyphs for ő and ű, so avoid those
letters in sticker texts (the font stack falls back to Montserrat).

## Where to change things

- Brand name, tagline and notices: `src/data/brand.js`
- Articles, school, authors and categories: `src/data/`
- Images: `src/data/images.js` (the single mapping from image keys to files and alt texts). Files live in `public/assets/`.
  A missing or broken image falls back to a branded placeholder with the same aspect ratio.
- Design tokens (colors, type, spacing): `src/styles/tokens.css`

## Images

The landing hero uses the supplied background collage (`public/assets/landing-bg.webp`, converted from the PNG).
Article images are abstract SVG illustrations made for the project (no photographs of real people). To use real artwork, drop files into `public/assets/` and update `src/data/images.js`.

The public pilot and editorial admin share the Jedlik school ID. The public home page also reads published polls from the admin repository. Photo-story viewer support remains available for future Szikra stories.
