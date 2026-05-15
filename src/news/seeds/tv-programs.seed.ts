import type { GoogleSearchEntry } from './seed-entry.types';

// Cada programa tiene su propio panel (categoría dedicada)
export const TV_PROGRAMS: GoogleSearchEntry[] = [
  {
    name: 'Fiebre de Baile',
    category: 'fiebre_de_baile',
    queryEs: 'Fiebre de Baile CHV',
    queryEn: 'Fiebre de Baile CHV dance show',
  },
  {
    name: 'El Internado Mega',
    category: 'el_internado_mega',
    queryEs: 'El Internado Mega',
    queryEn: 'El Internado Mega reality show',
  },
  {
    name: 'Vecinos al Límite',
    category: 'vecinos_al_limite',
    queryEs: 'Vecinos al Limite Chilevision',
    queryEn: 'Vecinos al Limite Chilevision reality show',
  },
];
