import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from '../news/news.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private isScraping = false;

  constructor(private readonly newsService: NewsService) {}

  async onModuleInit(): Promise<void> {
    await this.runNewsScraping('startup');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledScraping(): Promise<void> {
    await this.runNewsScraping('cron');
  }

  private async runNewsScraping(trigger: 'startup' | 'cron'): Promise<void> {
    if (this.isScraping) {
      this.logger.warn(`Skipping ${trigger} scraping job because another run is still in progress`);
      return;
    }

    this.isScraping = true;

    try {
      this.logger.log(`Running ${trigger} scraping job`);
      const result = await this.newsService.scrapeActiveSources();
      this.logger.log(`Scraping completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Scheduled scraping failed during ${trigger}`, error instanceof Error ? error.stack : undefined);
    } finally {
      this.isScraping = false;
    }
  }
}
