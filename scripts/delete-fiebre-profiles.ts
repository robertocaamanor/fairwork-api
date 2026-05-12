import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function deleteProfileNews() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Eliminar noticias de perfiles de CHV (Junior Playboy, Diego Venegas, Mariela Sotomayor, etc.)
    const result = await client.query(
      `DELETE FROM news_items 
       WHERE "sourceName" = 'CHV Fiebre de Baile' 
       AND ("originalUrl" LIKE '%/programas/fiebre-de-baile/%' 
            OR title IN ('Junior Playboy', 'Diego Venegas', 'Mariela Sotomayor', 
                         'Kathy Contreras', 'Consuelo Saavedra', 'Marlén Olivarí',
                         'Patricio Torres', 'Ignacio Gutiérrez', 'José Luis Repenning',
                         'Iván Núñez', 'Sergio Lagos', 'Karen Doggenweiler'))
       RETURNING id, title, "sourceName", "originalUrl"`,
    );

    console.log(`🗑️  Eliminadas ${result.rowCount} noticias de perfiles de participantes:\n`);
    
    if (result.rows.length > 0) {
      result.rows.slice(0, 10).forEach((row) => {
        console.log(`   - ${row.title} (${row.sourceName})`);
        console.log(`     ${row.originalUrl}\n`);
      });

      if (result.rows.length > 10) {
        console.log(`   ... y ${result.rows.length - 10} más`);
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

deleteProfileNews();
