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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAdmin, RequireSendToN8n } from '../auth/auth.decorators';
import { NewsService } from './news.service';
import {
  NewsFilterDto,
  RelatedNewsFilterDto,
  SendToN8nDto,
  UpdateNewsStatusDto,
} from './dto/news-item.dto';

@Controller('news')
@ApiTags('news')
@ApiBearerAuth()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Obtener noticias agrupadas por categoria' })
  getLatestGrouped(@Query() query: NewsFilterDto) {
    return this.newsService.getLatestGroupedByCategory(query);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar noticias' })
  getNews(@Query() query: NewsFilterDto) {
    return this.newsService.searchNews(query);
  }

  @Get('related')
  @ApiOperation({ summary: 'Buscar noticias relacionadas' })
  getRelatedNews(@Query() query: RelatedNewsFilterDto) {
    return this.newsService.findRelatedNews(query);
  }

  @Post('scrape')
  @RequireAdmin()
  @ApiOperation({ summary: 'Ejecutar scraping manual de fuentes activas' })
  scrapeActiveSources() {
    return this.newsService.scrapeActiveSources();
  }

  @Post('repair-google-attributed')
  @RequireAdmin()
  @ApiOperation({ summary: 'Reparar noticias atribuidas a Google' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximo de items a reparar' })
  repairGoogleAttributed(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.newsService.repairGoogleAttributedItems(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    );
  }

  @Post('fix-dates')
  @RequireAdmin()
  @ApiOperation({ summary: 'Corregir fechas antiguas o invalidas' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximo de items a corregir' })
  fixExistingDates(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.newsService.fixExistingDates(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    );
  }

  @Post(':id/send-to-n8n')
  @RequireSendToN8n()
  @ApiOperation({ summary: 'Enviar una noticia a n8n' })
  @ApiParam({ name: 'id', description: 'UUID de la noticia' })
  sendToN8n(@Param('id', ParseUUIDPipe) id: string, @Body() body: SendToN8nDto) {
    return this.newsService.sendToN8n(id, body);
  }

  @Patch(':id/status')
  @RequireAdmin()
  @ApiOperation({ summary: 'Actualizar estado editorial de una noticia' })
  @ApiParam({ name: 'id', description: 'UUID de la noticia' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateNewsStatusDto,
  ) {
    return this.newsService.updateStatus(id, body.status);
  }

  @Get('n8n')
  @RequireSendToN8n()
  @ApiOperation({ summary: 'Obtener cola de noticias listas para n8n' })
  getN8nQueue() {
    return this.newsService.getForN8n();
  }
}
