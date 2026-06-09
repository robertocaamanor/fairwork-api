import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequireSendToN8n } from '../auth/auth.decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateEditorialTopicDto } from './dto/create-editorial-topic.dto';
import { CreateTopicProposalsDto } from './dto/create-topic-proposals.dto';
import { CreateEditorialReviewDto } from './dto/create-editorial-review.dto';
import { GenerateTopicProposalsDto } from './dto/generate-topic-proposals.dto';
import { MarkEditorialPublishedDto } from './dto/mark-editorial-published.dto';
import { SendWordpressDraftDto } from './dto/send-wordpress-draft.dto';
import { UpdateEditorialReviewStatusDto } from './dto/update-editorial-review-status.dto';
import { EditorialReviewQueryDto, EditorialService } from './editorial.service';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller('editorial')
@ApiTags('editorial')
@ApiBearerAuth()
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Post('reviews')
  @ApiOperation({ summary: 'Crear revision editorial' })
  createReview(@Body() dto: CreateEditorialReviewDto) {
    return this.editorialService.createReview(dto);
  }

  @Post('topics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear topic editorial' })
  createTopic(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateEditorialTopicDto,
  ) {
    return this.editorialService.createTopic(dto, req.user.sub);
  }

  @Get('topics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar topics editoriales' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Filtro por texto' })
  listTopics(@Query('q') query?: string) {
    return this.editorialService.listTopics(query);
  }

  @Post('topics/:id/proposals')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar propuestas editoriales para un topic' })
  @ApiParam({ name: 'id', description: 'Identificador del topic editorial' })
  createTopicProposals(
    @Param('id') id: string,
    @Body() dto: CreateTopicProposalsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.editorialService.createTopicProposals(id, dto, user);
  }

  @Post('topics/generate-proposals')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar propuestas desde un conjunto de noticias' })
  async generateProposalsFromNews(
    @Req() req: AuthenticatedRequest,
    @Body() body: GenerateTopicProposalsDto,
  ) {
    const jwt = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';

    return this.editorialService.generateTopicProposals({
      newsIds: body.newsIds ?? [],
      tone: body.tone ?? 'automatic',
      requestedProposals: body.requestedProposals ?? 5,
      jwt,
      userId: req.user.sub,
    });
  }

  @Post('topics/:id/generate-proposals')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar propuestas para un topic existente' })
  @ApiParam({ name: 'id', description: 'Identificador del topic editorial' })
  async generateProposals(
    @Param('id') topicId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: GenerateTopicProposalsDto,
  ) {
    const jwt = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';

    return this.editorialService.generateTopicProposals({
      topicId,
      tone: body.tone ?? 'automatic',
      requestedProposals: body.requestedProposals ?? 5,
      jwt,
      userId: req.user.sub,
    });
  }

  @Get('topics/:id/proposals')
  @ApiOperation({ summary: 'Listar propuestas de un topic' })
  @ApiParam({ name: 'id', description: 'Identificador del topic editorial' })
  listTopicProposals(@Param('id') id: string) {
    return this.editorialService.listTopicProposals(id);
  }

  @Post('topics/:topicId/proposals/:proposalId/wordpress-draft')
  @RequireSendToN8n()
  @ApiOperation({ summary: 'Enviar propuesta editorial a WordPress como borrador' })
  @ApiParam({ name: 'topicId', description: 'Identificador del topic editorial' })
  @ApiParam({ name: 'proposalId', description: 'ID numerico de la propuesta' })
  sendTopicProposalToWordpressDraft(
    @Param('topicId') topicId: string,
    @Param('proposalId', ParseIntPipe) proposalId: number,
    @Body() dto: SendWordpressDraftDto,
  ) {
    return this.editorialService.sendTopicProposalToWordpressDraft(
      topicId,
      proposalId,
      dto,
    );
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Listar revisiones editoriales' })
  listReviews(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listReviews(query);
  }

  @Get('reviews/pending')
  @ApiOperation({ summary: 'Listar revisiones pendientes' })
  listPending(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listPendingReviews(query.limit);
  }

  @Get('reviews/approved')
  @ApiOperation({ summary: 'Listar revisiones aprobadas' })
  listApproved(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listApprovedReviews(query.limit);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Obtener revision editorial por ID' })
  @ApiParam({ name: 'id', description: 'ID numerico de la revision editorial' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.editorialService.getReviewById(id);
  }

  @Patch('reviews/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de revision editorial' })
  @ApiParam({ name: 'id', description: 'ID numerico de la revision editorial' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEditorialReviewStatusDto,
  ) {
    return this.editorialService.updateReviewStatus(id, dto);
  }

  @Patch('reviews/:id/published')
  @ApiOperation({ summary: 'Marcar revision como publicada en WordPress' })
  @ApiParam({ name: 'id', description: 'ID numerico de la revision editorial' })
  markPublished(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkEditorialPublishedDto,
  ) {
    return this.editorialService.markPublished(id, dto);
  }

  @Post('reviews/:id/wordpress-draft')
  @RequireSendToN8n()
  @ApiOperation({ summary: 'Enviar revision editorial a WordPress como borrador' })
  @ApiParam({ name: 'id', description: 'ID numerico de la revision editorial' })
  sendReviewToWordpressDraft(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendWordpressDraftDto,
  ) {
    return this.editorialService.sendReviewToWordpressDraft(id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar revision editorial' })
  @ApiParam({ name: 'id', description: 'ID numerico de la revision editorial' })
  @ApiNoContentResponse({ description: 'Revision eliminada' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.editorialService.deleteReview(id);
  }
}
