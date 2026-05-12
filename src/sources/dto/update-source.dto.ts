import { PartialType } from '@nestjs/mapped-types';
import { CreateSourceDto } from '../../news/dto/create-source.dto';

export class UpdateSourceDto extends PartialType(CreateSourceDto) {}
