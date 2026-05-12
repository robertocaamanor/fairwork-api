import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import { EditorialReview } from './entities/editorial-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EditorialReview])],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
