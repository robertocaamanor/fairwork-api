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

async function fixOutdatedDates() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar noticias con fechas muy desactualizadas
    const outdated = await client.query(`
      SELECT 
        id,
        title,
        "sourceName",
        "publishedAt",
        "createdAt"
      FROM news_items
      WHERE "publishedAt" < $1
        AND "createdAt" > $1
      ORDER BY "createdAt" DESC
      LIMIT 50
    `, [thirtyDaysAgo]);

    console.log(`🔍 Encontradas ${outdated.rows.length} noticias con fechas desactualizadas:\n`);

    if (outdated.rows.length === 0) {
      console.log('✅ No hay noticias para corregir');
      await client.end();
      return;
    }

    // Mostrar primeras 5
    outdated.rows.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. ${row.title.substring(0, 60)}...`);
      console.log(`   publishedAt: ${row.publishedAt} ❌`);
      console.log(`   createdAt: ${row.createdAt} ✅`);
      console.log('');
    });

    // Actualizar todas las fechas desactualizadas
    const result = await client.query(`
      UPDATE news_items
      SET 
        "publishedAt" = "createdAt",
        "rawPublishedAt" = "publishedAt"::TEXT
      WHERE "publishedAt" < $1
        AND "createdAt" > $1
    `, [thirtyDaysAgo]);

    console.log(`\n✅ Actualizadas ${result.rowCount} noticias`);
    console.log(`   Las fechas ahora usan createdAt en lugar de publishedAt desactualizado`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixOutdatedDates();
