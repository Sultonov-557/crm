import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CourseModule } from '../course/course.module';
import { CourseService } from '../course/course.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course]), CourseModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
