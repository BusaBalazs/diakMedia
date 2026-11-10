import { Icon } from './Icons.jsx';

const STEPS = ['Tartalom', 'Kártya', 'Beküldés'];

// Two-step creation (content first, card second) followed by the submission.
export default function Steps({ current }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="A készítés lépései">
      {STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'now' : 'todo';
        return (
          <li key={s} className="flex items-center gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${state === 'done' ? 'bg-brand text-white' : state === 'now' ? 'bg-brand-soft text-brand-dark ring-2 ring-brand' : 'bg-gray-100 text-muted'}`}>
              {state === 'done' ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className={state === 'now' ? 'font-semibold text-ink' : 'text-muted'}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-5 bg-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
