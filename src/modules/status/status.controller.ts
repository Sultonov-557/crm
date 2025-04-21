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
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { findAllStatusQueryDto } from './dto/findAll-status.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { Role } from 'src/common/auth/roles/role.enum';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @DecoratorWrapper('Create Status', true, [Role.Admin])
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Patch('reorder')
  @DecoratorWrapper('Reorder Status', true, [Role.Admin])
  reOrder(@Body() order: number[]) {
    return this.statusService.reOrder(order);
  }

  @Get()
  @DecoratorWrapper('Get All Status')
  findAll(@Query() query: findAllStatusQueryDto) { 
    return this.statusService.findAll(query);
  }

  @Get(':id')
  @DecoratorWrapper('Get Status By Id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Status', true, [Role.Admin])
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.statusService.update(+id, updateStatusDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Status', true, [Role.Admin])
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.statusService.remove(+id);
  }
}
