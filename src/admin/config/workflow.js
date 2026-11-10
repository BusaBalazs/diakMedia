// Editorial workflow statuses. `tone` maps to the badge colors in components/StatusBadge.jsx.
// A status is always shown with a label (never color alone).
export const STATUSES = {
  draft: { id: 'draft', label: 'Piszkozat', tone: 'neutral', hint: 'A szerző még dolgozik rajta.' },
  submitted: { id: 'submitted', label: 'Lektorálásra beküldve', tone: 'info', hint: 'A szerkesztőségre vár.' },
  editorial_review: { id: 'editorial_review', label: 'Szerkesztői lektorálás', tone: 'warn', hint: 'A szerkesztők éppen átnézik.' },
  changes_requested: { id: 'changes_requested', label: 'Módosítás kérve', tone: 'danger', hint: 'A szerzőnek javítania kell.' },
  awaiting_teacher: { id: 'awaiting_teacher', label: 'Tanári jóváhagyásra vár', tone: 'warn', hint: 'A tanár dönt a közzétételről.' },
  published: { id: 'published', label: 'Közzétéve', tone: 'ok', hint: 'Megjelent a nyilvános oldalon.' },
  withdrawn: { id: 'withdrawn', label: 'Visszavonva', tone: 'muted', hint: 'Nem kerül közzétételre.' },
};

// Order used in legends and boards.
export const WORKFLOW_ORDER = ['draft', 'submitted', 'editorial_review', 'changes_requested', 'awaiting_teacher', 'published', 'withdrawn'];
// Statuses an editor is allowed to see (drafts stay private to their author and the teacher).
export const NON_DRAFT_STATUSES = WORKFLOW_ORDER.filter((s) => s !== 'draft');
