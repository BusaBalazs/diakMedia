# DiákMédia admin (editorial workspace)

Lives at `/admin` inside the same Vite app as the public site, but is completely separate from it.

## Integration with the public site
- Routes: `src/App.jsx` mounts `admin/*` outside the public `Layout`; `src/admin/AdminApp.jsx` is lazy-loaded. Published polls are loaded by the homepage through the shared repository.
- Styles: Tailwind is configured with `important: '.admin-scope'` and **no preflight**, so no utility or reset can reach
  the public pages. Poll presentation styles are separately scoped to the poll component.
- Code: nothing in `src/admin` imports public components or CSS (only public *data* such as categories).
  The Firebase SDK is only downloaded when `/admin` is opened and Firebase is configured.

## Structure
```
src/admin/
  AdminApp.jsx          routes, auth guard, scoped root
  admin.css             Tailwind + scoped base styles
  config/               workflow statuses, content formats, roles/permissions, navigation
  auth/                 AuthContext (dev switcher / Firebase Auth), login, no-access screen
  data/                 repository.js (selects the data source), firestoreRepository.js, devRepository.js, devSeed.js
  firebase/client.js    lazy Firebase init from VITE_FIREBASE_* variables
  layout/               AdminLayout, Sidebar (desktop + drawer), UserMenu
  components/           StatusBadge, Icons, shared parts (PageHeader, EmptyState, ErrorNotice, ComingSoon, ...)
  pages/                Dashboard, placeholders (content, new content, detail, suggestions, team, settings)
```

## Routes
`/admin` dashboard · `/admin/tartalmak` content · `/admin/tartalmak/uj` new content · `/admin/tartalmak/:id` detail ·
`/admin/javaslatok` suggestions · `/admin/szerkesztoseg` team · `/admin/beallitasok` settings · `/admin/belepes` login (Firebase mode)

## Development mode vs Firebase
Without Firebase variables the admin runs on a clearly marked **temporary development data layer** (`data/devSeed.js`,
fictional data, role switcher in the user menu). Components only talk to `getRepository()`, so nothing in the UI changes
when Firebase is connected.

To connect Firebase:
1. Create a Firebase project; enable Authentication (Email/Password and Anonymous), Firestore and (later) Storage.
2. Copy `.env.example` to `.env` and fill in the web app config.
3. Create documents: `schools/{id}` { name, city, publicationName }, `users/{uid}` { displayName, role: teacher|editor|author, schoolId }.
4. Deploy `firestore.rules` (draft, **not yet tested in the emulator**) and test them before using real data.
5. Content documents: schoolId, authorId, authorName, title, format, category, contentData, cardData, status,
   createdAt, updatedAt, submittedAt, publishedAt (`authorName` is denormalised for list views). Poll ballots are
   stored separately in `pollVotes`; anonymous Authentication must be enabled for public voting.

## Features
- **Content editor** (`/admin/tartalmak/uj`, `/:id/szerkeszt`): format chooser, then only the fields of that format
  (short article, poll, one thought, visual story, opinion), category rule (opinion is locked to the Opinion category),
  live character counters (field limits + a total limit per format, configurable by the teacher in *Beállítások*),
  image upload (compressed in the browser; Firebase Storage in Firebase mode), reorderable story images,
  full-article preview, draft saving, unsaved-changes warning.
- **Card editor** (`/:id/kartya`): the card is prefilled from the content title and introduction, then edited separately
  (title, description). Teachers can publish directly or submit for editorial review. Live preview, desktop and mobile, rendered with the *public site's own components and styles*
  (`src/components/publication/`). If the article title or featured image changes later, the card is never overwritten
  silently: the editor gets a warning with explicit choices.
- **Workflow**: board with role-specific queues (teachers see teacher-approval items in their editorial-review queue), search and filters, review page with
  the card and full-content preview, withdrawn content can be restored to the author's drafts, role-based actions (`config/transitions.js`), mandatory reason for change requests,
  internal notes (hidden from authors) and author-visible feedback. Only the teacher can publish.
- **Téma javaslat** (`/admin/temajavaslat`, all editorial members): anyone in the editorial team can suggest an idea;
  editors and teachers can process or discard it, or assign it to an editor/author. Assignment atomically creates a short-article
  draft in that member's account. Editors and teachers can reassign a draft while it is still in draft status; teachers cannot
  be selected as assignees. Published content removes its linked idea from the list; withdrawn content frees the idea again.
- **Diákjavaslatok**: every user can send suggestions; editors/teachers triage them (interesting, more info needed, set
  aside, unsuitable) with notes, and can start a content item from one.
- **Szerkesztőség** (members) and **Beállítások** (character limits).

## Security
`firestore.rules` and `storage.rules` are included (drafts, **not yet tested with the emulator**). Publication approval is
enforced there: only a teacher may write `status: 'published'`; editors may only change workflow fields, except draft reassignment
and creation of a topic-assigned draft for a non-teacher school member.

## Not done yet
- The public site does not yet include all published CMS articles in its regular article feeds. Published polls are shown on the homepage and can be voted on once per signed-in or anonymous Firebase user; results are shown after the configured closing time.
- Category customization, member management UI, push/email notifications.
