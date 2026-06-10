import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsSource } from './news/entities/news-source.entity';
import {
  buildNewsSourceSeeds,
  LEGACY_FIXED_SOURCE_NAMES,
} from './news/news-sources.seed';

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
    entities: [NewsSource],
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

const dataSource = buildDataSource();

async function runSeed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(NewsSource);
  const seeds = buildNewsSourceSeeds();
  const seedUrls = seeds
    .map((seed) => seed.url)
    .filter((url): url is string => typeof url === 'string');

  for (const seed of seeds) {
    const existing = seed.name
      ? await repo.findOne({ where: { name: seed.name } })
      : seed.url && seed.category
        ? await repo.findOne({
            where: { url: seed.url, category: seed.category },
          })
        : null;

    if (!existing) {
      await repo.save(repo.create(seed));
    } else {
      await repo.save(repo.merge(existing, seed));
    }
  }

  const qb = repo
    .createQueryBuilder()
    .update(NewsSource)
    .set({ enabled: false });

  if (seedUrls.length > 0) {
    qb.where('url NOT IN (:...seedUrls)', { seedUrls });
  } else {
    qb.where('1=1');
  }

  qb.orWhere('category = :category', { category: 'farandula' });

  qb.orWhere('type IN (:...disabledTypes)', {
    disabledTypes: ['html', 'wordpress'],
  });

  if (LEGACY_FIXED_SOURCE_NAMES.length > 0) {
    qb.orWhere('name IN (:...legacyNames)', {
      legacyNames: [...LEGACY_FIXED_SOURCE_NAMES],
    });
  }

  await qb.execute();

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
