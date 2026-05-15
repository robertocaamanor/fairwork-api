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
  maxAgeHours: '24',
  sortOrder: 'desc',
  excludedDomains: 'tvenserio.com',
};

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
    // ========== MUSICA ==========
    // (feeds de búsqueda eliminados — pendiente nuevo método de scraping)
  ];
}
