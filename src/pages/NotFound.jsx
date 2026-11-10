import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../lib/hooks.js';

export default function NotFound() {
  useDocumentTitle('Nem található');
  return (
    <div className="container section">
      <div className="empty">
        <h1 className="empty__title">Ez az oldal nem található</h1>
        <p>A keresett cím nem létezik, vagy a cikk már nem érhető el.</p>
        <Link to="/" className="btn btn--primary">Vissza a kezdőlapra</Link>
      </div>
    </div>
  );
}
