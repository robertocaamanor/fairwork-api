import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsSource } from '../entities/news-source.entity';
import { buildNewsSourceSeeds } from '../news-sources.seed';

@Injectable()
export class NewsSourceSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NewsSourceSeederService.name);
  private seedPromise?: Promise<void>;

  constructor(
    @InjectRepository(NewsSource)
    private readonly newsSourceRepository: Repository<NewsSource>,
  ) {}

  onApplicationBootstrap(): void {
    void this.seedSources().catch((error) => {
      this.logger.error(
        'News source seed failed during application bootstrap',
        error instanceof Error ? error.stack : undefined,
      );
    });
  }

  async seedSources(): Promise<void> {
    this.seedPromise ??= this.upsertSeeds();
    return this.seedPromise;
  }

  private async upsertSeeds(): Promise<void> {
    const seeds = buildNewsSourceSeeds();

    for (const seed of seeds) {
      const existing = await this.newsSourceRepository.findOne({
        where: { name: seed.name },
      });

      if (!existing) {
        await this.newsSourceRepository.save(
          this.newsSourceRepository.create(seed),
        );
        continue;
      }

      await this.newsSourceRepository.save(
        this.newsSourceRepository.merge(existing, seed),
      );
    }

    await this.newsSourceRepository
      .createQueryBuilder()
      .update(NewsSource)
      .set({ enabled: false })
      .where('category = :category', { category: 'farandula' })
      .execute();

    this.logger.log(`News sources seeded: ${seeds.length}`);
  }
}
