import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsSource } from './news/entities/news-source.entity';
import { buildNewsSourceSeeds } from './news/news-sources.seed';

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

  for (const seed of buildNewsSourceSeeds()) {
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
