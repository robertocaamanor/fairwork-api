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
} from '@nestjs/common';
import { CreateEditorialReviewDto } from './dto/create-editorial-review.dto';
import { MarkEditorialPublishedDto } from './dto/mark-editorial-published.dto';
import { UpdateEditorialReviewStatusDto } from './dto/update-editorial-review-status.dto';
import { EditorialReviewQueryDto, EditorialService } from './editorial.service';

@Controller('editorial')
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Post('reviews')
  createReview(@Body() dto: CreateEditorialReviewDto) {
    return this.editorialService.createReview(dto);
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

  @Delete('reviews/:id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.editorialService.deleteReview(id);
  }
}
