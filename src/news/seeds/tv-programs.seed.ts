import type { GoogleSearchEntry } from './seed-entry.types';

type ProgramDef = {
  name: string;
  categories: GoogleSearchEntry['category'][];
  queryEs: string;
  queryEn: string;
};

const PROGRAM_DEFINITIONS: ProgramDef[] = [
  {
    name: 'Fiebre de Baile',
    categories: ['tv_chilena', 'fiebre_de_baile'],
    queryEs: 'Fiebre de Baile CHV',
    queryEn: 'Fiebre de Baile CHV dance show',
  },
  {
    name: 'El Internado Mega',
    categories: ['tv_chilena', 'el_internado_mega'],
    queryEs: 'El Internado Mega',
    queryEn: 'El Internado Mega reality show',
  },
  {
    name: 'Vecinos al Límite Canal 13',
    categories: ['tv_chilena', 'vecinos_al_limite'],
    queryEs: 'Vecinos al Límite Canal 13',
    queryEn: 'Vecinos al Limite Canal 13 reality show',
  },
  {
    name: 'Volverías con tu ex 2 Mega',
    categories: ['tv_chilena'],
    queryEs: 'Volverías con tu ex 2 Mega',
    queryEn: 'Volverias con tu ex 2 Mega reality show',
  },
  {
    name: 'Club de la Comedia Chilevisión',
    categories: ['tv_chilena'],
    queryEs: 'Club de la Comedia Chilevisión',
    queryEn: 'Club de la Comedia Chilevision comedy show',
  },
  {
    name: 'La Divina Comida Chilevisión',
    categories: ['tv_chilena'],
    queryEs: 'La Divina Comida Chilevisión',
    queryEn: 'La Divina Comida Chilevision tv show',
  },
  {
    name: 'Hay que decirlo',
    categories: ['tv_chilena'],
    queryEs: 'Hay que decirlo',
    queryEn: 'Hay que decirlo tv show',
  },
  {
    name: 'Plan Perfecto',
    categories: ['tv_chilena'],
    queryEs: 'Plan Perfecto',
    queryEn: 'Plan Perfecto tv show',
  },
  {
    name: 'Mucho Gusto',
    categories: ['tv_chilena'],
    queryEs: 'Mucho Gusto',
    queryEn: 'Mucho Gusto Mega morning show',
  },
];

export const TV_PROGRAMS: GoogleSearchEntry[] = PROGRAM_DEFINITIONS.flatMap(
  (program) =>
    program.categories.map((category) => ({
      name: program.name,
      category,
      queryEs: program.queryEs,
      queryEn: program.queryEn,
    })),
);
