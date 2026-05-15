import type { GoogleSearchEntry } from './seed-entry.types';

// Panel: tv_argentina, tv_mexicana, tv_espanola, tv_italiana, tv_usa, cine
export const INTERNATIONAL_TV: GoogleSearchEntry[] = [
  {
    name: 'TV Argentina',
    category: 'tv_argentina',
    queryEs: 'television argentina rating farandula',
    queryEn: 'Argentine television ratings entertainment',
  },
  {
    name: 'TV Mexico',
    category: 'tv_mexicana',
    queryEs: 'television mexicana Televisa TV Azteca',
    queryEn: 'Mexican television Televisa TV Azteca',
  },
  {
    name: 'TV España',
    category: 'tv_espanola',
    queryEs: 'television espanola Antena 3 Telecinco',
    queryEn: 'Spanish television Antena 3 Telecinco',
  },
  {
    name: 'TV Italia',
    category: 'tv_italiana',
    queryEs: 'television italiana RAI Mediaset',
    queryEn: 'Italian television RAI Mediaset',
  },
  {
    name: 'TV USA',
    category: 'tv_usa',
    queryEs: 'television Estados Unidos Hollywood entretenimiento',
    queryEn: 'US television Hollywood entertainment',
  },
  {
    name: 'Cine',
    category: 'cine',
    queryEs: 'cine estrenos peliculas premios',
    queryEn: 'movies premieres films awards',
  },
];
