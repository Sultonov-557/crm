import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Course } from '../course/entities/course.entity';
import { CourseModule } from '../course/course.module';
import { CourseService } from '../course/course.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Course]), CourseModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
