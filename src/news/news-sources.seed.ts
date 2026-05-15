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
    {
      name: 'Google News IMDb',
      url: googleNewsSearchUrl('imdb'),
      type: 'rss',
      category: 'tv_usa',
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
    // ========== MUSICA ==========
    {
      name: 'Google News Musica Pop Chileno',
      url: googleNewsSearchUrl(
        '(pop OR cantante OR musica OR artista OR disco) (chileno OR chilena OR Chile)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Musica Pop Latino',
      url: googleNewsSearchUrl(
        '(regueton OR "pop latino" OR urbano OR cumbia OR salsa OR bachata OR latin)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Musica Pop Anglo',
      url: googleNewsSearchUrl(
        '(pop OR rock OR indie OR alternative OR chart OR Billboard OR Grammy) (english OR "United Kingdom" OR USA OR global)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Musica K-Pop',
      url: googleNewsSearchUrl(
        '(kpop OR "k-pop" OR BTS OR BLACKPINK OR NewJeans OR TWICE OR STRAY KIDS)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Musica Festivales',
      url: googleNewsSearchUrl(
        '(festival OR Lollapalooza OR Coachella OR "Primavera Sound" OR concierto OR tour OR gira)',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== STREAMING ==========
    {
      name: 'Google News Streaming',
      url: googleNewsSearchUrl(
        '(streaming OR Netflix OR "Prime Video" OR "Disney+" OR Max OR "Apple TV" OR serie OR pelicula)',
      ),
      type: 'rss',
      category: 'streaming',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== TECNOLOGIA ==========
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
    // ========== TV ARGENTINA ==========
    {
      name: 'Google News TV Argentina',
      url: googleNewsSearchUrl(
        '(television OR TV OR teleserie OR telenovela OR farandula OR espectaculos) Argentina',
        3,
      ),
      type: 'rss',
      category: 'tv_argentina',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== TV MEXICANA ==========
    {
      name: 'Google News TV Mexicana',
      url: googleNewsSearchUrl(
        '(television OR TV OR telenovela OR farandula OR espectaculos OR serie) Mexico',
        3,
      ),
      type: 'rss',
      category: 'tv_mexicana',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Televisa Azteca',
      url: googleNewsSearchUrl(
        '(Televisa OR "TV Azteca" OR Telemundo OR Univision)',
        3,
      ),
      type: 'rss',
      category: 'tv_mexicana',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== TV ESPAÑOLA ==========
    {
      name: 'Google News TV Española',
      url: googleNewsSearchUrl(
        '(television OR TV OR serie OR concurso OR telenovela OR espectaculo) España',
        3,
      ),
      type: 'rss',
      category: 'tv_espanola',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Antena3 Telecinco',
      url: googleNewsSearchUrl(
        '(Antena3 OR Telecinco OR RTVE OR "La 1" OR "La Sexta" OR Cuatro)',
        3,
      ),
      type: 'rss',
      category: 'tv_espanola',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== TV ITALIANA ==========
    {
      name: 'Google News TV Italiana',
      url: googleNewsSearchUrl(
        '(televisione OR "serie TV" OR fiction OR reality OR programma) Italia',
        3,
      ),
      type: 'rss',
      category: 'tv_italiana',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News RAI Mediaset',
      url: googleNewsSearchUrl(
        '(RAI OR Mediaset OR Canale5 OR "Grande Fratello" OR "Tale e Quale")',
        3,
      ),
      type: 'rss',
      category: 'tv_italiana',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== TV USA ==========
    {
      name: 'Google News TV USA',
      url: googleNewsSearchUrl(
        '(television OR TV OR series OR reality OR Emmy OR Hollywood OR premiere)',
        3,
      ),
      type: 'rss',
      category: 'tv_usa',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Hollywood Reporter',
      url: googleNewsSearchUrl(
        '("Hollywood Reporter" OR Variety OR Deadline OR "Entertainment Weekly")',
        3,
      ),
      type: 'rss',
      category: 'tv_usa',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    // ========== CINE ==========
    {
      name: 'Google News Cine Estrenos',
      url: googleNewsSearchUrl(
        '(pelicula OR cine OR estreno OR taquilla OR director OR actor OR actriz)',
        3,
      ),
      type: 'rss',
      category: 'cine',
      enabled: true,
      selectors: googleNewsSelectors,
    },
    {
      name: 'Google News Cine Premios',
      url: googleNewsSearchUrl(
        '(Oscar OR Cannes OR "Golden Globe" OR BAFTA OR Sundance OR festival de cine)',
        7,
      ),
      type: 'rss',
      category: 'cine',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '168',
      },
    },
    // ========== SANREMO ==========
    {
      name: 'Google News Sanremo',
      url: googleNewsSearchUrl('(Sanremo OR "Festival di Sanremo")', 90),
      type: 'rss',
      category: 'sanremo',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '2160',
      },
    },
    // ========== EUROVISIÓN ==========
    {
      name: 'Google News Eurovision',
      url: googleNewsSearchUrl('(Eurovision OR "Festival de Eurovisión")', 90),
      type: 'rss',
      category: 'eurovision',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '2160',
      },
    },
    // ========== EL INTERNADO MEGA ==========
    {
      name: 'Google News El Internado Mega',
      url: googleNewsSearchUrl(
        '("El Internado" OR "El Internado Pacifico Norte" OR "El Internado Las Cumbres")',
        14,
      ),
      type: 'rss',
      category: 'el_internado_mega',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '336',
      },
    },
    // ========== VECINOS AL LÍMITE ==========
    {
      name: 'Google News Vecinos al Limite',
      url: googleNewsSearchUrl('"Vecinos al limite" OR "vecinos al límite"', 14),
      type: 'rss',
      category: 'vecinos_al_limite',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '336',
      },
    },
    // ========== FIEBRE DE BAILE ==========
    {
      name: 'Google News Fiebre de Baile',
      url: googleNewsSearchUrl('"Fiebre de Baile"', 30),
      type: 'rss',
      category: 'fiebre_de_baile',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '720',
      },
    },
    {
      name: 'Google News Fiebre de Baile CHV',
      url: googleNewsSearchUrl('"Fiebre de Baile" (CHV OR Chilevisión OR rating OR estelar OR baile)', 30),
      type: 'rss',
      category: 'fiebre_de_baile',
      enabled: true,
      selectors: {
        ...googleNewsSelectors,
        maxAgeHours: '720',
      },
    },
  ];
}
