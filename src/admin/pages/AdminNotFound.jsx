import { Link } from 'react-router-dom';
import { btnSecondary, card } from '../components/ui.js';

export default function AdminNotFound() {
  return (
    <div className={`${card} p-8 max-w-xl`}>
      <h1 className="text-lg font-semibold">Az oldal nem található</h1>
      <p className="mt-1 text-sm text-muted">Ez az admin oldal nem létezik.</p>
      <Link to="/admin" className={`${btnSecondary} mt-4`}>Vissza az irányítópultra</Link>
    </div>
  );
}
