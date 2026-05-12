import { DataSource } from 'typeorm';
import { NewsSource, NewsSourceType, NewsCategory } from '../src/news/entities/news-source.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function isSslEnabled(): boolean {
  return process.env.DATABASE_SSL === 'true';
}

function getSslOptions() {
  if (!isSslEnabled()) {
    return undefined;
  }

  return {
    rejectUnauthorized: false,
  };
}

function buildDataSourceOptions() {
  const ssl = getSslOptions();

  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl,
      extra: ssl ? { ssl } : undefined,
      entities: [NewsSource],
      synchronize: false,
    };
  }

  return {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl,
    extra: ssl ? { ssl } : undefined,
    entities: [NewsSource],
    synchronize: false,
  };
}

const AppDataSource = new DataSource(buildDataSourceOptions());

interface NewSource {
  name: string;
  url: string;
  type: NewsSourceType;
  category: NewsCategory;
}

const requestedFeeds: NewSource[] = [
  {
    name: 'Fotech Feed',
    url: 'https://www.fotech.cl/feed/',
    type: 'rss',
    category: 'tv_chilena',
  },
  {
    name: 'Lima Limón Feed',
    url: 'https://www.limalimon.cl/feed/',
    type: 'rss',
    category: 'tv_chilena',
  },
  {
    name: 'The Clinic Tiempo Libre Feed',
    url: 'https://www.theclinic.cl/noticias/tiempo-libre/feed/',
    type: 'rss',
    category: 'tv_chilena',
  },
  {
    name: 'La Hora Global Feed',
    url: 'https://lahora.cl/rss/global.xml',
    type: 'rss',
    category: 'tv_chilena',
  },
  {
    name: 'TVBlog Italia',
    url: 'https://www.tvblog.it/feed',
    type: 'rss',
    category: 'tv_internacional',
  },
  {
    name: 'Novella 2000',
    url: 'https://www.novella2000.it/feed/',
    type: 'rss',
    category: 'tv_internacional',
  },
];

async function addTvFeeds() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const repo = AppDataSource.getRepository(NewsSource);
    let added = 0;
    let skipped = 0;

    for (const sourceData of requestedFeeds) {
      const existing = await repo.findOne({
        where: [{ url: sourceData.url }, { name: sourceData.name }],
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
      console.log(`✅ Agregada: ${sourceData.name} (${sourceData.category})`);
      added++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Agregadas: ${added}`);
    console.log(`   ⏭️  Ya existían: ${skipped}`);
    console.log(`   📝 Total procesadas: ${requestedFeeds.length}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

addTvFeeds();