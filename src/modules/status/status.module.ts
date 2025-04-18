import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { Lead } from '../lead/entities/lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status, Lead])],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
