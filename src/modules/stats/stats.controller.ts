import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @DecoratorWrapper('get stats')
  get() {
    return this.statsService.get();
  }
}
