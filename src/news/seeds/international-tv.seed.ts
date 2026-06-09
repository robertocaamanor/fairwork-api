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

export const TV_ITALIANA: GoogleSearchEntry[] = [
  {
    name: 'Rai television italiana',
    category: 'tv_italiana',
    queryEs: 'Rai televisione italiana programmi conduttori',
    queryEn: 'Rai Italian television shows presenters',
  },
  {
    name: 'Mediaset television italiana',
    category: 'tv_italiana',
    queryEs: 'Mediaset televisione italiana programmi conduttori',
    queryEn: 'Mediaset Italian television shows presenters',
  },
  {
    name: 'Canale 5 programmi',
    category: 'tv_italiana',
    queryEs: 'Canale 5 programmi tv conduttori televisione italiana',
    queryEn: 'Canale 5 Italian TV shows presenters',
  },
  {
    name: 'La7 programmi',
    category: 'tv_italiana',
    queryEs: 'La7 programmi tv conduttori televisione italiana',
    queryEn: 'La7 Italian TV shows presenters',
  },
  {
    name: 'Che Tempo Che Fa',
    category: 'tv_italiana',
    queryEs: 'Che Tempo Che Fa Fabio Fazio televisione italiana',
    queryEn: 'Che Tempo Che Fa Fabio Fazio Italian television',
  },
  {
    name: 'Domenica In',
    category: 'tv_italiana',
    queryEs: 'Domenica In Mara Venier Rai televisione italiana',
    queryEn: 'Domenica In Mara Venier Rai Italian television',
  },
  {
    name: 'Belve',
    category: 'tv_italiana',
    queryEs: 'Belve Francesca Fagnani Rai televisione italiana',
    queryEn: 'Belve Francesca Fagnani Rai Italian television',
  },
  {
    name: 'Porta a Porta',
    category: 'tv_italiana',
    queryEs: 'Porta a Porta Bruno Vespa Rai televisione italiana',
    queryEn: 'Porta a Porta Bruno Vespa Rai Italian television',
  },
  {
    name: 'Carlo Conti',
    category: 'tv_italiana',
    queryEs: 'Carlo Conti Rai conduttore televisione italiana',
    queryEn: 'Carlo Conti Rai Italian TV presenter',
  },
  {
    name: 'Antonella Clerici',
    category: 'tv_italiana',
    queryEs: 'Antonella Clerici Rai conduttrice televisione italiana',
    queryEn: 'Antonella Clerici Rai Italian TV presenter',
  },
  {
    name: 'Amadeus TV italiana',
    category: 'tv_italiana',
    queryEs: 'Amadeus conduttore televisione italiana Rai',
    queryEn: 'Amadeus Italian TV presenter Rai',
  },
  {
    name: 'Stefano De Martino TV italiana',
    category: 'tv_italiana',
    queryEs: 'Stefano De Martino conduttore televisione italiana Rai',
    queryEn: 'Stefano De Martino Italian TV presenter Rai',
  },
];

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

