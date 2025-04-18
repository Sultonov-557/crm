import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Role } from 'src/common/auth/roles/role.enum';
import { GetGroupQueryDto } from './dtos/get-group-query.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  @DecoratorWrapper('Create Group', true, [Role.Admin])
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.telegramService.createGroup(dto);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Group', true, [Role.Admin])
  async updateGroup(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.telegramService.updateGroup(+id, dto);
  }

  @Post('send')
  @DecoratorWrapper('Send Message', true, [Role.Admin])
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.telegramService.sendMessage(dto);
  }

  @Get()
  @DecoratorWrapper('Get Group IDs', false)
  async getGroups(@Query() query: GetGroupQueryDto) {
    return this.telegramService.getGroups(query);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Group', true, [Role.Admin])
  async deleteGroup(@Param('id', ParseIntPipe) id: string) {
    return this.telegramService.deleteGroup(+id);
  }
}
