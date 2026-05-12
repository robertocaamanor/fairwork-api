import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SourcesModule } from './sources/sources.module';
import { EditorialModule } from './editorial/editorial.module';
import { UsersModule } from './users/users.module';

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
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => buildDatabaseConfig(configService),
    }),
    UsersModule,
    AuthModule,
    NewsModule,
    SourcesModule,
    SchedulerModule,
    EditorialModule,
  ],
})
export class AppModule {}
