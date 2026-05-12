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

async function verifyMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar estadísticas
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_noticias,
        COUNT(CASE WHEN "publishedAt" IS NULL THEN 1 END) as con_fecha_null,
        COUNT(CASE WHEN "publishedAt" > CURRENT_TIMESTAMP + INTERVAL '1 day' THEN 1 END) as fechas_futuras,
        COUNT(CASE WHEN "publishedAt" < '2015-01-01' THEN 1 END) as fechas_antiguas,
        COUNT(CASE WHEN "rawPublishedAt" IS NOT NULL THEN 1 END) as con_raw_date,
        MIN("publishedAt") as fecha_mas_antigua,
        MAX("publishedAt") as fecha_mas_reciente
      FROM news_items;
    `);

    console.log('📊 Estadísticas de la migración:');
    console.table(stats.rows);

    // Verificar últimas noticias
    const latest = await client.query(`
      SELECT 
        id,
        title,
        "publishedAt",
        "rawPublishedAt",
        "createdAt"
      FROM news_items
      ORDER BY "publishedAt" DESC
      LIMIT 5;
    `);

    console.log('\n📰 Últimas 5 noticias por fecha:');
    latest.rows.forEach(row => {
      console.log(`\n- ${row.title.substring(0, 60)}...`);
      console.log(`  publishedAt: ${row.publishedAt}`);
      console.log(`  rawPublishedAt: ${row.rawPublishedAt || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verifyMigration();
