import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NewsService } from '../src/news/news.service';
import { DataSource } from 'typeorm';

async function countUnresolvedGoogle(dataSource: DataSource): Promise<number> {
  const rows = await dataSource.query(
    `
      SELECT COUNT(*)::int AS count
      FROM news_items
      WHERE "originalUrl" ILIKE '%news.google.com/%'
        AND ("resolvedUrl" IS NULL OR btrim("resolvedUrl") = '')
    `,
  );

  return Number(rows?.[0]?.count ?? 0);
}

async function main() {
  const rounds = Number(process.env.REPAIR_ROUNDS ?? 8);
  const limit = Number(process.env.REPAIR_LIMIT ?? 500);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const newsService = app.get(NewsService);
    const dataSource = app.get(DataSource);

    const before = await countUnresolvedGoogle(dataSource);
    // eslint-disable-next-line no-console
    console.log(`Antes: unresolved_google_items=${before}`);

    for (let i = 1; i <= rounds; i += 1) {
      const result = await newsService.repairGoogleAttributedItems(limit);
      // eslint-disable-next-line no-console
      console.log(
        `Ronda ${i}: processed=${result.processed}, updated=${result.updated}, unchanged=${result.unchanged}`,
      );

      if (result.processed === 0 || result.updated === 0) {
        break;
      }
    }

    const after = await countUnresolvedGoogle(dataSource);
    // eslint-disable-next-line no-console
    console.log(`Despues: unresolved_google_items=${after}`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Batch repair failed:', error);
  process.exit(1);
});
