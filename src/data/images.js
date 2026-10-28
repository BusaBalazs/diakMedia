// Central image mapping. To replace an artwork, drop a file into /public/assets and change `file` here.
// Components never reference file names directly. A missing image falls back to a branded placeholder.
const base = `${import.meta.env.BASE_URL}assets/`;

const def = (file, alt, position = '50% 50%') => ({ src: base + file, alt, position });

export const images = {
  'ai-tanulas': def('ai-tanulas.svg', 'Elvont, kék és sárga grafika: összekapcsolódó pontokból álló hálózat egy nagy sárga kör körül.', '60% 50%'),
  'ai-tanulas-2': def('ai-tanulas-2.svg', 'Sötét hátterű illusztráció kék körrel és sárga pontokból álló hálózattal.'),
  'hullamhossz-felkeszules': def('hullamhossz-felkeszules.svg', 'Rózsaszín hátterű grafika: sárga nap és sötét hangsávok, mint egy hangszínpad sziluettje.'),
  'hullamhossz-2': def('hullamhossz-2.svg', 'Sötét grafika narancssárga nappal és színes hangsávokkal.'),
  'iskolak-tornaja': def('iskolak-tornaja.svg', 'Zöld sportpálya vonalai és egy sárga labda elvont ábrázolása.', '50% 40%'),
  'torna-2': def('torna-2.svg', 'Kék pályagrafika fehér vonalakkal és zöld labdával.'),
  'ejszakai-egbolt': def('ejszakai-egbolt.svg', 'Éjszakai égbolt csillagokkal, sárga bolygóval és pályagyűrűkkel.', '62% 50%'),
  'egbolt-2': def('egbolt-2.svg', 'Sötét ég rózsaszín holddal és kékeszöld pályagyűrűkkel.'),
  'uj-ter': def('uj-ter.svg', 'Sárga hátterű grafika beszélgetést jelképező színes szövegbuborékokkal.'),
  'gyori-udvarok': def('gyori-udvarok.svg', 'Színes boltívek sora, belső udvarok és kapualjak elvont ábrázolása.', '50% 100%'),
  'sorozat-ujranezes': def('sorozat-ujranezes.svg', 'Sötét grafika filmkockákkal és vetítősugárral.'),
  'szinpad-mogott': def('szinpad-mogott.svg', 'Színpadi fénycsóvák sötét háttéren, alul hangtechnikai elemek sziluettjével.'),
  'hulladekmentes-fesztival': def('hulladekmentes-fesztival.svg', 'Zöld levelekből álló kör, a fenntarthatóság elvont jelképe.'),
  'pixel-klub': def('pixel-klub.svg', 'Pixelekből kirakott, retro játékokat idéző űrlény sötét háttéren.'),
  'telefonmentes-szunet': def('telefonmentes-szunet.svg', 'Egy áthúzott kör egy okostelefon képernyőjén, rózsaszín háttéren.'),
  'diakparlament-viz': def('diakparlament-viz.svg', 'Félkörben elhelyezett színes pontok, mint egy ülésterem, alatta kék hullámvonalak.'),
  'konyvtaros-interju': def('konyvtaros-interju.svg', 'Különböző színű könyvgerincek sora egy polcon.', '50% 70%'),
  'reggeli-edzes': def('reggeli-edzes.svg', 'Felkelő nap egy pálya vonalai és egy kosárlabdagyűrű fölött.'),
  '3d-nyomtato': def('3d-nyomtato.svg', 'Kék kockákból álló izometrikus alakzatok, a 3D nyomtatás jelképei.'),
  'jedlik-dinamo': def('jedlik-dinamo.svg', 'Sötét grafika egy forgórész-kerékkel és villámmal: a dinamó elvont ábrázolása.'),
  'jedlik-robot': def('jedlik-robot.svg', 'Kék és zöld színű, játékos robot elvont ábrázolása világos háttéren.'),
  'jedlik-radio': def('jedlik-radio.svg', 'Koncentrikus körök rózsaszín háttéren, mint egy rádióhullám.'),
  'jedlik-varos': def('jedlik-varos.svg', 'Város sziluettje naplementekor, színes épületekkel és a folyóval.', '50% 80%'),
  'hajnal-szinjatszo': def('hajnal-szinjatszo.svg', 'Színházi függönyök és boltívek meleg, vörös-arany színekben.', '50% 100%'),
  'kekes-tura': def('kekes-tura.svg', 'Rétegzett, zöld hegyvonulatok egy sárga nap előtt.', '50% 70%'),
  'tisza-mikroszkop': def('tisza-mikroszkop.svg', 'Mikroszkóp lencséje alatt látható, színes sejtszerű foltok.'),
  'raba-kor': def('raba-kor.svg', 'Kottavonalak és színes hangjegyek sárga háttéren.'),
  'balaton-tanosveny': def('balaton-tanosveny.svg', 'Zöld dombok és egy narancssárga nap egy tanösvény fölött.', '50% 70%'),
  'balaton-vitorlas': def('balaton-vitorlas.svg', 'Vitorlások a hullámzó vízen, egy sárga nap alatt.'),
};

export function getImage(key) {
  return images[key] || null;
}
