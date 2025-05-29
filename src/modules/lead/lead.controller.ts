import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { Role } from 'src/common/auth/roles/role.enum';
import { findAllLeadKahbanQueryDto } from './dto/findAll-lead-kahban.dto';
import { Response } from 'express';
import { PdfService } from '../pdf/pdf.service';
import { CoreApiResponse } from 'src/common/response/core.response';

@Controller('lead')
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @DecoratorWrapper('Create Lead')
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(createLeadDto);
  }

  @Get()
  @DecoratorWrapper('Find All Leads')
  findAll(@Query() query: findAllLeadQueryDto) {
    return this.leadService.findAll(query);
  }

  @Get('pdf/all')
  @DecoratorWrapper('Get all leads as PDF', false)
  async getAllLeadsPdf(@Res() res: Response) {
    try {
      const { data: leads } = await this.leadService.findAll({
        limit: 1000,
        page: 1,
      });
      const pdfBuffer = await this.pdfService.generatePdf({
        leads: leads as any,
        title: 'Leads List',
      });
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=leads_list.pdf',
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      return CoreApiResponse.error('Failed to generate PDF');
    }
  }
  @Get('kanban')
  @DecoratorWrapper('Get Leads for Kanban View')
  getLeadsForKanban(@Query() query: findAllLeadKahbanQueryDto) {
    return this.leadService.getLeadsForKanban(query);
  }

  @Get('kanban/load-more/:statusId')
  @DecoratorWrapper('Load More Leads for Kanban Status')
  loadMoreLeadsForStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Query() query: findAllLeadKahbanQueryDto,
  ) {
    // Override the query with the status ID from the path parameter
    return this.leadService.getLeadsForKanban({
      ...query,
      loadMoreStatusId: statusId,
    });
  }

  @Get(':id')
  @DecoratorWrapper('Find One Lead')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.leadService.findOne(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Lead', true, [Role.Admin])
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadService.update(+id, updateLeadDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Lead ', true, [Role.Admin])
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.leadService.remove(+id);
  }
}
