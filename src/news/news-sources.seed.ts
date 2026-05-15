import { NewsSource } from './entities/news-source.entity';

const GOOGLE_NEWS_HL = 'es-419';
const GOOGLE_NEWS_GL = 'CL';
const GOOGLE_NEWS_CEID = 'CL:es-419';

const googleNewsSearchUrl = (query: string, windowDays = 1): string => {
  const params = new URLSearchParams({
    q: `${query} when:${windowDays}d`,
    hl: GOOGLE_NEWS_HL,
    gl: GOOGLE_NEWS_GL,
    ceid: GOOGLE_NEWS_CEID,
  });

  return `https://news.google.com/rss/search?${params.toString()}`;
};

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
      name: 'Google News TVN',
      url: googleNewsSearchUrl('(TVN OR "Television Nacional de Chile")'),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News La Nacion Argentina',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqKggKIiRDQklTRlFnTWFoRUtEMnhoYm1GamFXOXVMbU52YlM1aGNpZ0FQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Clarin Argentina',
      url: googleNewsRssUrl(
        'https://news.google.com/publications/CAAqJAgKIh5DQklTRUFnTWFnd0tDbU5zWVhKcGJpNWpiMjBvQUFQAQ?hl=es-419&gl=CL&ceid=CL%3Aes-419',
      ),
      type: 'rss',
      category: 'tv_internacional',
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
    {
      name: 'Google News IMDb',
      url: googleNewsSearchUrl('imdb'),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Television Chile',
      url: googleNewsSearchUrl(
        '(television OR TV OR teleseries OR reality OR farandula OR espectaculos) Chile',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Musica',
      url: googleNewsSearchUrl(
        '(musica OR cantante OR album OR concierto OR festival)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Streaming',
      url: googleNewsSearchUrl(
        '(streaming OR Netflix OR Prime Video OR Disney+ OR Max OR serie OR pelicula)',
      ),
      type: 'rss',
      category: 'streaming',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Tecnologia Chile',
      url: googleNewsSearchUrl(
        '(android OR smartphones OR Google OR Samsung OR "inteligencia artificial" OR IA OR tecnologia) Chile',
      ),
      type: 'rss',
      category: 'tecnologia',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Tecnologia Global',
      url: googleNewsSearchUrl(
        '(android OR smartphones OR Google OR Samsung OR "artificial intelligence" OR AI OR technology)',
      ),
      type: 'rss',
      category: 'tecnologia',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News TV Internacional',
      url: googleNewsSearchUrl(
        '(television OR TV OR series OR reality OR entertainment) (Argentina OR Mexico OR Spain OR Italy OR "United States")',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Fiebre de Baile',
      url: googleNewsSearchUrl('"Fiebre de Baile"', 7),
      type: 'rss',
      category: 'fiebre_de_baile',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '168',
      },
    },
  ];
}
