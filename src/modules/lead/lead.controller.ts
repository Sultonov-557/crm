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
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { Role } from 'src/common/auth/roles/role.enum';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @DecoratorWrapper('Create Lead', true, [Role.Admin])
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
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.leadService.findOne(+id);
  }

  @Get('course/:courseId')
  @DecoratorWrapper('Generate Url', true, [Role.Admin])
  generateUrl(@Param('courseId') id: string) {
    return this.leadService.generateUrl(parseInt(id));
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
