import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { In, Like, Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { User } from '../user/entities/user.entity';
import { HttpError } from 'src/common/exception/http.error';
import { hash } from 'crypto';
import { env } from 'process';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateCourseDto) {
    const { name, status, description, start_date, end_date, location, time } =
      dto;
    const course = this.courseRepo.create({
      name,
      status,
      description,
      end_date,
      location,
      start_date,
      time,
    });
    await this.courseRepo.save(course);

    return course;
  }

  async generateUrl(id: number) {
    const lead = await this.courseRepo.findOne({ where: { id } });
    if (!lead) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }

    const hashedID = hash('sha256', id.toString());

    const newID = `${hashedID.slice(0, 3)}${id}${hashedID.slice(-3)}`;

    const url = `${env.FRONTEND_URL}/${newID}`;
    return url;
  }

  async addUsersToCourse(courseId: number, userIds: number[]) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['users'],
    });

    if (!course) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }

    const users = await this.userRepo.findBy({
      id: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw HttpError({ code: 'Biroz foydalanuvchilar topilmadi' });
    }

    const existingUserIds = course.users.map((u) => u.id);
    const newUsers = users.filter((u) => !existingUserIds.includes(u.id));

    if (!course.users) {
      course.users = [];
    }

    for (const user of newUsers) {
      course.users.push(user);
    }

    return this.courseRepo.save(course);
  }

  async removeUsersFromCourse(courseId: number, userIds: number[]) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['users'],
    });

    if (!course) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }

    course.users = course.users.filter((user) => !userIds.includes(user.id));

    return this.courseRepo.save(course);
  }

  async findAll(query: findAllCourseQueryDto) {
    const { limit = 10, page = 1 } = query;

    const [result, total] = await this.courseRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit == 0 ? undefined : limit,
      where: {
        name: query.name ? Like(`%${query.name.trim()}%`) : undefined,
        status: query.status,
        isDeleted: false,
      },
      relations: { users: true },
    });

    const results = result.map((course) => ({
      ...course,
      users: course.users ? course.users.length : 0,
    }));

    return { total, page, limit, data: results };
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id, isDeleted: false },
      relations: { users: true },
    });
    if (!course) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }
    return course;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const { description, end_date, location, name, start_date, time, status } =
      dto;
    const course = await this.courseRepo.findOne({
      where: { id },
    });

    if (!course) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }
    const updateCourse = {
      description,
      end_date,
      location,
      name,
      start_date,
      time,
      status,
    };
    for (const key in updateCourse) {
      if (Object.prototype.hasOwnProperty.call(updateCourse, key)) {
        course[key] = updateCourse[key];
      }
    }

    return this.courseRepo.save(course);
  }

  async remove(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
    });
    if (!course) {
      throw HttpError({ code: 'Kurs topilmadi' });
    }
    course.isDeleted = true;
    await this.courseRepo.save(course);
    return course;
  }
}
