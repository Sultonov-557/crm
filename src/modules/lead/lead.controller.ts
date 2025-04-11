import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

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

  @Get(':id')
  @DecoratorWrapper('Find One Lead')
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(+id);
  }

  @Get('course/:id')
  @DecoratorWrapper('Generate Url')
  generateUrl(@Param('id') id: string) {
    return this.leadService.generateUrl(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Lead ')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadService.update(+id, updateLeadDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Lead ')
  remove(@Param('id') id: string) {
    return this.leadService.remove(+id);
  }
}
