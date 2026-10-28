// Colors are used only as a small marker; every category is always also identified by its name.
export const categories = [
  { id: 'hirek', tile: { bg: '#2D3CF0', fg: '#FFFFFF' }, name: 'Hírek', color: '#2430C4', description: 'Ami az iskolákban és a diákok környezetében történik: rövid, pontos beszámolók.' },
  { id: 'kultura', tile: { bg: '#FF8FD0', fg: '#101426' }, name: 'Kultúra', color: '#A3257E', description: 'Könyvek, kiállítások, városi séták és minden, ami a fiatalok kulturális életét formálja.' },
  { id: 'zene', tile: { bg: '#7B4DFF', fg: '#FFFFFF' }, name: 'Zene', color: '#C2410C', description: 'Fesztiválok, koncertek, felfedezések és a hangok világa a színpad mindkét oldaláról.' },
  { id: 'film-es-sorozatok', tile: { bg: '#FFD23F', fg: '#101426' }, name: 'Film és sorozatok', color: '#6D32C9', description: 'Premierek, kedvencek és beszélgetések arról, miért érdemes újranézni vagy kihagyni valamit.' },
  { id: 'gaming', tile: { bg: '#D4F23A', fg: '#101426' }, name: 'Gaming', color: '#0B7A5B', description: 'Játékok, klubok és a digitális szórakozás értő szemmel.' },
  { id: 'technologia', tile: { bg: '#5FE0F0', fg: '#101426' }, name: 'Technológia', color: '#0A6C94', description: 'Mesterséges intelligencia, eszközök és újítások, amelyek a mindennapjainkat változtatják.' },
  { id: 'sport', tile: { bg: '#FF7A3D', fg: '#101426' }, name: 'Sport', color: '#2B7A1F', description: 'Iskolák közötti mérkőzések, edzések és a közösségi élmény a pálya szélén.' },
  { id: 'tudomany', tile: { bg: '#17C28B', fg: '#101426' }, name: 'Tudomány', color: '#8A5A00', description: 'Kísérletek, megfigyelések és diákprojektek, amelyek a világ működését magyarázzák.' },
  { id: 'velemeny', tile: { bg: '#E5383B', fg: '#FFFFFF' }, name: 'Vélemény', color: '#B4232C', description: 'Egyéni nézőpontok, amelyeket a szerzők saját véleményként vállalnak. Nyitott vita, nem hivatalos álláspont.' },
];
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
