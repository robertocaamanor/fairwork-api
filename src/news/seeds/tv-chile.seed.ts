import type { GoogleSearchEntry } from './seed-entry.types';

const createTvChileEntry = (name: string): GoogleSearchEntry => ({
  name,
  category: 'tv_chilena',
  queryEs: name,
  queryEn: name,
});

// Panel: tv_chilena
export const TV_CHANNELS_CHILE: GoogleSearchEntry[] = [
  'TVN Chile',
  'Mega Chile',
  'Chilevisión',
  'Canal 13',
  'La Red Chile',
  'TV+',
  'Telecanal',
  'CNTV Chile',
].map(createTvChileEntry);

// Panel: tv_chilena — figuras y personalidades
export const TV_PERSONALITIES_CHILE: GoogleSearchEntry[] = [
  'Disley Ramos',
  'Cony Capelli',
  'Emilia Dides',
  'Karen Paola',
  'Cathy Barriga',
  'Yamila Reyna',
  'Alejandra Araya',
  'Sergio Lagos',
  'Yerko Puchento',
].map(createTvChileEntry);
