import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { In, Like, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { User } from '../user/entities/user.entity';
import { HttpError } from 'src/common/exception/http.error';
import { TelegramService } from '../telegram/telegram.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private telegramService: TelegramService,
    private smsService: SmsService,
  ) {}

  async create(dto: CreateCourseDto) {
    const users = [];
    const course = this.courseRepo.create(dto);

    course.users = users;
    await this.courseRepo.save(course);

    return course;
  }
  async addUsersToCourse(courseId: number, userIds: number[]) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['users'],
    });

    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }

    const users = await this.userRepo.findBy({
      id: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw HttpError({ code: 'SOME_USERS_NOT_FOUND' });
    }

    const existingUserIds = course.users.map((u) => u.id);
    const newUsers = users.filter((u) => !existingUserIds.includes(u.id));

    course.users.push(...newUsers);
    console.log(course.users);

    return this.courseRepo.save(course);
  }

  async findAll(query: findAllCourseQueryDto) {
    const { limit = 10, page = 1 } = query;
    const [result, total] = await this.courseRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: query.name ? Like(`%${query.name.trim()}%`) : undefined,
        status: query.status,
      },
    });
    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }

    for (const key in updateCourseDto) {
      if (Object.prototype.hasOwnProperty.call(updateCourseDto, key)) {
        course[key] = updateCourseDto[key];
      }
    }

    return this.courseRepo.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    await this.courseRepo.remove(course);
  }
}
