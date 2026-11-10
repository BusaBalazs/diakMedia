import { useEffect, useState } from 'react';

export default function SpellcheckAssist({ value }) {
  const [words, setWords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const text = value.trim();
    if (!text) {
      setWords([]);
      setError('');
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        const { checkHungarianSpelling } = await import('../lib/hungarianSpellcheck.js');
        if (active) {
          setWords(checkHungarianSpelling(text));
          setError('');
        }
      } catch {
        if (active) setError('A magyar helyesírás-ellenőrzés most nem érhető el.');
      }
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [value]);

  if (error) return <p role="status" className="text-xs text-danger-ink">{error}</p>;
  if (!words.length) return null;
  return (
    <p role="status" className="text-xs text-warn-ink">
      Lehetséges elírás{words.length > 1 ? 'ok' : ''}: <strong>{words.join(', ')}</strong>. Nevek és szakszavak is szerepelhetnek köztük.
    </p>
  );
}
