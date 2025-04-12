import { Controller, Body, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { Role } from 'src/common/auth/roles/role.enum';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @DecoratorWrapper('get stats')
  get() {
    return this.statsService.get();
  }
}
