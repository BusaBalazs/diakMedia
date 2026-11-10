// Bridges admin data to the public components (which expect category / school objects from the public data modules).
import { categoryById } from '../../data/categories.js';
import { schoolById } from '../../data/schools.js';

export const categoryOf = (id) => categoryById[id] || categoryById.hirek;

export function publicSchool(schoolId, schoolDoc) {
  if (schoolById[schoolId]) return schoolById[schoolId];
  const name = schoolDoc?.name || 'Iskola';
  return { id: schoolId, name, city: schoolDoc?.city || '', monogram: name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(), color: '#2D3CF0' };
}
