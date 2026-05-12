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

  const seeds: Array<Partial<NewsSource>> = [
    {
      name: 'TV Chilena RSS',
      url: 'https://news.google.com/rss/search?q=tv+chilena&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'TV Internacional RSS',
      url: 'https://news.google.com/rss/search?q=tv+internacional&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'tv_internacional',
      enabled: true,
    },
    {
      name: 'Musica RSS',
      url: 'https://news.google.com/rss/search?q=musica+chile&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'musica',
      enabled: true,
    },
    {
      name: 'Farandula RSS',
      url: 'https://news.google.com/rss/search?q=farandula+chile&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'farandula',
      enabled: true,
    },
    {
      name: 'Streaming RSS',
      url: 'https://news.google.com/rss/search?q=streaming+series&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'streaming',
      enabled: true,
    },
    {
      name: 'Radio RSS',
      url: 'https://news.google.com/rss/search?q=radio+chile&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'radio',
      enabled: true,
    },
    {
      name: 'Fiebre de Baile RSS',
      url: 'https://news.google.com/rss/search?q=fiebre+de+baile&hl=es-419&gl=CL&ceid=CL:es-419',
      type: 'rss',
      category: 'fiebre_de_baile',
      enabled: true,
    },
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
      name: 'Fotech',
      url: 'https://www.fotech.cl',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
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
        excludePattern: 'twitter\\.com/intent|tinyurl\\.com|/site/tax/|javascript:',
        maxItems: '50',
      },
    },
    {
      name: 'T13 Espectáculos',
      url: 'https://www.t13.cl/espectaculos',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: '24 Horas Espectáculos',
      url: 'https://www.24horas.cl/tendencias/espectaculos',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'Mega Entretenimiento',
      url: 'https://www.mega.cl/entretenimiento/',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'CHV Show',
      url: 'https://www.chilevision.cl/noticias/show/',
      type: 'html',
      category: 'tv_chilena',
      enabled: true,
    },
    {
      name: 'La Hora Entretención',
      url: 'https://lahora.cl/categoria/entretencion/',
      type: 'html',
      category: 'farandula',
      enabled: true,
    },
    {
      name: 'La Hora Global Feed',
      url: 'https://lahora.cl/rss/global.xml',
      type: 'rss',
      category: 'tv_chilena',
      enabled: true,
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
  ];

  for (const seed of seeds) {
    const existing = await repo.findOne({ where: { name: seed.name } });
    if (!existing) {
      await repo.save(repo.create(seed));
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
