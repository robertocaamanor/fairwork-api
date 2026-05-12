import { config } from 'dotenv';
import { Client } from 'pg';

config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '15432'),
    database: process.env.DB_NAME || 'news_monitor',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar fuentes de Fiebre de Baile
    const sources = await client.query(`
      SELECT id, name, url, enabled, type, 
             COALESCE(selectors::text, 'NULL') as selectors
      FROM news_sources 
      WHERE category = 'fiebre_de_baile'
      ORDER BY name
    `);

    console.log(`📋 Fuentes de Fiebre de Baile: ${sources.rows.length}\n`);
    
    for (const source of sources.rows) {
      console.log(`${source.enabled ? '✅' : '❌'} ${source.name}`);
      console.log(`   URL: ${source.url}`);
      console.log(`   Tipo: ${source.type}`);
      console.log(`   Selectores: ${source.selectors}`);
      console.log('');
    }

    // Verificar si hay noticias scrapeadas
    const news = await client.query(`
      SELECT COUNT(*) as count
      FROM news_items ni
      JOIN news_sources ns ON ni.source_id = ns.id
      WHERE ns.category = 'fiebre_de_baile'
    `);

    console.log(`📰 Noticias encontradas: ${news.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
