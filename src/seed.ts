import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsSource } from './news/entities/news-source.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'news_monitor',
  entities: [NewsSource],
  synchronize: true,
});

async function runSeed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(NewsSource);

  const googleNewsSearchUrl = (
    query: string,
    gl: string,
    hl: string,
  ): string => {
    const ceidLanguage = hl.split('-')[0];
    const params = new URLSearchParams({
      q: query,
      hl,
      gl,
      ceid: `${gl}:${ceidLanguage}`,
    });

    return `https://news.google.com/rss/search?${params.toString()}`;
  };

  const seeds: Array<Partial<NewsSource>> = [
    {
      name: 'Pagina7 Entretencion',
      url: 'https://www.pagina7.cl/entretencion/',
      type: 'html',
      category: 'farandula',
      enabled: true,
      selectors: {
        linkPattern: '^https?://(www\\.)?pagina7\\.cl/entretencion/[^?#]+/?$',
        excludePattern: '/page/|/entretencion/$',
        maxItems: '40',
      },
    },
    {
      name: 'BioBio Espectaculos y TV',
      url: 'https://www.biobiochile.cl/lista/categorias/espectaculos-y-tv',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'TiempoX',
      url: 'https://www.tiempox.com/',
      type: 'html',
      category: 'farandula',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?tiempox\\.com/[a-z-]+/\\d{4}/\\d{2}/\\d{2}/[^?#]+/?$',
        excludePattern: '/podcast/|/videos/|/tag/',
        maxItems: '40',
      },
    },
    {
      name: 'Fotech Feed',
      url: 'https://www.fotech.cl/feed/',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'Ojo a la Tele',
      url: 'https://ojoalatele.com/feed/',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'M360',
      url: 'https://www.m360.cl',
      type: 'html',
      category: 'farandula',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?m360\\.cl/noticias/.+/\\d{4}-\\d{2}-\\d{2}/\\d+\\.html$',
        excludePattern: 'twitter\\.com/intent|/noticias/stat/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Cooperativa Magazine',
      url: 'https://www.cooperativa.cl/noticias/magazine',
      type: 'html',
      category: 'radio',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?cooperativa\\.cl/noticias/magazine/.+/\\d{4}-\\d{2}-\\d{2}/\\d+\\.html$',
        excludePattern:
          'twitter\\.com/intent|tinyurl\\.com|/site/tax/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'T13 Espectáculos',
      url: 'https://www.t13.cl/espectaculos',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?t13\\.cl/noticia/(espectaculos|tendencias)/[^?#]+/?$',
        excludePattern: '/videos/|/programas/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: '24 Horas Espectáculos',
      url: 'https://www.24horas.cl/tendencias/espectaculos',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?24horas\\.cl/(tendencias/espectaculos|show|espectaculos)/[^?#]+/?$',
        excludePattern: '/videos/|/programas/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Mega Entretenimiento',
      url: 'https://www.mega.cl/entretenimiento/',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?mega\\.cl/(entretenimiento|programas)/[^?#]+/?$',
        excludePattern: '/capitulos/|/videos/|/en-vivo/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'CHV Show',
      url: 'https://www.chilevision.cl/noticias/show/',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?chilevision\\.cl/noticias/show/[^?#]+/?$',
        excludePattern: '/videos/|/programas/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'La Hora Entretención',
      url: 'https://lahora.cl/categoria/entretencion/',
      type: 'html',
      category: 'farandula',
      enabled: true,
      selectors: {
        linkPattern: '^https?://(www\\.)?lahora\\.cl/entretencion/[^?#]+/?$',
        excludePattern: '/page/|/categoria/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Lima Limón Feed',
      url: 'https://www.limalimon.cl/feed/',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'The Clinic Tiempo Libre Feed',
      url: 'https://www.theclinic.cl/noticias/tiempo-libre/feed/',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'Glamorama',
      url: 'https://www.lacuarta.com/glamorama/',
      type: 'html',
      category: 'farandula',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?lacuarta\\.com/(glamorama|espectaculos)/[^?#]+/?$',
        excludePattern: '/temas/|/page/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'TVBlog Italia',
      url: 'https://www.tvblog.it/feed',
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Novella 2000',
      url: 'https://www.novella2000.it/feed/',
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Vertele ElDiario',
      url: 'https://www.eldiario.es/vertele/',
      type: 'html',
      category: 'tv_internacional',
      enabled: true,
      selectors: {
        linkPattern: '^https?://(www\\.)?eldiario\\.es/vertele/[^?#]+/?$',
        excludePattern: '/rss/|/videos/|/tags/|/page/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Variety TV',
      url: 'https://variety.com/v/tv/',
      type: 'html',
      category: 'tv_internacional',
      enabled: true,
      selectors: {
        linkPattern: '^https?://(www\\.)?variety\\.com/\\d{4}/tv/[^?#]+/?$',
        excludePattern: '/video/|/gallery/|/tags/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Billboard Music',
      url: 'https://www.billboard.com/c/music/',
      type: 'html',
      category: 'musica',
      enabled: true,
      selectors: {
        linkPattern: '^https?://(www\\.)?billboard\\.com/(music|pro)/[^?#]+/?$',
        excludePattern: '/video/|/photos/|/charts/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'Official Charts News',
      url: 'https://www.officialcharts.com/news/',
      type: 'html',
      category: 'musica',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?officialcharts\\.com/(chart-news|news)/[^?#]+/?$',
        excludePattern: '/archive/|/charts/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'La Cuarta Fiebre de Baile',
      url: 'https://www.lacuarta.com/temas/fiebre-de-baile/',
      type: 'html',
      category: 'fiebre_de_baile',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?lacuarta\\.com/(espectaculos|glamorama)/[^?#]+/?$',
        excludePattern: '/temas/|/page/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'TiempoX Fiebre de Baile',
      url: 'https://www.tiempox.com/temas/fiebre-de-baile/',
      type: 'html',
      category: 'fiebre_de_baile',
      enabled: true,
      selectors: {
        linkPattern:
          '^https?://(www\\.)?tiempox\\.com/[a-z-]+/\\d{4}/\\d{2}/\\d{2}/[^?#]+/?$',
        excludePattern: '/podcast/|/videos/|/tag/|/temas/',
        maxItems: '50',
      },
    },
    {
      name: 'Google News Television Chile',
      url: googleNewsSearchUrl(
        '(television OR TV OR teleseries OR farandula) Chile',
        'CL',
        'es-419',
      ),
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'Google News Musica',
      url: googleNewsSearchUrl(
        '(musica OR cantante OR album OR concierto)',
        'CL',
        'es-419',
      ),
      type: 'rss',
      category: 'musica',
      enabled: true,
    },
    {
      name: 'Google News Streaming',
      url: googleNewsSearchUrl(
        '(streaming OR Netflix OR Prime Video OR Disney+ OR Max)',
        'CL',
        'es-419',
      ),
      type: 'rss',
      category: 'streaming',
      enabled: true,
    },
    {
      name: 'Google News TV Internacional España',
      url: googleNewsSearchUrl(
        '(television OR TV OR series) España',
        'ES',
        'es-419',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Google News TV Internacional Italia',
      url: googleNewsSearchUrl(
        '(televisione OR TV OR serie) Italia',
        'IT',
        'it',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Google News TV Internacional Estados Unidos',
      url: googleNewsSearchUrl(
        '(television OR TV OR series) "United States"',
        'US',
        'en-US',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Google News TV Internacional Argentina',
      url: googleNewsSearchUrl(
        '(television OR TV OR series) Argentina',
        'AR',
        'es-419',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Google News TV Internacional México',
      url: googleNewsSearchUrl(
        '(television OR TV OR series) Mexico',
        'MX',
        'es-419',
      ),
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
  ];

  for (const seed of seeds) {
    const existing = await repo.findOne({ where: { name: seed.name } });
    if (!existing) {
      await repo.save(repo.create(seed));
    } else {
      await repo.save(repo.merge(existing, seed));
    }
  }

  await dataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

runSeed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
