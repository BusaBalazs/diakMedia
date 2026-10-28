import { Navigate } from 'react-router-dom';
import SchoolPicker from '../components/SchoolPicker.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { useSchool } from '../lib/school.jsx';

// /iskola: opens the visitor's own school if one is saved, otherwise lets them choose.
export default function SchoolChooser() {
  const { mySchoolId } = useSchool();
  useDocumentTitle('Iskolai lapok');
  if (mySchoolId) return <Navigate to={`/iskola/${mySchoolId}`} replace />;
  return (
    <div className="theme-maxi chooser">
      <section className="masthead masthead--chooser torn">
        <div className="container masthead__inner">
          <div>
            <p className="masthead__label"><span className="sticker sticker--lime">Válassz iskolát</span></p>
            <h1 className="masthead__title">Iskolai lapok</h1>
            <p className="masthead__desc">Minden iskolának saját diáklapja van, saját hangulattal. Keresd meg az iskolád, és jelöld meg sajátként: legközelebb az Iskolai lap menü rögtön oda visz.</p>
          </div>
          <SchoolPicker variant="inline" label="Iskola keresése" />
        </div>
      </section>
    </div>
  );
}
