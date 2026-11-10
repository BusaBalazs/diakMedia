// Shared class strings for buttons/links so every admin screen looks consistent.
const base = 'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const btnPrimary = `${base} bg-brand text-white hover:bg-brand-dark`;
export const btnSecondary = `${base} bg-surface text-ink border border-line hover:bg-canvas`;
export const linkAction = 'inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark hover:underline underline-offset-2';
export const card = 'bg-surface border border-line rounded-xl shadow-card';
export const input = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-brand';
export const inputError = 'border-danger focus:border-danger';
export const btnDanger = 'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors bg-surface text-danger-ink border border-danger/40 hover:bg-danger/5 disabled:opacity-50';
