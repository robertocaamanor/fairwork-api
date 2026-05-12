import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSourceDto } from '../news/dto/create-source.dto';
import { NewsSource } from '../news/entities/news-source.entity';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(NewsSource)
    private readonly sourceRepository: Repository<NewsSource>,
  ) {}

  async create(dto: CreateSourceDto): Promise<NewsSource> {
    const source = this.sourceRepository.create({
      ...dto,
      enabled: dto.enabled ?? true,
    });

    return this.sourceRepository.save(source);
  }

  async list(): Promise<NewsSource[]> {
    return this.sourceRepository.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: string, dto: UpdateSourceDto): Promise<NewsSource> {
    const existing = await this.sourceRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Source not found');
    }

    const merged = this.sourceRepository.merge(existing, dto);
    return this.sourceRepository.save(merged);
  }
}
