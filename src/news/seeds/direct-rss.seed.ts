import type { DirectRssEntry } from './seed-entry.types';

export const DIRECT_RSS: DirectRssEntry[] = [
  // --- TV Chilena ---
  {
    name: 'Fotech',
    feeds: [
      {
        name: 'Fotech Televisión',
        url: 'https://www.fotech.cl/category/television/feed/',
        category: 'tv_chilena',
      },
      {
        name: 'Fotech Fiebre de Baile',
        url: 'https://www.fotech.cl/tag/fiebre-de-baile/feed/',
        category: 'fiebre_de_baile',
      },
    ],
  },
  {
    name: 'Lima Limón',
    feeds: [
      { url: 'https://www.limalimon.cl/feed/', category: 'tv_chilena' },
      {
        name: 'Lima Limón Fiebre de Baile',
        url: 'https://www.limalimon.cl/categoria/fiebre-de-baile/feed/',
        category: 'fiebre_de_baile',
      },
    ],
  },
  {
    name: 'Ojo a la Tele',
    feeds: [
      {
        url: 'https://ojoalatele.com/category/television/feed/',
        category: 'tv_chilena',
      },
    ],
  },
  {
    name: 'Cooperativa',
    feeds: [
      {
        name: 'Cooperativa Televisión',
        url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_102__1.xml',
        category: 'tv_chilena',
      },
      {
        name: 'Cooperativa Música',
        url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_11__1.xml',
        category: 'musica',
      },
      {
        name: 'Cooperativa Streaming',
        url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_303__1.xml',
        category: 'streaming',
      },
      {
        name: 'Cooperativa Tecnología',
        url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_8___1.xml',
        category: 'tecnologia',
      },
    ],
  },
  {
    name: 'Bio-Bio Chile',
    feeds: [
      {
        name: 'Bio-Bio Chile Televisión',
        url: 'https://www.biobiochile.cl/static/feed-rss',
        category: 'tv_chilena',
        selectors: { includedUrlPatterns: '/noticias/espectaculos-y-tv/tv/' },
      },
      {
        name: 'Bio-Bio Chile Música',
        url: 'https://www.biobiochile.cl/static/feed-rss',
        category: 'musica',
        selectors: { includedUrlPatterns: '/noticias/artes-y-cultura/musica/' },
      },
      {
        name: 'Bio-Bio Chile Cine',
        url: 'https://www.biobiochile.cl/static/feed-rss',
        category: 'cine',
        selectors: {
          includedUrlPatterns: '/noticias/espectaculos-y-tv/cine-y-series/',
        },
      },
    ],
  },
  {
    name: 'Publimetro',
    feeds: [
      {
        name: 'Publimetro Entretenimiento',
        url: 'https://www.publimetro.cl/arc/outboundfeeds/rss/category/entretenimiento/?outputType=xml',
        category: 'tv_chilena',
      },
      {
        name: 'Publimetro Tecnología',
        url: 'https://www.publimetro.cl/arc/outboundfeeds/rss/category/tecnologia/?outputType=xml',
        category: 'tecnologia',
      },
    ],
  },

  // --- TV Italiana ---
  {
    name: 'Rai News',
    feeds: [
      {
        url: 'https://www.rainews.it/rss/artiespettacolo',
        category: 'tv_italiana',
      },
    ],
  },

  // --- Música internacional ---
  {
    name: 'Variety',
    feeds: [
      {
        name: 'Variety TV',
        url: 'https://variety.com/v/tv/feed/',
        category: 'tv_usa',
      },
      {
        name: 'Variety Music',
        url: 'https://variety.com/v/music/feed/',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Rolling Stone',
    feeds: [
      {
        name: 'Rolling Stone TV & Movies',
        url: 'https://www.rollingstone.com/tv-movies/feed/',
        category: 'tv_usa',
      },
      {
        name: 'Rolling Stone Music',
        url: 'https://www.rollingstone.com/music/feed/',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Billboard',
    feeds: [
      {
        name: 'Billboard Music',
        url: 'https://www.billboard.com/c/music/feed/',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Portal Famosos',
    feeds: [
      {
        name: 'Portal Famosos Música',
        url: 'https://portalfamosos.com.br/category/a-list/musica/feed/',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Portal Popline',
    feeds: [{ url: 'https://portalpopline.com.br/feed/', category: 'musica' }],
  },
  {
    name: 'Folha F5',
    feeds: [
      {
        name: 'Folha F5 Música',
        url: 'http://feeds.folha.uol.com.br/f5/musica/rss091.xml',
        category: 'musica',
      },
    ],
  },
  {
    name: 'The Guardian',
    feeds: [
      {
        name: 'The Guardian Music',
        url: 'https://www.theguardian.com/music/rss',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Stranotizie',
    feeds: [
      {
        url: 'https://www.stranotizie.it/category/musica/feed/',
        category: 'musica',
      },
    ],
  },
  {
    name: 'Radio Italia',
    feeds: [{ url: 'https://www.radioitalia.it/rss.xml', category: 'musica' }],
  },
  {
    name: 'Mix 98.7',
    feeds: [
      {
        url: 'https://mix987.com/category/music-news/feed/',
        category: 'musica',
      },
    ],
  },

  // --- Tecnología ---
  {
    name: '9to5Google',
    feeds: [{ url: 'https://9to5google.com/feed/', category: 'tecnologia' }],
  },
  {
    name: 'Xataka',
    feeds: [
      { url: 'https://www.xataka.com/index.xml', category: 'tecnologia' },
    ],
  },
  {
    name: '9to5Mac',
    feeds: [{ url: 'https://9to5mac.com/feed/', category: 'tecnologia' }],
  },
  {
    name: 'Pisapapeles',
    feeds: [{ url: 'https://pisapapeles.net/feed/', category: 'tecnologia' }],
  },
];
