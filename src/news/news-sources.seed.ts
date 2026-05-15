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

const GOOGLE_NEWS_SEARCHES: GoogleNewsSearchDefinition[] = [
  {
    name: 'Television Chile',
    category: 'tv_chilena',
    queryEs: 'television chilena TVN Mega CHV Canal 13',
    queryEn: 'Chilean television TVN Mega CHV Canal 13',
  },
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

const DIRECT_RSS_SOURCES: Array<Partial<NewsSource>> = [
  {
    name: 'Fotech Televisión',
    url: 'https://www.fotech.cl/category/television/feed/',
    type: 'rss' as const,
    category: 'tv_chilena',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Lima Limón',
    url: 'https://www.limalimon.cl/feed/',
    type: 'rss' as const,
    category: 'tv_chilena',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Ojo a la Tele',
    url: 'https://ojoalatele.com/category/television/feed/',
    type: 'rss' as const,
    category: 'tv_chilena',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Cooperativa Televisión',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_102__1.xml',
    type: 'rss' as const,
    category: 'tv_chilena',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Variety TV',
    url: 'https://variety.com/v/tv/feed/',
    type: 'rss' as const,
    category: 'tv_usa',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Rolling Stone TV & Movies',
    url: 'https://www.rollingstone.com/tv-movies/feed/',
    type: 'rss' as const,
    category: 'tv_usa',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Variety Music',
    url: 'https://variety.com/v/music/feed/',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Billboard Music',
    url: 'https://www.billboard.com/c/music/feed/',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Rolling Stone Music',
    url: 'https://www.rollingstone.com/music/feed/',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Portal Famosos Música',
    url: 'https://portalfamosos.com.br/category/a-list/musica/feed/',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Portal Popline',
    url: 'https://portalpopline.com.br/feed/',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Cooperativa Música',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_11__1.xml',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Folha F5 Música',
    url: 'http://feeds.folha.uol.com.br/f5/musica/rss091.xml',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'The Guardian Music',
    url: 'https://www.theguardian.com/music/rss',
    type: 'rss' as const,
    category: 'musica',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Cooperativa Streaming',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_4_303__1.xml',
    type: 'rss' as const,
    category: 'streaming',
    enabled: true,
    selectors: {},
  },
  {
    name: '9to5Google',
    url: 'https://9to5google.com/feed/',
    type: 'rss' as const,
    category: 'tecnologia',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Xataka',
    url: 'https://www.xataka.com/index.xml',
    type: 'rss' as const,
    category: 'tecnologia',
    enabled: true,
    selectors: {},
  },
  {
    name: '9to5Mac',
    url: 'https://9to5mac.com/feed/',
    type: 'rss' as const,
    category: 'tecnologia',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Pisapapeles',
    url: 'https://pisapapeles.net/feed/',
    type: 'rss' as const,
    category: 'tecnologia',
    enabled: true,
    selectors: {},
  },
  {
    name: 'Cooperativa Tecnología',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss_8___1.xml',
    type: 'rss' as const,
    category: 'tecnologia',
    enabled: true,
    selectors: {},
  },
];

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
