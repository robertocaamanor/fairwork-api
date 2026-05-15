import type { DirectRssEntry } from './seed-entry.types';

export const DIRECT_RSS: DirectRssEntry[] = [
  // --- TV Chilena ---
  {
    name: 'Fotech',
    feeds: [
      { url: 'https://www.fotech.cl/category/television/feed/',  category: 'tv_chilena' },
      { url: 'https://www.fotech.cl/tag/fiebre-de-baile/feed/', category: 'fiebre_de_baile' },
    ],
  },
  {
    name: 'Lima Limón',
    feeds: [
      { url: 'https://www.limalimon.cl/feed/',                                  category: 'tv_chilena' },
      { url: 'https://www.limalimon.cl/categoria/fiebre-de-baile/feed/',        category: 'fiebre_de_baile' },
    ],
  },
  {
    name: 'Ojo a la Tele',
    feeds: [
      { url: 'https://ojoalatele.com/category/television/feed/', category: 'tv_chilena' },
    ],
  },
  {
    name: 'Cooperativa',
    feeds: [
      { url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_102__1.xml', category: 'tv_chilena' },
      { url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_11__1.xml',  category: 'musica' },
      { url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_303__1.xml', category: 'streaming' },
      { url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_8___1.xml',    category: 'tecnologia' },
    ],
  },

  // --- Música internacional ---
  {
    name: 'Variety',
    feeds: [
      { url: 'https://variety.com/v/tv/feed/',    category: 'tv_usa' },
      { url: 'https://variety.com/v/music/feed/', category: 'musica' },
    ],
  },
  {
    name: 'Rolling Stone',
    feeds: [
      { url: 'https://www.rollingstone.com/tv-movies/feed/', category: 'tv_usa' },
      { url: 'https://www.rollingstone.com/music/feed/',     category: 'musica' },
    ],
  },
  {
    name: 'Billboard',
    feeds: [
      { url: 'https://www.billboard.com/c/music/feed/', category: 'musica' },
    ],
  },
  {
    name: 'Portal Famosos',
    feeds: [
      { url: 'https://portalfamosos.com.br/category/a-list/musica/feed/', category: 'musica' },
    ],
  },
  {
    name: 'Portal Popline',
    feeds: [
      { url: 'https://portalpopline.com.br/feed/', category: 'musica' },
    ],
  },
  {
    name: 'Folha F5',
    feeds: [
      { url: 'http://feeds.folha.uol.com.br/f5/musica/rss091.xml', category: 'musica' },
    ],
  },
  {
    name: 'The Guardian',
    feeds: [
      { url: 'https://www.theguardian.com/music/rss', category: 'musica' },
    ],
  },
  {
    name: 'Stranotizie',
    feeds: [
      { url: 'https://www.stranotizie.it/category/musica/feed/', category: 'musica' },
    ],
  },
  {
    name: 'Radio Italia',
    feeds: [
      { url: 'https://www.radioitalia.it/rss.xml', category: 'musica' },
    ],
  },

  // --- Tecnología ---
  {
    name: '9to5Google',
    feeds: [
      { url: 'https://9to5google.com/feed/', category: 'tecnologia' },
    ],
  },
  {
    name: 'Xataka',
    feeds: [
      { url: 'https://www.xataka.com/index.xml', category: 'tecnologia' },
    ],
  },
  {
    name: '9to5Mac',
    feeds: [
      { url: 'https://9to5mac.com/feed/', category: 'tecnologia' },
    ],
  },
  {
    name: 'Pisapapeles',
    feeds: [
      { url: 'https://pisapapeles.net/feed/', category: 'tecnologia' },
    ],
  },
];
