// Fictional authors. Only a first name and a surname initial are shown, to keep personal data to a minimum.
export const authors = [
  { id: 'dora-k', name: 'Dóra K.', grade: '11.B', schoolId: 'duna-parti' },
  { id: 'bence-t', name: 'Bence T.', grade: '10.A', schoolId: 'duna-parti' },
  { id: 'nora-f', name: 'Nóra F.', grade: '12.C', schoolId: 'duna-parti' },
  { id: 'mate-v', name: 'Máté V.', grade: '11.A', schoolId: 'hajnal-uti' },
  { id: 'lili-h', name: 'Lili H.', grade: '10.B', schoolId: 'hajnal-uti' },
  { id: 'reka-s', name: 'Réka S.', grade: '11.B', schoolId: 'kekes' },
  { id: 'zalan-p', name: 'Zalán P.', grade: '12.A', schoolId: 'kekes' },
  { id: 'panna-m', name: 'Panna M.', grade: '10.C', schoolId: 'raba-menti' },
  { id: 'adam-g', name: 'Ádám G.', grade: '11.D', schoolId: 'raba-menti' },
  { id: 'eszter-b', name: 'Eszter B.', grade: '11.C', schoolId: 'tisza-parti' },
  { id: 'kristof-l', name: 'Kristóf L.', grade: '12.B', schoolId: 'tisza-parti' },
  { id: 'gergo-n', name: 'Gergő N.', grade: '11.A', schoolId: 'jedlik-anyos' },
  { id: 'anna-j', name: 'Anna J.', grade: '12.B', schoolId: 'jedlik-anyos' },
  { id: 'peter-o', name: 'Péter O.', grade: '10.C', schoolId: 'jedlik-anyos' },
  { id: 'vivi-b', name: 'Vivi B.', grade: '11.B', schoolId: 'balaton-felvidek' },
  { id: 'soma-t', name: 'Soma T.', grade: '10.A', schoolId: 'balaton-felvidek' },
];
export const authorById = Object.fromEntries(authors.map((a) => [a.id, a]));
