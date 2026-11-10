import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SectionHeader } from '../components/Parts.jsx';
import { SUGGESTION_CATEGORIES } from '../data/suggestions.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { usePublicAuth } from '../lib/publicAuth.jsx';

const INITIAL_FORM = { category: 'topic_idea', title: '', text: '' };

export default function StudentSuggestionPage() {
  const { user } = usePublicAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const simulationTimer = useRef(null);
  useDocumentTitle('Diákjavaslat');

  useEffect(() => () => window.clearTimeout(simulationTimer.current), []);

  if (!user) return <Navigate to="/belepes?cel=%2Fdiakjavaslat" replace />;

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage({ tone: 'error', text: 'Adj címet a javaslatnak.' });
      return;
    }

    setBusy(true);
    setMessage(null);
    simulationTimer.current = window.setTimeout(() => {
      setForm(INITIAL_FORM);
      setBusy(false);
      setMessage({ tone: 'success', text: 'Köszönjük! Ez most csak szimuláció volt: a javaslatot nem mentettük el, és nem küldtük el a szerkesztőségnek.' });
    }, 500);
  };

  return (
    <div className="theme-maxi suggestion-page">
      <section className="section container" aria-label="Diákjavaslat beküldése">
        <SectionHeader
          kicker="A te ötleted is számít"
          kickerTone="pink"
          title="Erről nem kéne lemaradni!"
          description="Küldj témaötletet, fotójavaslatot vagy ajánlót a szerkesztőségnek."
        />
        <div className="suggestion-layout">
          <form className="suggestion-form" onSubmit={submit} aria-label="Új diákjavaslat">
            <span className="sticker sticker--lime suggestion-form__sticker">Dobd be az ötleted!</span>
            <h2 id="suggestion-title" className="suggestion-form__title">Miről olvasnál?</h2>
            <label className="suggestion-field" htmlFor="suggestion-category">
              <span>Típus <span aria-hidden="true">*</span></span>
              <select id="suggestion-category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {Object.entries(SUGGESTION_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="suggestion-field" htmlFor="suggestion-title-input">
              <span>Cím <span aria-hidden="true">*</span></span>
              <input id="suggestion-title-input" type="text" required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              <span className="suggestion-field__counter" aria-live="polite">{form.title.length}/120</span>
            </label>
            <label className="suggestion-field" htmlFor="suggestion-details">
              <span>Részletek <span className="suggestion-field__optional">(nem kötelező)</span></span>
              <textarea id="suggestion-details" rows={5} maxLength={500} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} />
              <span className="suggestion-field__counter" aria-live="polite">{form.text.length}/500</span>
            </label>
            <button type="submit" className="btn btn--pill suggestion-form__submit" disabled={busy}>
              {busy ? 'Küldés szimulálása…' : 'Javaslat elküldése'}
            </button>
            {message && <p className={`suggestion-form__message suggestion-form__message--${message.tone}`} role={message.tone === 'error' ? 'alert' : 'status'}>{message.text}</p>}
          </form>
          <aside className="suggestion-note">
            <span className="sticker sticker--yellow">Fontos!</span>
            <h2>Ez egy próbaűrlap</h2>
            <p>A beküldés jelenleg csak szimulált. Nincs mögötte regisztráció vagy háttérrendszer, ezért az ötleted nem kerül mentésre és nem jut el a szerkesztőséghez.</p>
            <p>Ne írj be személyes adatot!</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
