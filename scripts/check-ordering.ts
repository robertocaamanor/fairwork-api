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

async function checkOrdering() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener las últimas 30 noticias ordenadas como lo hace el backend
    const result = await client.query(`
      SELECT 
        id,
        title,
        "sourceName",
        category,
        "publishedAt",
        "createdAt",
        score
      FROM news_items
      ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
      LIMIT 30
    `);

    console.log(`📰 Últimas ${result.rows.length} noticias ordenadas por publishedAt DESC:\n`);

    result.rows.forEach((row, index) => {
      const pubDate = new Date(row.publishedAt);
      const creDate = new Date(row.createdAt);
      const diff = Math.floor((creDate.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${row.title.substring(0, 50)}...`);
      console.log(`   Categoría: ${row.category}`);
      console.log(`   publishedAt: ${pubDate.toLocaleString('es-CL')}`);
      console.log(`   createdAt: ${creDate.toLocaleString('es-CL')}`);
      if (Math.abs(diff) > 1) {
        console.log(`   ⚠️ DIFERENCIA: ${diff} días`);
      }
      console.log('');
    });

    // Verificar si hay problemas de ordenamiento
    console.log('\n🔍 Verificando orden cronológico...');
    let outOfOrder = 0;
    for (let i = 1; i < result.rows.length; i++) {
      const prev = new Date(result.rows[i - 1].publishedAt);
      const curr = new Date(result.rows[i].publishedAt);
      
      if (curr > prev) {
        outOfOrder++;
        console.log(`❌ Fuera de orden en posición ${i}:`);
        console.log(`   ${result.rows[i - 1].title.substring(0, 40)} (${prev.toLocaleString('es-CL')})`);
        console.log(`   ${result.rows[i].title.substring(0, 40)} (${curr.toLocaleString('es-CL')})`);
      }
    }

    if (outOfOrder === 0) {
      console.log('✅ Todas las noticias están en orden correcto');
    } else {
      console.log(`\n❌ Encontradas ${outOfOrder} noticias fuera de orden`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkOrdering();
