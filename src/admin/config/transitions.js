// Editorial workflow rules. The UI asks `availableActions()`, the data layer enforces `assertAllowed()`,
// and the Firestore rules enforce the same thing on the server (teacher-only publishing in particular).
const REVIEWER = ['editor', 'teacher'];

const act = (id, label, to, extra = {}) => ({ id, label, to, note: 'none', variant: 'secondary', ...extra });

export function availableActions(user, content) {
  const out = [];
  const s = content.status;
  const mine = content.authorId === user.uid;
  const reviewer = REVIEWER.includes(user.role);

  if (reviewer && (s === 'submitted' || s === 'editorial_review')) {
    if (s === 'submitted') out.push(act('start_review', 'Lektorálás megkezdése', 'editorial_review', { variant: 'primary' }));
    out.push(act('forward', 'Jóváhagyásra küldés a tanárnak', 'awaiting_teacher', { variant: s === 'submitted' ? 'secondary' : 'primary', note: 'optional' }));
    out.push(act('request_changes', 'Módosítást kérek', 'changes_requested', { note: 'required', feedback: true }));
    out.push(act('return_to_draft', 'Vissza piszkozatba', 'draft', { note: 'required', feedback: true }));
    out.push(act('withdraw', 'Visszavonás', 'withdrawn', { note: 'optional', danger: true }));
  }
  if (user.role === 'teacher' && s === 'awaiting_teacher') {
    out.push(act('publish', 'Jóváhagyás és közzététel', 'published', { variant: 'primary', note: 'optional' }));
    out.push(act('request_changes', 'Módosítást kérek', 'changes_requested', { note: 'required', feedback: true }));
    out.push(act('reject', 'Elutasítás / visszavonás', 'withdrawn', { note: 'required', feedback: true, danger: true }));
  }
  if (user.role === 'teacher' && s === 'published') out.push(act('unpublish', 'Közzététel visszavonása', 'withdrawn', { note: 'required', danger: true }));
  if (s === 'withdrawn' && (mine || user.role === 'teacher' || user.role === 'editor')) out.push(act('restore_to_draft', 'Visszaállítás a szerző piszkozatába', 'draft'));
  if (mine && ['draft', 'changes_requested', 'submitted'].includes(s)) out.push(act('author_withdraw', 'Visszavonom a tartalmat', 'withdrawn', { danger: true, note: 'none' }));
  return out;
}

export function assertAllowed(user, content, actionId) {
  const a = availableActions(user, content).find((x) => x.id === actionId);
  if (!a) throw new Error('Ez a művelet most nem engedélyezett.');
  return a;
}

// The author can edit their own content while it is a draft or while changes are requested.
export const canEditContent = (user, content) => content.authorId === user.uid && ['draft', 'changes_requested'].includes(content.status);
export const canSubmitContent = canEditContent;
