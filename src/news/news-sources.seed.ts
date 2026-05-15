import { NewsSource } from './entities/news-source.entity';

const GOOGLE_NEWS_SEARCH_WINDOW = '2d';
const GOOGLE_NEWS_MAX_AGE_HOURS = '48';

const googleNewsSelectors = {
  maxAgeHours: GOOGLE_NEWS_MAX_AGE_HOURS,
  sortOrder: 'desc',
  excludedDomains: 'tvenserio.com',
};

type GoogleNewsSearchLocale = {
  suffix: string;
  queryKey: 'queryEs' | 'queryEn';
  hl: string;
  gl: string;
  ceid: string;
};

type GoogleNewsSearchDefinition = {
  name: string;
  category: NewsSource['category'];
  queryEs: string;
  queryEn: string;
};

const GOOGLE_NEWS_SEARCH_LOCALES: GoogleNewsSearchLocale[] = [
  {
    suffix: 'ES',
    queryKey: 'queryEs',
    hl: 'es-419',
    gl: 'CL',
    ceid: 'CL:es-419',
  },
  {
    suffix: 'EN',
    queryKey: 'queryEn',
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  },
];

const TV_CHANNELS_CHILE: string[] = [
  'TVN Chile',
  'Mega Chile',
  'Chilevisión',
  'Canal 13',
  'La Red Chile',
  'TV+',
  'Telecanal',
  'CNTV Chile',
];

const TV_PERSONALITIES_CHILE: string[] = ['Disley Ramos', 'Cony Capelli'];

const MUSIC_ARTISTS: string[] = [
  'Dua Lipa',
  'Tini Stoessel',
  'Lali Esposito',
  'Katy Perry',
  'María Becerra',
  'Ariana Grande',
  'Demi Lovato',
  'Britney Spears',
  'Selena Gomez',
  'Shakira',
  'Rihanna',
  'Lady Gaga',
  'Soulfía',
  'Camila Cabello',
  'Karol G',
  'Becky G',
  'Anuel AA',
  'Bad Bunny',
  'J Balvin',
  'Maluma',
  'Ozuna',
  'Daddy Yankee',
  'Shirel',
  'Denise Rosenthal',
  'Kylie Minogue',
  'Sabrina Carpenter',
  'Megan Thee Stallion',
  'Lizzo',
  'Anitta',
  'Ludmilla',
  'Nicki Minaj',
  'Emilia Mernes',
  'Bebe Rexha',
];

const GOOGLE_NEWS_SEARCHES: GoogleNewsSearchDefinition[] = [
  ...TV_CHANNELS_CHILE.map((channel) => ({
    name: channel,
    category: 'tv_chilena' as NewsSource['category'],
    queryEs: channel,
    queryEn: channel,
  })),
  ...TV_PERSONALITIES_CHILE.map((person) => ({
    name: person,
    category: 'tv_chilena' as NewsSource['category'],
    queryEs: person,
    queryEn: person,
  })),
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
    name: 'Vecinos al Limite',
    category: 'vecinos_al_limite',
    queryEs: 'Vecinos al Limite Chilevision',
    queryEn: 'Vecinos al Limite Chilevision reality show',
  },
  {
    name: 'Musica',
    category: 'musica',
    queryEs: 'musica pop latina conciertos festivales',
    queryEn: 'latin pop music concerts festivals',
  },
  ...MUSIC_ARTISTS.map((artist) => ({
    name: artist,
    category: 'musica' as NewsSource['category'],
    queryEs: artist,
    queryEn: artist,
  })),
  {
    name: 'Streaming',
    category: 'streaming',
    queryEs: 'Netflix Prime Video Disney streaming series',
    queryEn: 'Netflix Prime Video Disney streaming series',
  },
  {
    name: 'Tecnologia',
    category: 'tecnologia',
    queryEs: 'tecnologia inteligencia artificial apps Chile',
    queryEn: 'technology artificial intelligence apps Chile',
  },
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
    name: 'TV Espana',
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
  {
    name: 'Sanremo',
    category: 'sanremo',
    queryEs: 'festival Sanremo musica',
    queryEn: 'Sanremo festival music',
  },
  {
    name: 'Eurovision',
    category: 'eurovision',
    queryEs: 'Eurovision festival cancion',
    queryEn: 'Eurovision song contest',
  },
];

export const LEGACY_FIXED_SOURCE_NAMES = [] as const;

type DirectRssFeed = { rss: string; categoria: NewsSource['category'] };
type DirectRssEntry = { nombre: string; feeds: DirectRssFeed[] };

const DIRECT_RSS_CONFIG: DirectRssEntry[] = [
  {
    nombre: 'Fotech',
    feeds: [
      {
        rss: 'https://www.fotech.cl/category/television/feed/',
        categoria: 'tv_chilena',
      },
      {
        rss: 'https://www.fotech.cl/tag/fiebre-de-baile/feed/',
        categoria: 'fiebre_de_baile',
      },
    ],
  },
  {
    nombre: 'Lima Limón',
    feeds: [
      { rss: 'https://www.limalimon.cl/feed/', categoria: 'tv_chilena' },
      {
        rss: 'https://www.limalimon.cl/categoria/fiebre-de-baile/feed/',
        categoria: 'fiebre_de_baile',
      },
    ],
  },
  {
    nombre: 'Ojo a la Tele',
    feeds: [
      {
        rss: 'https://ojoalatele.com/category/television/feed/',
        categoria: 'tv_chilena',
      },
    ],
  },
  {
    nombre: 'Cooperativa',
    feeds: [
      {
        rss: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_102__1.xml',
        categoria: 'tv_chilena',
      },
      {
        rss: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_11__1.xml',
        categoria: 'musica',
      },
      {
        rss: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_303__1.xml',
        categoria: 'streaming',
      },
      {
        rss: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_8___1.xml',
        categoria: 'tecnologia',
      },
    ],
  },
  {
    nombre: 'Variety',
    feeds: [
      { rss: 'https://variety.com/v/tv/feed/', categoria: 'tv_usa' },
      { rss: 'https://variety.com/v/music/feed/', categoria: 'musica' },
    ],
  },
  {
    nombre: 'Rolling Stone',
    feeds: [
      {
        rss: 'https://www.rollingstone.com/tv-movies/feed/',
        categoria: 'tv_usa',
      },
      { rss: 'https://www.rollingstone.com/music/feed/', categoria: 'musica' },
    ],
  },
  {
    nombre: 'Billboard',
    feeds: [
      { rss: 'https://www.billboard.com/c/music/feed/', categoria: 'musica' },
    ],
  },
  {
    nombre: 'Portal Famosos',
    feeds: [
      {
        rss: 'https://portalfamosos.com.br/category/a-list/musica/feed/',
        categoria: 'musica',
      },
    ],
  },
  {
    nombre: 'Portal Popline',
    feeds: [{ rss: 'https://portalpopline.com.br/feed/', categoria: 'musica' }],
  },
  {
    nombre: 'Folha F5',
    feeds: [
      {
        rss: 'http://feeds.folha.uol.com.br/f5/musica/rss091.xml',
        categoria: 'musica',
      },
    ],
  },
  {
    nombre: 'The Guardian',
    feeds: [
      { rss: 'https://www.theguardian.com/music/rss', categoria: 'musica' },
    ],
  },
  {
    nombre: '9to5Google',
    feeds: [{ rss: 'https://9to5google.com/feed/', categoria: 'tecnologia' }],
  },
  {
    nombre: 'Xataka',
    feeds: [
      { rss: 'https://www.xataka.com/index.xml', categoria: 'tecnologia' },
    ],
  },
  {
    nombre: '9to5Mac',
    feeds: [{ rss: 'https://9to5mac.com/feed/', categoria: 'tecnologia' }],
  },
  {
    nombre: 'Pisapapeles',
    feeds: [{ rss: 'https://pisapapeles.net/feed/', categoria: 'tecnologia' }],
  },
];

const DIRECT_RSS_SOURCES: Array<Partial<NewsSource>> =
  DIRECT_RSS_CONFIG.flatMap(({ nombre, feeds }) =>
    feeds.map(({ rss, categoria }) => ({
      name: nombre,
      url: rss,
      type: 'rss' as const,
      category: categoria,
      enabled: true,
      selectors: { maxAgeHours: '48' },
    })),
  );

export function buildNewsSourceSeeds(): Array<Partial<NewsSource>> {
  const googleSources = GOOGLE_NEWS_SEARCHES.flatMap((definition) =>
    GOOGLE_NEWS_SEARCH_LOCALES.map((locale) => ({
      name: `Google News ${definition.name} ${locale.suffix}`,
      url: buildGoogleNewsSearchUrl(definition[locale.queryKey], locale),
      type: 'rss' as const,
      category: definition.category,
      enabled: true,
      selectors: googleNewsSelectors,
    })),
  );

  return [...googleSources, ...DIRECT_RSS_SOURCES];
}

function buildGoogleNewsSearchUrl(
  query: string,
  locale: GoogleNewsSearchLocale,
): string {
  const parsed = new URL('https://news.google.com/rss/search');
  parsed.searchParams.set(
    'q',
    `${query.trim()} when:${GOOGLE_NEWS_SEARCH_WINDOW}`,
  );
  parsed.searchParams.set('hl', locale.hl);
  parsed.searchParams.set('gl', locale.gl);
  parsed.searchParams.set('ceid', locale.ceid);
  return parsed.toString();
}
