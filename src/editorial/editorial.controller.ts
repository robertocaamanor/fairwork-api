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
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Post('reviews')
  createReview(@Body() dto: CreateEditorialReviewDto) {
    return this.editorialService.createReview(dto);
  }

  @Post('topics')
  @UseGuards(JwtAuthGuard)
  createTopic(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateEditorialTopicDto,
  ) {
    return this.editorialService.createTopic(dto, req.user.sub);
  }

  @Get('topics')
  @UseGuards(JwtAuthGuard)
  listTopics() {
    return this.editorialService.listTopics();
  }

  @Post('topics/:id/proposals')
  @UseGuards(JwtAuthGuard)
  createTopicProposals(
    @Param('id') id: string,
    @Body() dto: CreateTopicProposalsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.editorialService.createTopicProposals(id, dto, user);
  }

  @Post('topics/:id/generate-proposals')
  @UseGuards(JwtAuthGuard)
  async generateProposals(
    @Param('id') topicId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: GenerateTopicProposalsDto,
  ) {
    const jwt = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';

    return this.editorialService.generateTopicProposals({
      topicId,
      tone: body.tone ?? 'informativo',
      requestedProposals: body.requestedProposals ?? 5,
      jwt,
      userId: req.user.sub,
    });
  }

  @Get('topics/:id/proposals')
  listTopicProposals(@Param('id') id: string) {
    return this.editorialService.listTopicProposals(id);
  }

  @Post('topics/:topicId/proposals/:proposalId/wordpress-draft')
  @RequireSendToN8n()
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
  listReviews(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listReviews(query);
  }

  @Get('reviews/pending')
  listPending(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listPendingReviews(query.limit);
  }

  @Get('reviews/approved')
  listApproved(@Query() query: EditorialReviewQueryDto) {
    return this.editorialService.listApprovedReviews(query.limit);
  }

  @Get('reviews/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.editorialService.getReviewById(id);
  }

  @Patch('reviews/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEditorialReviewStatusDto,
  ) {
    return this.editorialService.updateReviewStatus(id, dto);
  }

  @Patch('reviews/:id/published')
  markPublished(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkEditorialPublishedDto,
  ) {
    return this.editorialService.markPublished(id, dto);
  }

  @Post('reviews/:id/wordpress-draft')
  @RequireSendToN8n()
  sendReviewToWordpressDraft(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendWordpressDraftDto,
  ) {
    return this.editorialService.sendReviewToWordpressDraft(id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.editorialService.deleteReview(id);
  }
}
