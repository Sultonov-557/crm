import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin,PdfService])],
  controllers: [AdminController],
  providers: [AdminService,PdfService],
})
export class AdminModule {}
