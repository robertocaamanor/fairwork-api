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

async function checkNews() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar la noticia específica
    const result = await client.query(`
      SELECT 
        id,
        title,
        "sourceName",
        "publishedAt",
        "rawPublishedAt",
        "createdAt",
        "originalUrl"
      FROM news_items
      WHERE title LIKE '%Kathy Contreras%' 
         OR title LIKE '%Faloon%'
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);

    console.log(`📰 Encontradas ${result.rows.length} noticias:\n`);

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title.substring(0, 80)}...`);
      console.log(`   Fuente: ${row.sourceName}`);
      console.log(`   📅 publishedAt: ${row.publishedAt}`);
      console.log(`   📅 rawPublishedAt: ${row.rawPublishedAt || 'N/A'}`);
      console.log(`   📅 createdAt: ${row.createdAt}`);
      console.log(`   🔗 URL: ${row.originalUrl}`);
      console.log('');
    });

    // Verificar fuentes de Chilevision
    const sources = await client.query(`
      SELECT id, name, url, type, enabled
      FROM news_sources
      WHERE name LIKE '%chile%' OR url LIKE '%chilevision%'
    `);

    console.log('\n🔍 Fuentes de Chilevision:');
    sources.rows.forEach(source => {
      console.log(`   - ${source.name} (${source.type})`);
      console.log(`     URL: ${source.url}`);
      console.log(`     Enabled: ${source.enabled}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkNews();
