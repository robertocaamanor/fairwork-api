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

async function deleteGoogleNewsItems() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Eliminar noticias de Google News RSS
    const result = await client.query(`
      DELETE FROM news_items
      WHERE "sourceUrl" LIKE '%news.google.com%'
      RETURNING id, title, "sourceName", "publishedAt"
    `);

    if (result.rows.length > 0) {
      console.log(`🗑️  Eliminadas ${result.rows.length} noticias de Google News:\n`);
      result.rows.slice(0, 10).forEach((row, index) => {
        console.log(`${index + 1}. ${row.title.substring(0, 60)}...`);
        console.log(`   Fuente: ${row.sourceName}`);
        console.log(`   Fecha: ${new Date(row.publishedAt).toLocaleString('es-CL')}\n`);
      });
      
      if (result.rows.length > 10) {
        console.log(`   ... y ${result.rows.length - 10} más\n`);
      }
    } else {
      console.log('ℹ️  No se encontraron noticias de Google News\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

deleteGoogleNewsItems();
