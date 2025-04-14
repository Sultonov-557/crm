import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { HttpError } from 'src/common/exception/http.error';
import { env } from 'src/common/config';
import axios from 'axios';
import { GetGroupQueryDto } from './dtos/get-group-query.dto';

@Injectable()
export class TelegramService {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {}

  async broadcast(message: string, include?: string[]) {
    const groups = await this.groupRepo.find({
      where: {
        telegramId: typeof include !== 'undefined' ? In(include) : undefined,
      },
    });

    for (const group of groups) {
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
    const { name, telegramId } = dto;
    if (await this.groupRepo.existsBy({ telegramId: dto.telegramId })) {
      throw new HttpError({ code: 'ALREADY_EXISTS' });
    }

    return await this.groupRepo.save(
      this.groupRepo.create({ name, telegramId }),
    );
  }

  async getGroups(query: GetGroupQueryDto) {
    const { limit = 10, page = 1, name } = query;
    const [result, total] = await this.groupRepo.findAndCount({
      where: {
        name: Like(`%${name?.trim() || ''}%`),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { total, page, limit, data: result };
  }

  async deleteGroup(telegramId: string) {
    const group = await this.groupRepo.findOneBy({ telegramId });
    if (!group) throw new HttpError({ code: 'GROUP_NOT_FOUND' });
    return await this.groupRepo.delete({ telegramId });
  }
}
