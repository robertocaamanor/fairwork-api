import 'reflect-metadata';
import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsModule } from '../src/news/news.module';
import { NewsService } from '../src/news/news.service';

function isSslEnabled(configService: ConfigService): boolean {
  return configService.get<string>('DATABASE_SSL', 'false') === 'true';
}

function getSslOptions(configService: ConfigService) {
  if (!isSslEnabled(configService)) {
    return undefined;
  }

  return {
    rejectUnauthorized: false,
  };
}

function buildDatabaseConfig(configService: ConfigService) {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const ssl = getSslOptions(configService);

  if (databaseUrl) {
    return {
      type: 'postgres' as const,
      url: databaseUrl,
      ssl,
      extra: ssl ? { ssl } : undefined,
      autoLoadEntities: true,
      synchronize: true,
    };
  }

  return {
    type: 'postgres' as const,
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    database: configService.get<string>('DATABASE_NAME', 'news_monitor'),
    ssl,
    extra: ssl ? { ssl } : undefined,
    autoLoadEntities: true,
    synchronize: true,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => buildDatabaseConfig(configService),
    }),
    NewsModule,
  ],
})
class ManualScrapeModule {}

async function main() {
  const app = await NestFactory.createApplicationContext(ManualScrapeModule, {
    logger: ['error', 'warn'],
  });

  try {
    const newsService = app.get(NewsService);
    const result = await newsService.scrapeActiveSources();
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Manual scrape failed:', error);
  process.exit(1);
});