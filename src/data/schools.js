// The pilot currently serves one school. Multi-school publication views are deferred.
export const DEMO_SCHOOL_ID = 'jedlik-anyos';

export const schools = [
  {
    id: DEMO_SCHOOL_ID,
    name: 'Jedlik Ányos Gimnázium',
    city: 'Budapest',
    monogram: 'JÁ',
    color: '#101426',
    publication: {
      name: 'Szikra',
      description: 'A Jedlik Ányos Gimnázium diáklapja: kísérletek, robotok, iskolarádió és minden, ami az iskolában szikrát vet.',
    },
  },
];

export const schoolById = Object.fromEntries(schools.map((school) => [school.id, school]));
