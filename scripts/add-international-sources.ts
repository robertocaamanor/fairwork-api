import { DataSource } from 'typeorm';
import { NewsSource } from '../src/news/entities/news-source.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'news_monitor',
  entities: [NewsSource],
  synchronize: false,
});

const newSources: Partial<NewsSource>[] = [
  // ========== TV INTERNACIONAL ==========
  {
    name: 'Variety TV',
    url: 'https://variety.com/v/tv/',
    type: 'html',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'Clarín Espectáculos',
    url: 'https://www.clarin.com/rss/espectaculos/',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'La Nación Espectáculos',
    url: 'https://www.lanacion.com.ar/espectaculos/',
    type: 'html',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'El Universal Espectáculos',
    url: 'https://www.eluniversal.com.mx/espectaculos',
    type: 'html',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'Vertele',
    url: 'https://vertele.eldiario.es/feed/',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'El Periódico Televisión',
    url: 'https://www.elperiodico.com/es/rss/rss_portada.xml',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'TVBlog Italia',
    url: 'https://www.tvblog.it/feed',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'TV Pop Brasil',
    url: 'https://www.tvpop.com.br/',
    type: 'html',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'Natelinha Brasil',
    url: 'https://www.natelinha.com.br/feed',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'Infobae Espectáculos',
    url: 'https://www.infobae.com/rss/espectaculos.xml',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },
  {
    name: 'El País Televisión',
    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
    type: 'rss',
    category: 'tv_internacional',
    enabled: true,
  },

  // ========== MÚSICA ==========
  {
    name: 'Variety Music',
    url: 'https://variety.com/v/music/',
    type: 'html',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Billboard',
    url: 'https://www.billboard.com/feed/',
    type: 'rss',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Portal Famosos Brasil',
    url: 'https://www.portalfamosos.com.br/feed/',
    type: 'rss',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Los 40 Chile',
    url: 'https://los40.cl/',
    type: 'html',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Cooperativa Música',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss___musica.xml',
    type: 'rss',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'BioBio Música',
    url: 'https://www.biobiochile.cl/lista/categorias/musica',
    type: 'html',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'T13 Música',
    url: 'https://www.t13.cl/musica',
    type: 'html',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Rolling Stone en Español',
    url: 'https://www.rollingstone.com/feed/',
    type: 'rss',
    category: 'musica',
    enabled: true,
  },
  {
    name: 'Spin',
    url: 'https://www.spin.com/feed/',
    type: 'rss',
    category: 'musica',
    enabled: true,
  },

  // ========== FIEBRE DE BAILE ==========
  {
    name: 'Fotech Fiebre de Baile',
    url: 'https://www.fotech.cl/search?q=fiebre+de+baile',
    type: 'html',
    category: 'fiebre_de_baile',
    enabled: true,
  },
  {
    name: 'Ojo a la Tele Fiebre de Baile',
    url: 'https://ojoalatele.com/?s=fiebre+de+baile',
    type: 'html',
    category: 'fiebre_de_baile',
    enabled: true,
  },
  {
    name: 'BioBio Fiebre de Baile',
    url: 'https://www.biobiochile.cl/lista/buscar?q=fiebre+de+baile',
    type: 'html',
    category: 'fiebre_de_baile',
    enabled: true,
  },
  {
    name: 'La Cuarta Fiebre de Baile',
    url: 'https://www.lacuarta.com/?s=fiebre+de+baile',
    type: 'html',
    category: 'fiebre_de_baile',
    enabled: true,
  },
  {
    name: 'CHV Fiebre de Baile',
    url: 'https://www.chilevision.cl/programas/fiebre-de-baile',
    type: 'html',
    category: 'fiebre_de_baile',
    enabled: true,
  },
];

async function addSources() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const sourceRepo = dataSource.getRepository(NewsSource);
    let added = 0;
    let skipped = 0;

    for (const sourceData of newSources) {
      const existing = await sourceRepo.findOne({
        where: { url: sourceData.url },
      });

      if (existing) {
        console.log(`⏭️  Ya existe: ${sourceData.name}`);
        skipped++;
      } else {
        const source = sourceRepo.create(sourceData);
        await sourceRepo.save(source);
        console.log(`✅ Agregada: ${sourceData.name} (${sourceData.category})`);
        added++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Agregadas: ${added}`);
    console.log(`   ⏭️  Ya existían: ${skipped}`);
    console.log(`   📝 Total procesadas: ${newSources.length}\n`);

    // Mostrar resumen por categoría
    const byCategory = newSources.reduce((acc, s) => {
      acc[s.category!] = (acc[s.category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📋 Por categoría:');
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} fuentes`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

addSources();
