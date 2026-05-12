import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsSource } from './src/news/entities/news-source.entity';
import { NewsItem } from './src/news/entities/news-item.entity';
import { EditorialReview } from './src/editorial/entities/editorial-review.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'news_monitor',
  entities: [NewsSource, NewsItem, EditorialReview],
});

async function run() {
  await dataSource.initialize();
  await dataSource.query('TRUNCATE TABLE news_items CASCADE');
  await dataSource.query('TRUNCATE TABLE news_sources CASCADE');
  await dataSource.query('TRUNCATE TABLE editorial_reviews CASCADE');
  await dataSource.destroy();
  console.log('Database cleared!');
}
run();
