import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Course } from '../course/entities/course.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lead, User]), UserModule],
  controllers: [LeadController],
  providers: [LeadService, UserService],
})
export class LeadModule {}
