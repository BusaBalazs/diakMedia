# DiákMédia: interactive prototype

A React + Vite prototype of a nationwide student media platform, built for a Hungarian school principal.
All UI text and article content are in Hungarian. Every school, author and article is fictional demo content.

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
| `/` | Home (hero, latest, categories, nationwide band, school band, shared topic) |
| `/iskola` | Opens the visitor's saved school, or shows the school chooser (live-filtering search) |
| `/iskola/:id` | One school's own publication, each with its own palette, pattern and shape language |
| `/orszagos` | Nationwide publication with category and school filters |
| `/kategoriak`, `/kategoria/:id` | Category index and the reusable category page (`?lap=orszagos\|iskolai\|mind`) |
| `/cikk/:slug` | Article detail, driven entirely by article data |
| `/tema/:slug` | Shared topic page (several schools, one subject) |
| `/kereses?q=` | Search (title, excerpt, category, school, city, author, tags) |

## Publication model

Each article in `src/data/articles.js` has one owner school and explicit visibility:

```js
schoolId: 'duna-parti',
visibility: { school: true, national: true }
```

`src/lib/content.js` turns this into three scopes: `national`, `school` (only the demo school's own articles that
are visible in its publication) and `all` (the union). An article visible in both places is still one record, and
keeps its original author and school everywhere. Articles that belong only to another school are never shown.

## School pages and "my school"

Every school in `src/data/schools.js` has its own publication name and a `theme` (colors, pattern, corner radius,
title case). The school hero contains a search field that narrows the list of schools on every keystroke (name, city,
publication name, accents ignored). The button "Ez a saját iskolám" saves the school in `localStorage`
(`diakmedia.mySchool`); from then on the *Iskolai lap* menu opens that school directly, while the search stays in the hero.
The saved school also decides which school publication is mixed into the home page and the "Mind" scope of category and
search pages.

## Typography

Montserrat 900 (titles), Montserrat 800 (subtitles), Inter 400 to 600 (body and navigation) and Permanent Marker for
handwritten stickers, all bundled through Fontsource. Permanent Marker has no glyphs for ő and ű, so avoid those
letters in sticker texts (the font stack falls back to Montserrat).

## Where to change things

- Brand name, tagline and notices: `src/data/brand.js`
- Articles, schools, authors, categories, topics: `src/data/`
- Images: `src/data/images.js` (the single mapping from image keys to files and alt texts). Files live in `public/assets/`.
  A missing or broken image falls back to a branded placeholder with the same aspect ratio.
- Design tokens (colors, type, spacing): `src/styles/tokens.css`

## Images

The landing hero uses the supplied background collage (`public/assets/landing-bg.webp`, converted from the PNG).
Article images are abstract SVG illustrations made for the project (no photographs of real people). To use real artwork, drop files into `public/assets/` and update `src/data/images.js`.

## Scope notes

No backend, login, submission form, moderation or comments exist in this prototype; the footer says so.
Typefaces (Bricolage Grotesque and Newsreader) are bundled locally through Fontsource, so no network requests are
made at runtime. Card-wide click targets use a stretched link (`.card__link::after`), the only intentional
use of `position: absolute` besides the media layout.
