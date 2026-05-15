import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsItem } from '../src/news/entities/news-item.entity';
import { NewsSource } from '../src/news/entities/news-source.entity';
import {
  LEGACY_FIXED_SOURCE_NAMES,
  buildNewsSourceSeeds,
} from '../src/news/news-sources.seed';

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

function buildDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;
  const ssl = getSslOptions();
  const commonOptions = {
    entities: [NewsItem, NewsSource],
    synchronize: true,
    ssl,
    extra: ssl ? { ssl } : undefined,
  };

  if (databaseUrl) {
    return new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ...commonOptions,
    });
  }

  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'news_monitor',
    ...commonOptions,
  });
}

async function run() {
  const dataSource = buildDataSource();
  await dataSource.initialize();

  try {
    const sourceRepo = dataSource.getRepository(NewsSource);
    const seeds = buildNewsSourceSeeds();
    const seedNames = seeds
      .map((seed) => seed.name)
      .filter((name): name is string => typeof name === 'string');

    for (const seed of seeds) {
      const existing = await sourceRepo.findOne({ where: { name: seed.name } });
      if (!existing) {
        await sourceRepo.save(sourceRepo.create(seed));
      } else {
        await sourceRepo.save(sourceRepo.merge(existing, seed));
      }
    }

    await sourceRepo
      .createQueryBuilder()
      .update(NewsSource)
      .set({ enabled: false })
      .where('name NOT IN (:...seedNames)', { seedNames })
      .orWhere('category = :category', { category: 'farandula' })
      .orWhere('type IN (:...disabledTypes)', {
        disabledTypes: ['html', 'wordpress'],
      })
      .orWhere('name IN (:...legacyNames)', {
        legacyNames: [...LEGACY_FIXED_SOURCE_NAMES],
      })
      .execute();

    await dataSource.query('TRUNCATE TABLE news_items');

    console.log(
      JSON.stringify(
        {
          sourcesSeeded: seeds.length,
          legacySourcesDisabled: LEGACY_FIXED_SOURCE_NAMES.length,
          newsItemsCleared: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Reset failed:', error);
  process.exitCode = 1;
});
