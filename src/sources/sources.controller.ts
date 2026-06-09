import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSourceDto } from '../news/dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourcesService } from './sources.service';

@Controller('sources')
@ApiTags('sources')
@ApiBearerAuth()
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear fuente de noticias' })
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar fuentes de noticias' })
  list() {
    return this.sourcesService.list();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar fuente de noticias' })
  @ApiParam({ name: 'id', description: 'UUID de la fuente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSourceDto,
  ) {
    return this.sourcesService.update(id, dto);
  }
}
