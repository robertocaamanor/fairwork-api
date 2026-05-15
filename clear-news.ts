import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { NewsSource } from './src/news/entities/news-source.entity';
import { NewsItem } from './src/news/entities/news-item.entity';
import { EditorialReview } from './src/editorial/entities/editorial-review.entity';

function buildDataSourceOptions(): DataSourceOptions {
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [NewsSource, NewsItem, EditorialReview],
    };
  }
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'news_monitor',
    entities: [NewsSource, NewsItem, EditorialReview],
  };
}

async function run() {
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();

  await dataSource.query('TRUNCATE TABLE editorial_reviews CASCADE');
  await dataSource.query('TRUNCATE TABLE news_items CASCADE');

  await dataSource.destroy();
  console.log('✓ news_items y editorial_reviews vaciados. Las fuentes se mantienen intactas.');
}

run().catch((err) => {
  console.error('Error al limpiar la base de datos:', err);
  process.exit(1);
});
