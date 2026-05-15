import { NewsSource } from './entities/news-source.entity';

const googleNewsRssUrl = (rawUrl: string): string => {
  const parsed = new URL(rawUrl);

  if (parsed.pathname.startsWith('/rss/')) {
    return parsed.toString();
  }

  if (
    parsed.pathname.startsWith('/publications/') ||
    parsed.pathname.startsWith('/topics/') ||
    parsed.pathname.startsWith('/search')
  ) {
    parsed.pathname = `/rss${parsed.pathname}`;
  }

  return parsed.toString();
};

const googleNewsSelectors = {
  maxAgeHours: '48',
  sortOrder: 'desc',
  excludedDomains: 'tvenserio.com',
};

const GOOGLE_NEWS_SEARCH_WINDOW = '2d';

type GoogleNewsSearchLocale = {
  suffix: string;
  queryKey: 'queryEs' | 'queryEn';
  hl: string;
  gl: string;
  ceid: string;
};

const googleNewsSearchLocales: GoogleNewsSearchLocale[] = [
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

const googleNewsSearchRssUrl = (
  query: string,
  locale: GoogleNewsSearchLocale,
): string => {
  const parsed = new URL('https://news.google.com/rss/search');
  parsed.searchParams.set(
    'q',
    `${query.trim()} when:${GOOGLE_NEWS_SEARCH_WINDOW}`,
  );
  parsed.searchParams.set('hl', locale.hl);
  parsed.searchParams.set('gl', locale.gl);
  parsed.searchParams.set('ceid', locale.ceid);
  return parsed.toString();
};

const googleNewsSearchSelectors = {
  ...googleNewsSelectors,
  maxAgeHours: '48',
};

const googleNewsSearchSeeds = (
  definition: GoogleNewsSearchDefinition,
): Array<Partial<NewsSource>> =>
  googleNewsSearchLocales.map((locale) => ({
    name: `${definition.baseName} ${locale.suffix}`,
    url: googleNewsSearchRssUrl(definition[locale.queryKey], locale),
    type: 'rss',
    category: definition.category,
    enabled: true,
    selectors: googleNewsSearchSelectors,
  }));

type GoogleNewsSearchDefinition = {
  baseName: string;
  queryEs: string;
  queryEn: string;
  category: NewsSource['category'];
};

const googleNewsSearchDefinitions: GoogleNewsSearchDefinition[] = [
  {
    baseName: 'Google News Television Chile Search',
    queryEs: 'television chilena TVN Mega CHV Canal 13',
    queryEn: 'Chilean television TVN Mega CHV Canal 13',
    category: 'tv_chilena',
  },
  {
    baseName: 'Google News Fiebre de Baile Search',
    queryEs: 'Fiebre de Baile CHV',
    queryEn: 'Fiebre de Baile CHV dance show',
    category: 'fiebre_de_baile',
  },
  {
    baseName: 'Google News El Internado Mega Search',
    queryEs: 'El Internado Mega',
    queryEn: 'El Internado Mega reality show',
    category: 'el_internado_mega',
  },
  {
    baseName: 'Google News Vecinos al Limite Search',
    queryEs: 'Vecinos al Limite Chilevision',
    queryEn: 'Vecinos al Limite Chilevision reality show',
    category: 'vecinos_al_limite',
  },
  {
    baseName: 'Google News Musica Search',
    queryEs: 'musica pop latina conciertos festivales',
    queryEn: 'latin pop music concerts festivals',
    category: 'musica',
  },
  {
    baseName: 'Google News Streaming Search',
    queryEs: 'Netflix Prime Video Disney streaming series',
    queryEn: 'Netflix Prime Video Disney streaming series',
    category: 'streaming',
  },
  {
    baseName: 'Google News Tecnologia Search',
    queryEs: 'tecnologia inteligencia artificial apps Chile',
    queryEn: 'technology artificial intelligence apps Chile',
    category: 'tecnologia',
  },
  {
    baseName: 'Google News TV Argentina Search',
    queryEs: 'television argentina rating farandula',
    queryEn: 'Argentine television ratings entertainment',
    category: 'tv_argentina',
  },
  {
    baseName: 'Google News TV Mexico Search',
    queryEs: 'television mexicana Televisa TV Azteca',
    queryEn: 'Mexican television Televisa TV Azteca',
    category: 'tv_mexicana',
  },
  {
    baseName: 'Google News TV Espana Search',
    queryEs: 'television espanola Antena 3 Telecinco',
    queryEn: 'Spanish television Antena 3 Telecinco',
    category: 'tv_espanola',
  },
  {
    baseName: 'Google News TV Italia Search',
    queryEs: 'television italiana RAI Mediaset',
    queryEn: 'Italian television RAI Mediaset',
    category: 'tv_italiana',
  },
  {
    baseName: 'Google News TV USA Search',
    queryEs: 'television Estados Unidos Hollywood entretenimiento',
    queryEn: 'US television Hollywood entertainment',
    category: 'tv_usa',
  },
  {
    baseName: 'Google News Cine Search',
    queryEs: 'cine estrenos peliculas premios',
    queryEn: 'movies premieres films awards',
    category: 'cine',
  },
  {
    baseName: 'Google News Sanremo Search',
    queryEs: 'festival Sanremo musica',
    queryEn: 'Sanremo festival music',
    category: 'sanremo',
  },
  {
    baseName: 'Google News Eurovision Search',
    queryEs: 'Eurovision festival cancion',
    queryEn: 'Eurovision song contest',
    category: 'eurovision',
  },
];

export const LEGACY_FIXED_SOURCE_NAMES = [
  'Pagina7 Entretencion',
  'BioBio Espectaculos y TV',
  'TiempoX',
  'Fotech Feed',
  'Ojo a la Tele',
  'M360',
  'Cooperativa Magazine',
  'T13 EspectÃ¡culos',
  'T13 Espectaculos',
  '24 Horas EspectÃ¡culos',
  '24 Horas Espectaculos',
  'Mega Entretenimiento',
  'CHV Show',
  'La Hora EntretenciÃ³n',
  'La Hora Entretencion',
  'Lima LimÃ³n Feed',
  'Lima Limon Feed',
  'The Clinic Tiempo Libre Feed',
  'Glamorama',
  'TVBlog Italia',
  'Novella 2000',
  'Vertele ElDiario',
  'Variety TV',
  'Billboard Music',
  'Official Charts News',
  'La Cuarta Fiebre de Baile',
  'TiempoX Fiebre de Baile',
  'Google News Cooperativa',
  'Google News TV Internacional',
  'Google News Musica',
  // Google News search feeds (removed — will be replaced by another scraping method)
  'Google News TVN',
  'Google News Television Chile',
  'Google News Musica Pop Chileno',
  'Google News Musica Pop Latino',
  'Google News Musica Pop Anglo',
  'Google News Musica K-Pop',
  'Google News Musica Festivales',
  'Google News Streaming',
  'Google News Tecnologia Chile',
  'Google News Tecnologia Global',
  'Google News TV Argentina',
  'Google News TV Mexicana',
  'Google News Televisa Azteca',
  'Google News TV Española',
  'Google News Antena3 Telecinco',
  'Google News TV Italiana',
  'Google News RAI Mediaset',
  'Google News IMDb',
  'Google News TV USA',
  'Google News Hollywood Reporter',
  'Google News Cine Estrenos',
  'Google News Cine Premios',
  'Google News Sanremo',
  'Google News Eurovision',
  'Google News El Internado Mega',
  'Google News Vecinos al Limite',
  'Google News Fiebre de Baile',
  'Google News Fiebre de Baile CHV',
] as const;

export function buildNewsSourceSeeds(): Array<Partial<NewsSource>> {
  return [
    {
      name: 'Google News BioBio Chile',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqKQgKIiNDQklTRkFnTWFoQUtEbUpwYjJKcGIyTm9hV3hsTG1Oc0tBQVAB?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Pagina 7',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqJAgKIh5DQklTRUFnTWFnd0tDbkJoWjJsdVlUY3VZMndvQUFQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News La Cuarta',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqJggKIiBDQklTRWdnTWFnNEtER3hoWTNWaGNuUmhMbU52YlNnQVAB?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News La Nacion Chile',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqJQgKIh9DQklTRVFnTWFnMEtDMnhoYm1GamFXOXVMbU5zS0FBUAE?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News El Desconcierto',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqLQgKIidDQklTRndnTWFoTUtFV1ZzWkdWelkyOXVZMmxsY25SdkxtTnNLQUFQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Mega',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqIAgKIhpDQklTRFFnTWFna0tCMjFsWjJFdVkyd29BQVAB?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Meganoticias',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqKggKIiRDQklTRlFnTWFoRUtEMjFsWjJGdWIzUnBZMmxoY3k1amJDZ0FQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News CHV Noticias',
      url: googleNewsRssUrl(
        'https://news.google.com/topics/CAAqKQgKIiNDQkFTRkFvS0wyMHZNRjlzYkc1eGJSSUdaWE10TkRFNUtBQVAB?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News T13',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqHggKIhhDQklTREFnTWFnZ0tCblF4TXk1amJDZ0FQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Canal 13',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqHQgKIhdDQklTQ3dnTWFnY0tCVEV6TG1Oc0tBQVAB?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Billboard Music',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqKggKIiRDQklTRlFnTWFoRUtEMnhoYm1GamFXOXVMbU52YlM1aGNpZ0FQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_argentina',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Clarin Argentina',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqJAgKIh5DQklTRUFnTWFnd0tDbU5zWVhKcGJpNWpiMjBvQUFQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_argentina',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Billboard Music',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqKAgKIiJDQklTRXdnTWFnOEtEV0pwYkd4aWIyRnlaQzVqYjIwb0FBUAE?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    ...googleNewsSearchDefinitions.flatMap((definition) =>
      googleNewsSearchSeeds(definition),
    ),
  ];
}
