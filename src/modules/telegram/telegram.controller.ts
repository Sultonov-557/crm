import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Role } from 'src/common/auth/roles/role.enum';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  @DecoratorWrapper('Create Group', true, [Role.Admin])
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.telegramService.createGroup(dto);
  }

  @Get()
  @DecoratorWrapper('Get Group IDs', false)
  async getGroups() {
    return this.telegramService.getGroups();
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Group', true, [Role.Admin])
  async deleteGroup(@Param('id') id: string) {
    return this.telegramService.deleteGroup(id);
  }
}
