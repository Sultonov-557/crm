import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Lead } from '../lead/entities/lead.entity';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Lead])],
  controllers: [UserController],
  providers: [UserService,PdfService],
  exports: [UserService],
})
export class UserModule {}
