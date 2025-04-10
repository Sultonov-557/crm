import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HttpError } from 'src/common/exception/http.error';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private bot: Telegraf,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {}

  async broadcast(message: string, include: string[]) {
    const groupIDs = await this.getGroups(include);

    for (let id of groupIDs) {
      (async () => {
        try {
          await this.bot.telegram.sendMessage(id, message);
        } catch {}
      })();
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
    return groups.map((v) => v.telegramId);
  }

  async deleteGroup(telegramId: string) {
    const group = await this.groupRepo.findOneBy({ telegramId });
    if (!group) throw new HttpError({ code: 'GROUP_NOT_FOUND' });
    return await this.groupRepo.delete({ telegramId });
  }
}
