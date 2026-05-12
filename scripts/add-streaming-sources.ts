import { DataSource } from 'typeorm';
import { NewsSource, NewsSourceType, NewsCategory } from '../src/news/entities/news-source.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [NewsSource],
  synchronize: false,
});

interface NewSource {
  name: string;
  url: string;
  type: NewsSourceType;
  category: NewsCategory;
  selectors?: Record<string, string>;
}

const streamingSources: NewSource[] = [
  // Netflix News - RSS internacional
  {
    name: 'What\'s on Netflix',
    url: 'https://www.whats-on-netflix.com/feed/',
    type: 'rss',
    category: 'streaming',
  },
  // Variety Streaming
  {
    name: 'Variety Streaming',
    url: 'https://variety.com/c/streaming/',
    type: 'html',
    category: 'streaming',
    selectors: {
      linkPattern: '/\\d{4}/\\w+/',
      excludePattern: '/(tag|author|category)/',
      maxItems: '20',
    },
  },
  // BioBio Streaming
  {
    name: 'BioBio Streaming',
    url: 'https://www.biobiochile.cl/lista/categorias/plataformas',
    type: 'html',
    category: 'streaming',
    selectors: {
      article: 'article.article',
      title: 'h3 a, h2 a',
      link: 'a',
      summary: 'p',
      image: 'img',
      date: 'time',
    },
  },
  // T13 Streaming/Tecnología
  {
    name: 'T13 Streaming',
    url: 'https://www.t13.cl/noticia/tendencias',
    type: 'html',
    category: 'streaming',
    selectors: {
      linkPattern: '/noticias/',
      maxItems: '20',
    },
  },
  // The Verge Entertainment (streaming/tech)
  {
    name: 'The Verge Entertainment',
    url: 'https://www.theverge.com/entertainment/rss/index.xml',
    type: 'rss',
    category: 'streaming',
  },
  // Deadline Streaming (Hollywood Reporter)
  {
    name: 'Deadline Streaming',
    url: 'https://deadline.com/tag/streaming/feed/',
    type: 'rss',
    category: 'streaming',
  },
  // TechCrunch Entertainment
  {
    name: 'TechCrunch Entertainment',
    url: 'https://techcrunch.com/category/entertainment/feed/',
    type: 'rss',
    category: 'streaming',
  },
  // Fayerwayer Chile (Tecnología y streaming)
  {
    name: 'FayerWayer Chile',
    url: 'https://www.fayerwayer.com/feed/',
    type: 'rss',
    category: 'streaming',
  },
];

async function addStreamingSources() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const repo = AppDataSource.getRepository(NewsSource);
    let added = 0;
    let skipped = 0;

    for (const sourceData of streamingSources) {
      const existing = await repo.findOne({
        where: { url: sourceData.url },
      });

      if (existing) {
        console.log(`⏭️  Ya existe: ${sourceData.name}`);
        skipped++;
        continue;
      }

      const source = repo.create({
        ...sourceData,
        enabled: true,
      });

      await repo.save(source);
      console.log(`✅ Agregada: ${sourceData.name}`);
      added++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Agregadas: ${added}`);
    console.log(`   ⏭️  Ya existían: ${skipped}`);
    console.log(`   📝 Total procesadas: ${streamingSources.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addStreamingSources();
