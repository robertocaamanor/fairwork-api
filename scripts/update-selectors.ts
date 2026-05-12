import { DataSource } from 'typeorm';
import { NewsSource } from '../src/news/entities/news-source.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuración de TypeORM
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [NewsSource],
  synchronize: false,
});

interface SourceSelectors {
  name: string;
  selectors: Record<string, string>;
}

const selectorsConfig: SourceSelectors[] = [
  // Variety - usa linkPattern genérico para artículos
  {
    name: 'Variety TV',
    selectors: {
      linkPattern: '/\\d{4}/\\w+/',
      excludePattern: '/(tag|author|category)/',
      maxItems: '20',
    },
  },
  {
    name: 'Variety Music',
    selectors: {
      linkPattern: '/\\d{4}/\\w+/',
      excludePattern: '/(tag|author|category)/',
      maxItems: '20',
    },
  },
  // La Nación - WordPress style
  {
    name: 'La Nación Espectáculos',
    selectors: {
      linkPattern: '/\\d{4}/\\d{2}/\\d{2}/',
      maxItems: '20',
    },
  },
  // El Universal - estructura article
  {
    name: 'El Universal Espectáculos',
    selectors: {
      linkPattern: '/articulo/',
      maxItems: '20',
    },
  },
  // TV Pop Brasil
  {
    name: 'TV Pop Brasil',
    selectors: {
      linkPattern: '/noticias/',
      maxItems: '20',
    },
  },
  // Los 40 Chile
  {
    name: 'Los 40 Chile',
    selectors: {
      linkPattern: '/\\d{4}/\\d{2}/\\d{2}/',
      maxItems: '20',
    },
  },
  // BioBio - estructura conocida
  {
    name: 'BioBio Música',
    selectors: {
      article: 'article.article',
      title: 'h3 a, h2 a',
      link: 'a',
      summary: 'p',
      image: 'img',
      date: 'time',
    },
  },
  {
    name: 'BioBio Fiebre de Baile',
    selectors: {
      article: 'article.article',
      title: 'h3 a, h2 a',
      link: 'a',
      summary: 'p',
      image: 'img',
      date: 'time',
    },
  },
  // T13
  {
    name: 'T13 Música',
    selectors: {
      linkPattern: '/noticias/',
      maxItems: '20',
    },
  },
  // Fotech - estructura conocida del proyecto
  {
    name: 'Fotech Fiebre de Baile',
    selectors: {
      article: 'article.post',
      title: 'h2.post-title a',
      link: 'a',
      summary: '.post-excerpt',
      image: 'img',
      date: 'time',
    },
  },
  // Ojo a la Tele - WordPress
  {
    name: 'Ojo a la Tele Fiebre de Baile',
    selectors: {
      linkPattern: '/\\d{4}/\\d{2}/',
      maxItems: '20',
    },
  },
  // La Cuarta - estructura article
  {
    name: 'La Cuarta Fiebre de Baile',
    selectors: {
      linkPattern: '/noticias/',
      maxItems: '20',
    },
  },
  // CHV
  {
    name: 'CHV Fiebre de Baile',
    selectors: {
      linkPattern: '/programas/fiebre-de-baile/',
      maxItems: '20',
    },
  },
];

async function updateSelectors() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const repo = AppDataSource.getRepository(NewsSource);
    let updated = 0;
    let notFound = 0;

    for (const config of selectorsConfig) {
      const source = await repo.findOne({ where: { name: config.name } });
      
      if (!source) {
        console.log(`⚠️  No encontrada: ${config.name}`);
        notFound++;
        continue;
      }

      source.selectors = config.selectors;
      await repo.save(source);
      console.log(`✅ Actualizada: ${config.name}`);
      updated++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⚠️  No encontradas: ${notFound}`);
    console.log(`   📝 Total procesadas: ${selectorsConfig.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateSelectors();
