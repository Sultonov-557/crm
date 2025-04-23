import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Course } from '../course/entities/course.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Status } from '../status/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lead, User, Status]), UserModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
