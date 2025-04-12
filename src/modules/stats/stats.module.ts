import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Lead } from '../lead/entities/lead.entity';
import { Status } from '../status/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Lead, Course, Status])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
