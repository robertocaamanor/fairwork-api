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

async function checkTvChilena() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    const result = await client.query(`
      SELECT 
        id,
        title,
        "sourceName",
        "publishedAt",
        "createdAt"
      FROM news_items
      WHERE category = 'tv_chilena'
      ORDER BY "publishedAt" DESC
      LIMIT 10
    `);

    console.log(`📺 Últimas ${result.rows.length} noticias de TV CHILENA:\n`);

    result.rows.forEach((row, index) => {
      const pubDate = new Date(row.publishedAt);
      const creDate = new Date(row.createdAt);
      
      console.log(`${index + 1}. ${row.title.substring(0, 60)}...`);
      console.log(`   Fuente: ${row.sourceName}`);
      console.log(`   publishedAt: ${pubDate.toLocaleString('es-CL')}`);
      console.log(`   createdAt: ${creDate.toLocaleString('es-CL')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkTvChilena();
