import 'dotenv/config';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function buildClient(): Client {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'news_monitor',
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

async function runMigration() {
  const client = buildClient();

  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();

    const sqlFilePath = path.join(__dirname, 'expand_news_items_source_url.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log(`Ejecutando migracion: ${path.basename(sqlFilePath)}`);
    await client.query(sql);

    const verify = await client.query(
      `SELECT column_name, data_type, is_nullable, character_maximum_length
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'news_items'
         AND column_name = 'sourceUrl'`,
    );

    console.table(verify.rows);
    console.log('Migracion completada.');
  } finally {
    await client.end();
  }
}

runMigration().catch((error) => {
  console.error('Error ejecutando migracion de news_items.sourceUrl:', error);
  process.exit(1);
});