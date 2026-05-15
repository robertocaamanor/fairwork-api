import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsSource } from '../entities/news-source.entity';
import {
  LEGACY_FIXED_SOURCE_NAMES,
  buildNewsSourceSeeds,
} from '../news-sources.seed';

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
    const seedUrls = seeds
      .map((seed) => seed.url)
      .filter((url): url is string => typeof url === 'string');

    for (const seed of seeds) {
      const existing = await this.newsSourceRepository.findOne({
        where: { url: seed.url },
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

    const legacyNames = [...LEGACY_FIXED_SOURCE_NAMES];
    const disabledTypes = ['html', 'wordpress'];

    const qb = this.newsSourceRepository
      .createQueryBuilder()
      .update(NewsSource)
      .set({ enabled: false });

    if (seedUrls.length > 0) {
      qb.where('url NOT IN (:...seedUrls)', { seedUrls });
    } else {
      qb.where('1=1');
    }

    qb.orWhere('category = :category', { category: 'farandula' });

    if (disabledTypes.length > 0) {
      qb.orWhere('type IN (:...disabledTypes)', { disabledTypes });
    }

    if (legacyNames.length > 0) {
      qb.orWhere('name IN (:...legacyNames)', { legacyNames });
    }

    await qb.execute();

    this.logger.log(`News sources seeded: ${seeds.length}`);
  }
}
