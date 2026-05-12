import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from '../news/news.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly newsService: NewsService) {}

  @Cron('0 */3 * * * *')
  async runNewsScraping(): Promise<void> {
    this.logger.log('Running scheduled scraping job');
    const result = await this.newsService.scrapeActiveSources();
    this.logger.log(`Scraping completed: ${JSON.stringify(result)}`);
  }
}
