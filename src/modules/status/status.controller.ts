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
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { findAllStatusQueryDto } from './dto/findAll-status.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @DecoratorWrapper('Create Status')
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get()
  @DecoratorWrapper('Get All Status')
  findAll(@Query() query: findAllStatusQueryDto) {
    return this.statusService.findAll(query);
  }

  @Get(':id')
  @DecoratorWrapper('Get Status By Id')
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Status')
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(+id, updateStatusDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Status')
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
