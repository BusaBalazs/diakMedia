import { useEffect, useId, useState } from 'react';
import { getRepository } from '../../admin/data/repository.js';
import './poll.css';

const emptyState = (poll) => ({ counts: (poll.options || []).map(() => 0), votedOptionIndex: null });
const endTime = (value) => value ? new Date(value.toDate ? value.toDate() : value).getTime() : Number.NaN;
const ended = (value, now) => !Number.isFinite(endTime(value)) || endTime(value) <= now;

export default function PollWidget({ pollId, poll, active = false, interactive = true }) {
  const [state, setState] = useState(() => emptyState(poll));
  const [loading, setLoading] = useState(Boolean(active));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const closed = ended(poll.endsAt, now);
  const showResults = active && closed;
  const options = poll.options || [];
  const total = state.counts.reduce((sum, count) => sum + count, 0);

  useEffect(() => { setExpanded(false); }, [pollId]);

  useEffect(() => {
    let alive = true;
    if (!active) { setState(emptyState(poll)); setLoading(false); return () => { alive = false; }; }
    setLoading(true);
    setError('');
    getRepository()
      .then((repo) => repo.getPollState(pollId, poll))
      .then((result) => { if (alive) setState(result); })
      .catch((err) => { if (alive) setError(err.message || 'A szavazás eredménye nem tölthető be.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [active, pollId, poll]);

  useEffect(() => {
    const remaining = endTime(poll.endsAt) - now;
    if (!active || remaining <= 0 || !Number.isFinite(remaining)) return undefined;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(remaining + 25, 2147483647));
    return () => window.clearTimeout(timer);
  }, [active, poll.endsAt, now]);

  const vote = async (optionIndex) => {
    setBusy(true);
    setError('');
    try {
      const repo = await getRepository();
      setState(await repo.votePoll(pollId, optionIndex));
    } catch (err) {
      setError(err.message || 'A szavazat mentése nem sikerült.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="poll-widget" aria-label="Szavazás">
      <h4 className="poll-widget__question">
        <button type="button" className="poll-widget__toggle" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded((value) => !value)}>
          <span>{poll.question}</span>
          <span className="poll-widget__toggle-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false"><path d="m5 9 7 7 7-7" /></svg>
          </span>
        </button>
      </h4>
      <div id={detailsId} className="poll-widget__details" hidden={!expanded}>
        {showResults && <p className="poll-widget__result-title">A szavazás eredménye:</p>}
        <ol className="poll-widget__options">
          {options.map((option, index) => {
            const count = state.counts[index] || 0;
            const percentage = total ? Math.round((count / total) * 100) : 0;
            const canVote = active && interactive && !closed && state.votedOptionIndex === null && !loading;
            return (
              <li key={`${index}-${option}`} className="poll-widget__option">
                <button type="button" className="poll-widget__choice" disabled={!canVote || busy} aria-pressed={state.votedOptionIndex === index} onClick={() => vote(index)}>
                  <span>{option}</span>
                  <span className="poll-widget__count">{loading ? '…' : `${percentage}% · ${count}`}</span>
                </button>
                <div className="poll-widget__track" role="progressbar" aria-label={`${option}: ${percentage}%`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                  <span className="poll-widget__bar" style={{ width: `${percentage}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
        {error && <p className="poll-widget__error" role="alert">{error}</p>}
        {state.votedOptionIndex !== null && !showResults && <p className="poll-widget__message" role="status">Köszönjük, a szavazatodat rögzítettük.</p>}
        {!active && <p className="poll-widget__message">A szavazás publikálás után indul.</p>}
        {active && !interactive && <p className="poll-widget__message">Előnézet – itt nem adható le szavazat.</p>}
        {showResults && !loading && <p className="poll-widget__message">A szavazás lezárult.</p>}
        {poll.endsAt && <p className="poll-widget__deadline">Lezárás: {new Date(poll.endsAt.toDate ? poll.endsAt.toDate() : poll.endsAt).toLocaleString('hu-HU')}</p>}
      </div>
    </section>
  );
}
