import { PartialType } from '@nestjs/swagger';
import { CreateSourceDto } from '../../news/dto/create-source.dto';

export class UpdateSourceDto extends PartialType(CreateSourceDto) {}
