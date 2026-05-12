import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'news_monitor',
});

async function runMigration() {
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    console.log(`   Host: ${client.host}:${client.port}`);
    console.log(`   Database: ${client.database}`);
    console.log(`   User: ${client.user}`);
    
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'normalize_dates_migration.sql');
    console.log(`📄 Leyendo script: ${sqlFilePath}`);
    
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log('🔄 Ejecutando migración...\n');
    
    // Separar por punto y coma y ejecutar cada statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.startsWith('SELECT')) {
        // Para el SELECT de verificación, mostrar resultados
        const result = await client.query(statement);
        console.log('📊 Resultados de verificación:');
        console.table(result.rows);
      } else {
        await client.query(statement);
        console.log(`✅ Ejecutado: ${statement.substring(0, 60)}...`);
      }
    }

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Reinicia el backend: npm run start:dev');
    console.log('   2. Ejecuta: curl -X POST http://localhost:3000/news/fix-dates?limit=1000');
    console.log('   3. Verifica: curl http://localhost:3000/news/latest');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
