import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HttpError } from 'src/common/exception/http.error';
import { env } from 'src/common/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {}

  async broadcast(message: string, include: string[]) {
    const groups = await this.getGroups(include);

    for (let group of groups) {
      try {
        await axios.post(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
          { chat_id: '-100' + group.telegramId, text: message },
          { timeout: 30000, family: 4 },
        );
      } catch {}
    }
  }

  async createGroup(dto: CreateGroupDto) {
    if (await this.groupRepo.existsBy({ telegramId: dto.telegramId })) {
      throw new HttpError({ code: 'ALREADY_EXISTS' });
    }

    return await this.groupRepo.save(this.groupRepo.create(dto));
  }

  async getGroups(include?: string[]) {
    const groups = await this.groupRepo.find({
      where: { telegramId: include === undefined ? undefined : In(include) },
    });
    return groups;
  }

  async deleteGroup(telegramId: string) {
    const group = await this.groupRepo.findOneBy({ telegramId });
    if (!group) throw new HttpError({ code: 'GROUP_NOT_FOUND' });
    return await this.groupRepo.delete({ telegramId });
  }
}
