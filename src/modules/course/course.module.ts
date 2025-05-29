import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { SmsModule } from '../sms/sms.module';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User,PdfService])],
  controllers: [CourseController],
  providers: [CourseService,PdfService],
  exports: [CourseService],
})
export class CourseModule {}
