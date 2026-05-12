import { DataSource } from 'typeorm';
import { NewsSource } from '../src/news/entities/news-source.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

interface SourceUpdate {
  oldName: string;
  newUrl: string;
  selectors: Record<string, string>;
}

const updates: SourceUpdate[] = [
  {
    oldName: 'CHV Fiebre de Baile',
    newUrl: 'https://www.chilevision.cl/senal-en-vivo?q=fiebre+de+baile',
    selectors: {
      linkPattern: '/fiebre|/senal-en-vivo|/noticias/',
      maxItems: '20',
    },
  },
  {
    oldName: 'Fotech Fiebre de Baile',
    newUrl: 'https://www.fotech.cl/search?q=fiebre+de+baile',
    selectors: {
      article: 'article.post',
      title: 'h2.post-title a',
      link: 'a',
      summary: '.post-excerpt',
      image: 'img',
      date: 'time',
    },
  },
  {
    oldName: 'Ojo a la Tele Fiebre de Baile',
    newUrl: 'https://ojoalatele.com/?s=fiebre+de+baile',
    selectors: {
      linkPattern: '/\\d{4}/\\d{2}/',
      maxItems: '20',
    },
  },
  {
    oldName: 'BioBio Fiebre de Baile',
    newUrl: 'https://www.biobiochile.cl/lista/buscar?q=fiebre+de+baile',
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
    oldName: 'La Cuarta Fiebre de Baile',
    newUrl: 'https://www.lacuarta.com/?s=fiebre+de+baile',
    selectors: {
      linkPattern: '/noticias/',
      maxItems: '20',
    },
  },
];

async function fixFiebreSources() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const repo = AppDataSource.getRepository(NewsSource);
    let updated = 0;
    let notFound = 0;

    for (const update of updates) {
      const source = await repo.findOne({ where: { name: update.oldName } });
      
      if (!source) {
        console.log(`⚠️  No encontrada: ${update.oldName}`);
        notFound++;
        continue;
      }

      source.url = update.newUrl;
      source.selectors = update.selectors;
      await repo.save(source);
      console.log(`✅ Actualizada: ${update.oldName} → ${update.newUrl}`);
      updated++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⚠️  No encontradas: ${notFound}`);
    console.log(`   📝 Total procesadas: ${updates.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixFiebreSources();
