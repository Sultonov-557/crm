import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { HttpError } from 'src/common/exception/http.error';
import { env } from 'src/common/config';
import axios from 'axios';
import { GetGroupQueryDto } from './dtos/get-group-query.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { Course } from '../course/entities/course.entity';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { Bot } from 'grammy';
import { CourseService } from '../course/course.service';

@Injectable()
export class TelegramService implements OnApplicationBootstrap {
  private telegram: Bot;
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    private readonly courseService: CourseService,
  ) {}

  onApplicationBootstrap() {
    this.telegram = new Bot(env.BOT_TOKEN);
    this.telegram.start();

    this.telegram.on('my_chat_member', async (ctx) => {
      const chatMember = ctx.myChatMember;
      const chatId = chatMember.chat.id;
      const status = chatMember.new_chat_member.status;

      if (status === 'kicked' || status === 'member' || status === 'left') {
        await this.groupRepo.delete({ telegramId: chatId.toString() });
        console.log(
          `Group with ID ${chatId} has been removed from the database.`,
        );
      } else if (status === 'administrator') {
        const group = await this.groupRepo.findOneBy({
          telegramId: chatId.toString(),
        });
        if (!group) {
          await this.createGroup({
            telegramId: chatId.toString(),
            name: chatMember.chat.title,
          }),
            console.log(
              `Group with ID ${chatId} has been added to the database.`,
            );
        }
      }
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async sendMessage(dto: SendMessageDto) {
    const course = await this.courseRepo.findOne({
      where: { id: +dto.courseId },
    });

    if (!course) {
      throw new HttpError({ code: 'COURSE_NOT_FOUND' });
    }

    const message = `Yangi kurs Ochilyapti: ${course.name}.
Tavsif: ${course.description}.
Davomiyligi: ${this.formatDate(course.end_date)},
Boshlanish sanasi: ${this.formatDate(course.start_date)}.
Joylashuv: ${course.location}.
Ko'proq ma'lumot olish va ro'yxatdan o'tish uchun ${await this.courseService.generateUrl(course.id)}`;

    return this.broadcast(message, dto.telegramIds);
  }

  async broadcast(message: string, include?: string[]) {
    const groups = await this.groupRepo.find({
      where: {
        telegramId: typeof include !== 'undefined' ? In(include) : undefined,
      },
    });

    for (const group of groups) {
      try {
        await this.telegram.api.sendMessage(group.telegramId, message);
      } catch {}
    }
  }

  async createGroup(dto: CreateGroupDto) {
    let { name, telegramId } = dto;
    if (!telegramId.startsWith('-100')) {
      telegramId = `-100${telegramId}`;
    }
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
      take: limit == 0 ? undefined : limit,
      order: { createdAt: 'DESC' },
    });

    return { total, page, limit, data: result };
  }

  async updateGroup(id: number, dto: UpdateGroupDto) {
    const group = await this.groupRepo.findOneBy({ id });
    if (!group) throw new HttpError({ code: 'GROUP_NOT_FOUND' });

    group.name = dto.name;
    group.telegramId = dto.telegramId;

    return await this.groupRepo.save(group);
  }

  async deleteGroup(id: number) {
    const group = await this.groupRepo.findOneBy({ id });
    if (!group) throw new HttpError({ code: 'GROUP_NOT_FOUND' });
    return await this.groupRepo.delete({ id });
  }
}
