import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsItem } from './entities/news-item.entity';
import { NewsSource } from './entities/news-source.entity';
import { RssScraper } from './scrapers/rss.scraper';
import { HtmlScraper } from './scrapers/html.scraper';
import { GenericWordpressScraper } from './scrapers/generic-wordpress.scraper';
import { FotechScraper } from './scrapers/fotech.scraper';
import { BiobioScraper } from './scrapers/biobio.scraper';
import { ArticleResolverService } from './services/article-resolver.service';
import { PuppeteerResolverService } from './services/puppeteer-resolver.service';
import { NewsSourceSeederService } from './services/news-source-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsItem, NewsSource])],
  controllers: [NewsController],
  providers: [
    NewsService,
    RssScraper,
    HtmlScraper,
    GenericWordpressScraper,
    FotechScraper,
    BiobioScraper,
    ArticleResolverService,
    PuppeteerResolverService,
    NewsSourceSeederService,
  ],
  exports: [NewsService, NewsSourceSeederService],
})
export class NewsModule {}
