import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsModule } from './news/news.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SourcesModule } from './sources/sources.module';
import { EditorialModule } from './editorial/editorial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'news_monitor'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    NewsModule,
    SourcesModule,
    SchedulerModule,
    EditorialModule,
  ],
})
export class AppModule {}
