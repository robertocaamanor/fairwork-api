import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequireAdmin, RequireSendToN8n } from '../auth/auth.decorators';
import { NewsService } from './news.service';
import {
  NewsFilterDto,
  RelatedNewsFilterDto,
  UpdateNewsStatusDto,
} from './dto/news-item.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('latest')
  getLatestGrouped(@Query() query: NewsFilterDto) {
    return this.newsService.getLatestGroupedByCategory(query);
  }

  @Get()
  getNews(@Query() query: NewsFilterDto) {
    return this.newsService.searchNews(query);
  }

  @Get('related')
  getRelatedNews(@Query() query: RelatedNewsFilterDto) {
    return this.newsService.findRelatedNews(query);
  }

  @Post('scrape')
  @RequireAdmin()
  scrapeActiveSources() {
    return this.newsService.scrapeActiveSources();
  }

  @Post('repair-google-attributed')
  @RequireAdmin()
  repairGoogleAttributed(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.newsService.repairGoogleAttributedItems(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    );
  }

  @Post('fix-dates')
  @RequireAdmin()
  fixExistingDates(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.newsService.fixExistingDates(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    );
  }

  @Post(':id/send-to-n8n')
  @RequireSendToN8n()
  sendToN8n(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.sendToN8n(id);
  }

  @Patch(':id/status')
  @RequireAdmin()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateNewsStatusDto,
  ) {
    return this.newsService.updateStatus(id, body.status);
  }

  @Get('n8n')
  @RequireSendToN8n()
  getN8nQueue() {
    return this.newsService.getForN8n();
  }
}
