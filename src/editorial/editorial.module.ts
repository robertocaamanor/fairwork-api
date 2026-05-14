import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsItem } from '../news/entities/news-item.entity';
import { UsersModule } from '../users/users.module';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import { EditorialReview } from './entities/editorial-review.entity';
import { EditorialTopicCluster } from './entities/editorial-topic-cluster.entity';
import { EditorialTopicProposal } from './entities/editorial-topic-proposal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EditorialReview,
      EditorialTopicCluster,
      EditorialTopicProposal,
      NewsItem,
    ]),
    UsersModule,
  ],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
