// TEMPORARY DEVELOPMENT DATA. Used only while Firebase is not configured (see data/repository.js).
// Everything here is fictional. The shapes mirror the Firestore documents exactly,
// so switching to Firebase does not require any UI change.
import { schoolById } from '../../data/schools.js';

export const DEV_SCHOOL_ID = 'jedlik-anyos';
const A = (f) => `${import.meta.env.BASE_URL}assets/${f}.svg`;

export const devSchools = {
  [DEV_SCHOOL_ID]: { id: DEV_SCHOOL_ID, name: schoolById[DEV_SCHOOL_ID].name, city: schoolById[DEV_SCHOOL_ID].city, publicationName: schoolById[DEV_SCHOOL_ID].publication.name },
};

const coreDevUsers = [
  { uid: 'dev-teacher', displayName: 'Ildikó Sz.', role: 'teacher', schoolId: DEV_SCHOOL_ID },
  { uid: 'dev-editor', displayName: 'Nóra F.', role: 'editor', schoolId: DEV_SCHOOL_ID, grade: '12.C' },
  { uid: 'dev-editor2', displayName: 'Kata B.', role: 'editor', schoolId: DEV_SCHOOL_ID, grade: '11.A' },
  { uid: 'dev-author', displayName: 'Dóra K.', role: 'author', schoolId: DEV_SCHOOL_ID, grade: '11.B' },
];
export const devMembers = [
  ...coreDevUsers,
  { uid: 'u-bence', displayName: 'Bence T.', role: 'author', schoolId: DEV_SCHOOL_ID, grade: '10.A' },
  { uid: 'u-zsombor', displayName: 'Zsombor R.', role: 'author', schoolId: DEV_SCHOOL_ID, grade: '9.B' },
  { uid: 'u-lilla', displayName: 'Lilla M.', role: 'author', schoolId: DEV_SCHOOL_ID, grade: '10.C' },
];
export const devUsers = devMembers;
const NAME = Object.fromEntries(devMembers.map((u) => [u.uid, u.displayName]));

const P = [
  'A szerkesztőségben sokat beszélgettünk erről, és kiderült, hogy mindenkinek más a tapasztalata. Ezért összegyűjtöttük a legfontosabb észrevételeket.',
  'Az első benyomás sokszor megtévesztő, ezért érdemes több oldalról is megnézni a kérdést. Mi három dolgot találtunk fontosnak.',
  'A végén az derült ki, hogy a legtöbbet az számít, ha közösen csinálunk valamit. Aki kipróbálta, nem bánta meg.',
];
const art = (intro, img = '') => ({ intro, body: P.join('\n\n'), sources: '', imageUrl: img, imageAlt: '' });
const thought = (quote, expl, src, img = '') => ({ quote, explanation: expl, isOwn: !src, quoteSource: src || '', imageUrl: img });
const story = (intro, imgs, closing = '') => ({ intro, images: imgs.map((f, i) => ({ id: `i${i}`, url: A(f), caption: `Pillanatkép ${i + 1}.` })), closing });
const opin = (intro, nick) => ({ intro, body: P.join('\n\n'), sources: '', authorDisplayName: nick });

const make = (id, title, format, category, authorId, status, dates, data, desc = '', extra = {}) => {
  const d = data;
  const img = format === 'visual_story' ? d.images?.[0]?.url || '' : d.imageUrl || '';
  const card = status === 'draft' && !desc ? null : { title: format === 'one_thought' ? title : title, description: desc, imageUrl: img, snapshot: { title, imageUrl: img } };
  return {
    id, schoolId: DEV_SCHOOL_ID, authorId, authorName: NAME[authorId] || 'Ismeretlen', title, format, category, status,
    contentData: d, cardData: card,
    createdAt: dates.created, updatedAt: dates.updated || dates.submitted || dates.created,
    submittedAt: dates.submitted || null, publishedAt: dates.published || null, ...extra,
  };
};

export const devContent = [
  make('c01', 'Szavazás az iskolai pólóról: te melyiket választanád?', 'short_article', 'hirek', 'u-bence', 'submitted', { created: '2026-10-26T14:10:00', submitted: '2026-10-28T08:45:00' }, art('Három póló-terv közül szavazhat a diákság a hónap végéig.', A('uj-ter')), 'Három terv, egy győztes: eldől, milyen pólóban jár majd az egész iskola.'),
  make('c02', 'Őszi fények a Jedlik udvarán', 'visual_story', 'kultura', 'dev-author', 'submitted', { created: '2026-10-25T16:20:00', submitted: '2026-10-28T07:30:00' }, story('Egy délután a Jedlikben, színes falevelek és közös ötletek.', ['jedlik-varos', 'jedlik-radio', 'jedlik-dinamo'], 'Az ősz a legszebb, ha le is lassulunk.'), 'Három kép egy közös iskolai délutánról.'),
  make('c03', 'Az első közös kirándulás', 'short_article', 'hirek', 'u-zsombor', 'submitted', { created: '2026-10-24T10:00:00', submitted: '2026-10-27T18:05:00' }, art('A kilencedikesek első közös kirándulásán sok minden történt.', A('jedlik-varos')), 'Elromlott a terv, de a nap így lett igazán emlékezetes.'),
  make('c04', '„Aki kérdez, az nem téved”', 'one_thought', 'tudomany', 'u-lilla', 'editorial_review', { created: '2026-10-23T12:00:00', submitted: '2026-10-26T09:15:00', updated: '2026-10-27T11:00:00' }, thought('Aki kérdez, az nem téved.', 'A jó kérdés fél válasz, és sokszor több, mint maga a válasz.', '', A('jedlik-dinamo')), 'Egy mondat arról, miért nem kell félni a kérdezéstől.'),
  make('c05', 'Új játék a gaming klubban: mit érdemes kipróbálni?', 'short_article', 'gaming', 'u-lilla', 'editorial_review', { created: '2026-10-22T15:40:00', submitted: '2026-10-25T13:00:00', updated: '2026-10-26T10:20:00' }, art('A klub új játékot kapott, és mindenki kíváncsi rá.', A('pixel-klub')), 'Új játék érkezett a klubba, és máris vita van arról, ki játszik először.'),
  make('c06', 'Miért szeretem a hétfői reggeli edzést?', 'opinion', 'velemeny', 'u-bence', 'awaiting_teacher', { created: '2026-10-20T07:50:00', submitted: '2026-10-23T08:00:00', updated: '2026-10-27T15:30:00' }, opin('Szerintem a korai edzés nem büntetés, hanem a hét legjobb kezdete.', 'Bence T.'), 'Korán kelni nehéz, de az edzés után másképp indul a hét.'),
  make('c07', 'A telefon és a szünet: kinek jó?', 'opinion', 'velemeny', 'dev-author', 'awaiting_teacher', { created: '2026-10-19T17:00:00', submitted: '2026-10-22T09:00:00', updated: '2026-10-27T09:40:00' }, opin('A telefonmentes szünet kérdésében nem a tiltás, hanem a megállapodás számít.', 'Dóra K.'), 'Tiltás helyett megállapodás: miért működik jobban a közös szabály?'),
  make('c08', 'Mi változik az iskolai büfében?', 'short_article', 'hirek', 'u-zsombor', 'changes_requested', { created: '2026-10-21T13:00:00', submitted: '2026-10-24T08:10:00', updated: '2026-10-26T16:45:00' }, art('A büfé átalakul, és ez minden diákot érint.', A('konyvtaros-interju')), 'Átalakul a büfé: mi marad, mi változik, és mikor lesz újra nyitva?', { feedback: 'Kérjük, pontosítsd a nyitva tartást, és add meg a forrást.' }),
  make('c09', 'Az Őszi Iskolák Tornája', 'short_article', 'sport', 'u-bence', 'published', { created: '2026-10-08T10:00:00', submitted: '2026-10-10T09:00:00', published: '2026-10-12T12:00:00' }, art('Négy iskola, egy délután, rengeteg közös nevetés.', A('iskolak-tornaja')), 'Hol számít többet a hangulat az eredménynél? A tornán, ahol mindenki nyert.'),
  make('c10', 'Mesterséges intelligencia a tanulásban: segítség, nem pótlék', 'short_article', 'technologia', 'dev-author', 'published', { created: '2026-10-14T09:00:00', submitted: '2026-10-16T08:30:00', published: '2026-10-19T10:00:00' }, art('Az MI jó segítő, de a gondolkodást nem veszi át.', A('ai-tanulas')), 'Mikor segít az MI, és mikor mond meggyőzően valótlant? Gyakorlati tippek.'),
  make('c11', 'Új szerkesztőségi sarok a könyvtár mellett', 'short_article', 'hirek', 'dev-editor', 'published', { created: '2026-10-17T11:00:00', submitted: '2026-10-18T09:00:00', published: '2026-10-21T08:00:00' }, art('Végre saját helye van a szerkesztőségnek.', A('uj-ter')), 'Hosszú asztal, két monitor és egy tábla: itt születnek a cikkek.'),
  make('c12', 'Interjú a könyvtárossal', 'short_article', 'kultura', 'dev-editor', 'published', { created: '2026-10-03T10:00:00', submitted: '2026-10-05T09:00:00', published: '2026-10-08T09:00:00' }, art('A könyvtáros szerint az olvasás átalakult, de nem tűnt el.', A('konyvtaros-interju')), 'Mit olvasnak ma a diákok? A kölcsönzési füzet sokat elárul.'),
  make('c13', 'Filmajánló: egy nyugodt őszi este', 'one_thought', 'film-es-sorozatok', 'dev-author', 'draft', { created: '2026-10-28T19:10:00' }, thought('Vannak filmek, amelyeket csak ősszel lehet igazán nézni.', '', '', '')),
  make('c14', 'Mit hallgatunk a buszon?', 'visual_story', 'zene', 'u-lilla', 'draft', { created: '2026-10-27T20:00:00' }, story('', ['jedlik-radio'], '')),
  make('c15', 'Iskolarádió-terv (elhalasztva)', 'short_article', 'kultura', 'u-bence', 'withdrawn', { created: '2026-09-29T10:00:00', submitted: '2026-10-01T10:00:00', updated: '2026-10-06T10:00:00' }, art('A terv egyelőre várat magára.', ''), 'Az iskolarádió ötlete elhalasztva.'),
  make('c16', 'Melyik legyen az idei diáknap témája?', 'poll', 'hirek', 'dev-author', 'published', { created: '2026-11-01T10:00:00', submitted: '2026-11-01T11:00:00', published: '2026-11-01T12:00:00' }, { ...art('Szavazz, milyen programok köré szervezzük az idei diáknapot.', A('diakparlament-viz')), question: 'Melyik témát választanád?', options: ['Zene és koncert', 'Sport és játék', 'Kreatív műhelyek'], endsAt: '2026-12-01T23:59:00.000Z' }, 'A diáknap témájáról most te dönthetsz.'),
];

export const devNotes = [
  { id: 'n1', contentId: 'c08', schoolId: DEV_SCHOOL_ID, authorId: 'dev-editor', authorName: 'Nóra F.', type: 'feedback', text: 'Kérjük, pontosítsd a nyitva tartást, és add meg a forrást.', createdAt: '2026-10-26T16:45:00' },
  { id: 'n2', contentId: 'c04', schoolId: DEV_SCHOOL_ID, authorId: 'dev-editor2', authorName: 'Kata B.', type: 'internal', text: 'Szép és rövid. A kártya címe lehetne kicsit játékosabb.', createdAt: '2026-10-27T11:00:00' },
  { id: 'n3', contentId: 'c06', schoolId: DEV_SCHOOL_ID, authorId: 'dev-editor', authorName: 'Nóra F.', type: 'internal', text: 'Lektoráltam, a szöveg rendben van. Mehet a tanárhoz.', createdAt: '2026-10-27T15:30:00' },
];

export const devTopics = [
  { id: 't1', schoolId: DEV_SCHOOL_ID, title: 'Hogyan tanuljunk a vizsgaidőszakban?', note: 'Praktikus tippek diákoktól, rövid interjúkkal.', category: 'tudomany', status: 'open', createdBy: 'dev-teacher', createdByName: 'Ildikó Sz.', createdAt: '2026-10-27T09:00:00', claimedBy: null, claimedByName: null, contentId: null },
  { id: 't2', schoolId: DEV_SCHOOL_ID, title: 'Mi lesz a büféből az átalakítás után?', note: 'Beszélgetés a büfésekkel és a diákokkal.', category: 'hirek', status: 'claimed', createdBy: 'dev-editor', createdByName: 'Nóra F.', createdAt: '2026-10-26T10:30:00', claimedBy: 'dev-editor2', claimedByName: 'Kata B.', claimedAt: '2026-10-28T08:00:00', contentId: null },
  { id: 't3', schoolId: DEV_SCHOOL_ID, title: 'Ősz a Duna-parton: fotósétát szervezzünk?', note: 'Képes történet lehetne belőle.', category: 'kultura', status: 'open', createdBy: 'dev-editor2', createdByName: 'Kata B.', createdAt: '2026-10-25T15:00:00', claimedBy: null, claimedByName: null, contentId: null },
  { id: 't4', schoolId: DEV_SCHOOL_ID, title: 'Régi osztálytermek története', note: '', category: '', status: 'open', createdBy: 'dev-teacher', createdByName: 'Ildikó Sz.', createdAt: '2026-10-22T12:00:00', claimedBy: null, claimedByName: null, contentId: null },
  { id: 't5', schoolId: DEV_SCHOOL_ID, title: 'Az Őszi Iskolák Tornája', note: '', category: 'sport', status: 'done', createdBy: 'dev-editor', createdByName: 'Nóra F.', createdAt: '2026-10-05T12:00:00', claimedBy: 'u-bence', claimedByName: 'Bence T.', contentId: 'c09' },
];

export const devSuggestions = [
  { id: 's1', schoolId: DEV_SCHOOL_ID, authorId: 'u-bence', authorName: 'Bence T.', category: 'topic_idea', title: 'Interjú az iskola gondnokával', text: 'Szerintem sokan nem tudják, mennyi mindent csinál nap mint nap.', status: 'new', note: '', createdAt: '2026-10-28T10:00:00' },
  { id: 's2', schoolId: DEV_SCHOOL_ID, authorId: 'dev-author', authorName: 'Dóra K.', category: 'film', title: 'Filmklub péntek délutánra', text: 'Havonta egy közös filmnézés, utána beszélgetéssel.', status: 'new', note: '', createdAt: '2026-10-28T09:00:00' },
  { id: 's3', schoolId: DEV_SCHOOL_ID, authorId: 'u-zsombor', authorName: 'Zsombor R.', category: 'book', title: 'Könyvajánló: Az ember tragédiája képregényben', text: 'Nekem ez segített megérteni a kötelező olvasmányt.', status: 'new', note: '', createdAt: '2026-10-27T17:00:00' },
  { id: 's4', schoolId: DEV_SCHOOL_ID, authorId: 'u-lilla', authorName: 'Lilla M.', category: 'event', title: 'Őszi kulturális délután', text: 'Zene, versek és rajzok a közösségi térben.', status: 'interesting', note: 'Jó ötlet, érdemes a tanárral egyeztetni.', createdAt: '2026-10-24T11:00:00' },
  { id: 's5', schoolId: DEV_SCHOOL_ID, authorId: 'dev-author', authorName: 'Dóra K.', category: 'photo', title: 'Fotó a lehulló levelekről', text: 'Szép felvétel készült az udvaron.', status: 'set_aside', note: 'Majd tavasszal.', createdAt: '2026-10-20T11:00:00' },
];

export const devSettings = { schoolId: DEV_SCHOOL_ID, limits: {} };
