// Content formats. Limits are DEFAULT values: they will be read from the `settings` collection later,
// so they can be changed by the teacher without touching the code.
export const FORMATS = {
  short_article: { id: 'short_article', label: 'Rövid cikk', description: 'Tömör írás egy témáról, eseményről vagy hírről.', defaultLimit: 3000 },
  poll: { id: 'poll', label: 'Szavazás', description: 'Rövid cikk egy kérdéssel, válaszlehetőségekkel és szavazási határidővel.', defaultLimit: 3000 },
  one_thought: { id: 'one_thought', label: 'Egy gondolat', description: 'Egy idézet vagy felismerés köré épített rövid írás.', defaultLimit: 1500 },
  visual_story: { id: 'visual_story', label: 'Képes történet', description: 'Képekből és rövid szövegekből álló vizuális történet.', defaultLimit: 2500 },
  opinion: { id: 'opinion', label: 'Vélemény', description: 'Egyéni nézőpont vagy álláspont egy kérdésről. Mindig a Vélemény rovatba kerül.', defaultLimit: 4000, fixedCategory: 'velemeny' },
};
export const FORMAT_LIST = Object.values(FORMATS);
