// Short-format content for the Jedlik Ányos Gimnázium pilot publication.
export const summaries = {
  a16: [
    'Egy közös programhoz kell egy ötlet, néhány önkéntes és egy hely.',
    'A fiatalok is segíthetnek abban, hogy minél többen értesüljenek róla.',
    'A legjobb ötletek közösen formálódnak.',
  ],
  a17: [
    'Tekercs, mágnes és egy izzó segítségével építettünk egyszerű dinamómodellt.',
    'A mágneses térben forgó vezetőhurokban feszültség keletkezik.',
    'A próbák során a tekercs menetszáma és a súrlódás is fontosnak bizonyult.',
  ],
  a18: [
    'A szakkör első robotja két motorral és egy távolságmérővel indult.',
    'A tesztek megmutatták, hol kell javítani az érzékelést és a programot.',
    'A robotika szakkörhöz előzetes tudás nélkül is lehet csatlakozni.',
  ],
  a19: [
    'Az iskolarádió heti lejátszási listáján ismert dalok és új felfedezések is vannak.',
    'A kérések között a diákok rövid szavazást tartanak.',
    'A technikai csapat új segítőket is vár.',
  ],
};

export const quotes = [
  { id: 'q1', articleId: 'a17', text: 'Az az igazi élmény, amikor a saját kezünkkel forgatott kerék felgyújt egy lámpát.', cite: 'A kísérletben részt vevő egyik diák' },
];

export const stories = [
  {
    id: 's1',
    slug: 'jedlik-a-muhelyben',
    title: 'Kísérletezés a Jedlikben',
    categoryId: 'technologia',
    authorId: 'gergo-n',
    schoolId: 'jedlik-anyos',
    date: '2026-10-18',
    articleId: 'a17',
    visibility: { school: true },
    slides: [
      { imageKey: 'jedlik-dinamo', caption: 'A dinamómodell első változatánál még alig villant fel az izzó.' },
      { imageKey: 'jedlik-robot', caption: 'A robotika szakkörben a programozást és az építést együtt próbálják ki.' },
      { imageKey: 'jedlik-radio', caption: 'Az iskolarádió technikai csapata a szünetekben is dolgozik.' },
    ],
  },
];
