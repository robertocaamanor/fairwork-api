import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsSource } from './src/news/entities/news-source.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'news_monitor',
  entities: [NewsSource],
});

async function run() {
  await dataSource.initialize();
  await dataSource.query('UPDATE news_sources SET enabled = true');
  await dataSource.destroy();
  console.log('All sources enabled!');
}
run();
