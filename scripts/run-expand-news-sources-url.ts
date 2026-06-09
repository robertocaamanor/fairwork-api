import 'dotenv/config';
import { Client } from 'pg';

const MIGRATION_SQL = `
ALTER TABLE news_sources
ALTER COLUMN url TYPE text;
`;

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

    console.log('Ejecutando migracion: expand_news_sources_url');
    await client.query(MIGRATION_SQL);

    const verify = await client.query(
      `SELECT column_name, data_type, is_nullable, character_maximum_length
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'news_sources'
         AND column_name = 'url'`,
    );

    console.table(verify.rows);
    console.log('Migracion completada.');
  } finally {
    await client.end();
  }
}

runMigration().catch((error) => {
  console.error('Error ejecutando migracion de news_sources.url:', error);
  process.exit(1);
});