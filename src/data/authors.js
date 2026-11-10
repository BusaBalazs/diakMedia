// Pilot bylines use fictional names for demonstration purposes.
export const authors = [
  { id: 'gergo-n', name: 'Gergő N.', grade: '11.A', schoolId: 'jedlik-anyos' },
  { id: 'anna-j', name: 'Anna J.', grade: '12.B', schoolId: 'jedlik-anyos' },
  { id: 'peter-o', name: 'Péter O.', grade: '10.C', schoolId: 'jedlik-anyos' },
];

export const authorById = Object.fromEntries(authors.map((author) => [author.id, author]));
