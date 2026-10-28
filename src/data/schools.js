// All schools and publications are fictional demo content.
// Every school has its own publication and its own visual theme (used on the school page).
// DEMO_SCHOOL_ID is only the default context until the visitor picks "their" school.
export const DEMO_SCHOOL_ID = 'duna-parti';

export const schools = [
  {
    id: 'duna-parti', name: 'Duna-parti Gimnázium', city: 'Budapest', monogram: 'DG', color: '#2D3CF0',
    publication: { name: 'Partvonal', description: 'A Duna-parti Gimnázium diáklapja. Itt jelennek meg az iskolai élet hírei, interjúk, sportbeszámolók és a diákszerkesztőség saját témái. Egyes írásokat a szerzők az országos lapba is beküldenek.' },
    theme: { accentFg: '#FFFFFF', bg: '#FFD23F', fg: '#101426', accent: '#2D3CF0', accent2: '#FF8FD0', pattern: 'dots', radius: '0px', upper: false },
  },
  {
    id: 'jedlik-anyos', name: 'Jedlik Ányos Gimnázium', city: 'Budapest', monogram: 'JÁ', color: '#101426',
    publication: { name: 'Szikra', description: 'A Jedlik Ányos Gimnázium diáklapja: kísérletek, robotok, iskolarádió és minden, ami az iskolában szikrát vet. A legjobb írásokat az országos lapba is beküldjük.' },
    theme: { accentFg: '#101426', bg: '#101426', fg: '#FFFFFF', accent: '#D4F23A', accent2: '#5FE0F0', pattern: 'grid', radius: '0px', upper: true },
  },
  {
    id: 'hajnal-uti', name: 'Hajnal Úti Gimnázium', city: 'Debrecen', monogram: 'HÚ', color: '#B4232C',
    publication: { name: 'Hajnali Kiadás', description: 'A Hajnal Úti Gimnázium diáklapja. Korán kelő szerkesztőség, friss hírek, színjátszók, zenészek és sorozatrajongók.' },
    theme: { accentFg: '#FFFFFF', bg: '#FF7A3D', fg: '#101426', accent: '#101426', accent2: '#FFD23F', pattern: 'stripes', radius: '16px', upper: false },
  },
  {
    id: 'kekes', name: 'Kékes Szakgimnázium', city: 'Eger', monogram: 'KS', color: '#0B7A5B',
    publication: { name: 'Csúcsidő', description: 'A Kékes Szakgimnázium diáklapja: távcsövek, retro játékok, hegyi túrák és gyakorlatias, kíváncsi írások.' },
    theme: { accentFg: '#101426', bg: '#0B7A5B', fg: '#FFFFFF', accent: '#FFD23F', accent2: '#D4F23A', pattern: 'peaks', radius: '0px', upper: true },
  },
  {
    id: 'tisza-parti', name: 'Tisza-parti Technikum', city: 'Szeged', monogram: 'TT', color: '#6D32C9',
    publication: { name: 'Tiszavirág', description: 'A Tisza-parti Technikum diáklapja. Műhelyek, laborok, vitanapok és vélemények a folyó mellől.' },
    theme: { accentFg: '#101426', bg: '#7B4DFF', fg: '#FFFFFF', accent: '#5FE0F0', accent2: '#FF8FD0', pattern: 'rings', radius: '12px', upper: false },
  },
  {
    id: 'raba-menti', name: 'Rába Menti Gimnázium', city: 'Győr', monogram: 'RM', color: '#8A5A00',
    publication: { name: 'Hídfő', description: 'A Rába Menti Gimnázium diáklapja. Városi séták, kórus, vélemények és minden, ami a két part között történik.' },
    theme: { accentFg: '#FFFFFF', bg: '#FF8FD0', fg: '#101426', accent: '#2D3CF0', accent2: '#D4F23A', pattern: 'checks', radius: '0px', upper: false },
  },
  {
    id: 'balaton-felvidek', name: 'Balaton-felvidéki Gimnázium', city: 'Balatonfüred', monogram: 'BF', color: '#0A6C94',
    publication: { name: 'Hullámtörő', description: 'A Balaton-felvidéki Gimnázium diáklapja: tanösvények, vitorlások és a tó körüli élet diákszemmel.' },
    theme: { accentFg: '#101426', bg: '#5FE0F0', fg: '#101426', accent: '#FF7A3D', accent2: '#FFD23F', pattern: 'waves', radius: '22px', upper: false },
  },
];

export const schoolById = Object.fromEntries(schools.map((s) => [s.id, s]));
