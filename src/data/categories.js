// Colors are used only as a small marker; every category is always also identified by its name.
export const categories = [
  {
    id: "hirek",
    tile: { bg: "#2D3CF0", fg: "#FFFFFF" },
    name: "Hírek",
    color: "#2430C4",
    description:
      "Ami az iskolákban és a diákok környezetében történik: rövid, pontos beszámolók.",
  },
  {
    id: "kultura",
    tile: { bg: "#FF8FD0", fg: "#101426" },
    name: "Kultúra",
    color: "#A3257E",
    description:
      "kiállítások, színház, városi séták és minden, ami a fiatalok kulturális életét formálja.",
  },
  {
    id: "zene",
    tile: { bg: "#7B4DFF", fg: "#FFFFFF" },
    name: "Zene",
    color: "#C2410C",
    description:
      "Fesztiválok, koncertek, felfedezések és a hangok világa a színpad mindkét oldaláról.",
  },
  {
    id: "film-es-sorozatok",
    tile: { bg: "#D99058", fg: "#FFFFFF" },
    name: "Film és sorozatok",
    color: "#C2410C",
    description:
      "Premierek, kedvencek és beszélgetések arról, miért érdemes újranézni vagy kihagyni valamit.",
  },
  {
    id: "gaming",
    tile: { bg: "#D4F23A", fg: "#101426" },
    name: "Gaming",
    color: "#0B7A5B",
    description: "Játékok, klubok és a digitális szórakozás értő szemmel.",
  },
  {
    id: "book",
    tile: { bg: "#00FFFF", fg: "#101426" },
    name: "Könyvajánló",
    color: "#00FFFF",
    description: "Könyvek, képregények és minden, ami a nyomtatott vagy digitális olvasmányélményt gazdagítja.",
  },
  {
    id: "technologia",
    tile: { bg: "#5FE0F0", fg: "#101426" },
    name: "Technológia",
    color: "#0A6C94",
    description:
      "Mesterséges intelligencia, eszközök és újítások, amelyek a mindennapjainkat változtatják.",
  },
  {
    id: "sport",
    tile: { bg: "#FF7A3D", fg: "#101426" },
    name: "Sport",
    color: "#2B7A1F",
    description:
      "Iskolák közötti mérkőzések, edzések és a közösségi élmény a pálya szélén.",
  },
  {
    id: "tudomany",
    tile: { bg: "#17C28B", fg: "#101426" },
    name: "Tudomány",
    color: "#8A5A00",
    description:
      "Kísérletek, megfigyelések és diákprojektek, amelyek a világ működését magyarázzák.",
  },
  {
    id: "szavazas",
    tile: { bg: "#16866F", fg: "#FFFFFF" },
    name: "Szavazás",
    color: "#0B6554",
    description:
      "Kérdések és válaszlehetőségek, amelyekben az olvasók is elmondhatják a véleményüket.",
  },
  {
    id: "egy-gondolat",
    tile: { bg: "#FFD23F", fg: "#101426" },
    name: "Egy gondolat",
    color: "#8A5A00",
    description: "Idézetek, felismerések és rövid gondolatok.",
  },
  {
    id: "kepes-tortenet",
    tile: { bg: "#7B4DFF", fg: "#FFFFFF" },
    name: "Képes történet",
    color: "#5526C7",
    description: "Képekkel és rövid feliratokkal elmesélt történetek.",
  },
  {
    id: "velemeny",
    tile: { bg: "#E5383B", fg: "#FFFFFF" },
    name: "Vélemény",
    color: "#B4232C",
    description:
      "Egyéni nézőpontok, amelyeket a szerzők saját véleményként vállalnak. Nyitott vita, nem hivatalos álláspont.",
  },
];
export const categoryById = Object.fromEntries(
  categories.map((c) => [c.id, c]),
);
