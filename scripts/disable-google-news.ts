import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'news_monitor',
});

async function disableGoogleNews() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Deshabilitar todas las fuentes de Google News
    const result = await client.query(`
      UPDATE news_sources
      SET enabled = false
      WHERE url LIKE '%news.google.com%'
      RETURNING name, url, enabled
    `);

    if (result.rows.length > 0) {
      console.log('🚫 Fuentes de Google News deshabilitadas:\n');
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.name}`);
        console.log(`    URL: ${row.url}`);
        console.log(`    Enabled: ${row.enabled}\n`);
      });
    } else {
      console.log('ℹ️  No se encontraron fuentes de Google News\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

disableGoogleNews();
