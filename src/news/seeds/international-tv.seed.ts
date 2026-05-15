import type { GoogleSearchEntry } from './seed-entry.types';

// ─── TV Argentina ─────────────────────────────────────────────────────────────

const TV_ARGENTINA_NAMES: string[] = [
  'Telefe',
  'El Trece',
  'C5N',
  'TN',
  'LN+',
  'América TV Argentina',
  'El Nueve',
  'TV Pública Argentina',
  'Martín Fierro 2026',
  'Gran Hermano Argentina',
  'Marcelo Tinelli',
];

export const TV_ARGENTINA: GoogleSearchEntry[] = TV_ARGENTINA_NAMES.map(
  (name) => ({ name, category: 'tv_argentina', queryEs: name, queryEn: name }),
);

// ─── TV Mexicana ──────────────────────────────────────────────────────────────

const TV_MEXICANA_NAMES: string[] = [
  'Televisa',
  'TV Azteca',
  'Imagen Televisión',
  'Canal 6',
  'Telenovelas Televisa',
  'Las Estrellas',
  'Programa Hoy',
  'Cuéntamelo Ya',
  'Venga la Alegría',
];

export const TV_MEXICANA: GoogleSearchEntry[] = TV_MEXICANA_NAMES.map(
  (name) => ({ name, category: 'tv_mexicana', queryEs: name, queryEn: name }),
);

// ─── TV Española ──────────────────────────────────────────────────────────────

const TV_ESPANOLA_NAMES: string[] = [
  'TVE',
  'Antena 3',
  'Telecinco',
  'Cuatro TV España',
  'La Sexta',
  'La Resistencia',
  'El Hormiguero',
  'Mask Singer Antena 3',
  'Movistar España',
];

export const TV_ESPANOLA: GoogleSearchEntry[] = TV_ESPANOLA_NAMES.map(
  (name) => ({ name, category: 'tv_espanola', queryEs: name, queryEn: name }),
);

// ─── TV Italiana ──────────────────────────────────────────────────────────────

const TV_ITALIANA_NAMES: string[] = [
  'Rai',
  'Rai 1',
  'Rai 2',
  'Rai 3',
  'Mediaset',
  'Canale 5',
  'La 7',
  'Italia 1',
  'Rete 4',
  'Nove',
  'Che Tempo Che Fa',
  'Domenica In',
  'Belve',
  'Festival di Sanremo',
  'Amadeus',
  'Carlo Conti',
  'Bruno Vespa',
  'Porta a Porta',
  'Antonella Clerici',
  'Sabrina Salerno',
  'Valeria Marini',
];

export const TV_ITALIANA: GoogleSearchEntry[] = TV_ITALIANA_NAMES.map(
  (name) => ({ name, category: 'tv_italiana', queryEs: name, queryEn: name }),
);

// ─── TV USA ───────────────────────────────────────────────────────────────────

const TV_USA_NAMES: string[] = [
  'NBC',
  'ABC',
  'CBS',
  'FOX',
  'MS NOW',
  'CNN',
  'Late Show Stephen Colbert',
  'Late Jimmy Kimmel',
  'Late Jimmy Fallon',
  'Today NBC',
  'Good Morning America',
  'CBS Mornings',
  '60 Minutes',
  'TV Events',
];

export const TV_USA: GoogleSearchEntry[] = TV_USA_NAMES.map((name) => ({
  name,
  category: 'tv_usa',
  queryEs: name,
  queryEn: name,
}));

// ─── Cine ─────────────────────────────────────────────────────────────────────

export const CINE: GoogleSearchEntry = {
  name: 'Cine',
  category: 'cine',
  queryEs: 'cine estrenos peliculas premios',
  queryEn: 'movies premieres films awards',
};

