import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/auth.decorators';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Mensaje base del backend' })
  @ApiOkResponse({ description: 'Mensaje base de NestJS' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Healthcheck del backend' })
  @ApiOkResponse({
    description: 'Estado del servicio',
    schema: { example: { status: 'ok' } },
  })
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
