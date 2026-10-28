// A topic groups articles from different schools around a shared subject.
export const topics = [
  {
    id: 'hullamhossz',
    slug: 'hullamhossz-fesztival',
    title: 'Hullámhossz Fesztivál: három iskola, három nézőpont',
    description:
      'Egy zenei fesztivál a Duna partján, és három diákszerkesztőség, amely másképp látja ugyanazt a hétvégét: a felkészülő közönség, a színpad mögötti technikusok és a fenntarthatóságot számon kérő vélemény.',
    imageKey: 'hullamhossz-felkeszules',
  },
];
export const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
export const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]));
