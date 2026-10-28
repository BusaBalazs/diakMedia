import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEMO_SCHOOL_ID, schoolById } from '../data/schools.js';

// "My school": chosen by the visitor and remembered in the browser (localStorage, optional).
// Until a school is chosen, the demo school is used as the default context for mixed views.
const KEY = 'diakmedia.mySchool';
const SchoolContext = createContext(null);

function readStored() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v && schoolById[v] ? v : null;
  } catch {
    return null;
  }
}

export function SchoolProvider({ children }) {
  const [mySchoolId, setId] = useState(readStored);
  const setMySchool = useCallback((id) => {
    setId(id);
    try {
      if (id) window.localStorage.setItem(KEY, id);
      else window.localStorage.removeItem(KEY);
    } catch { /* storage may be unavailable; the choice then lasts only for this visit */ }
  }, []);
  const value = useMemo(() => {
    const activeSchoolId = mySchoolId || DEMO_SCHOOL_ID;
    return { mySchoolId, mySchool: mySchoolId ? schoolById[mySchoolId] : null, setMySchool, activeSchoolId, activeSchool: schoolById[activeSchoolId] };
  }, [mySchoolId, setMySchool]);
  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  return useContext(SchoolContext);
}
