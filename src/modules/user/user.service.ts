import { Injectable } from '@nestjs/common';
import { In, Like, Not, Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { HttpError } from 'src/common/exception/http.error';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Lead } from '../lead/entities/lead.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateUserDto) {
    const {
      city,
      fullName,
      phoneNumber,
      region,
      employers,
      job,
      position,
      telegramUserId,
      courseId,
    } = dto;
    let user = await this.userRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    user = this.userRepo.create({
      city,
      region,
      employers,
      job,
      position,
      telegramUserId,
      status: UserStatus.INTERESTED,
      fullName,
      phoneNumber,
    });
    user.courses = [course];
    return await this.userRepo.save(user);
  }

  async delete(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    user.isDeleted = true;
    return await this.userRepo.save(user);
  }

  async getAll(query: GetUserQueryDto) {
    let {
      limit = 10,
      page = 1,
      full_name,
      status,
      phone_number,
      region,
      isDeleted,
    } = query;
    isDeleted = isDeleted === 'true' ? true : false;

    const [result, total] = await this.userRepo.findAndCount({
      where: {
        fullName: Like(`%${full_name?.trim() || ''}%`),
        phoneNumber: Like(`%${phone_number?.trim() || ''}%`),
        region: Like(`%${region?.trim() || ''}%`),
        status: status ? status : undefined,
        isDeleted: isDeleted,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { leads: true, courses: true },
    });

    const results = result.map((user) => ({
      ...user,
      leads: user.leads.filter((lead) => !lead.isDeleted).length,
      courses: user.courses.filter((course) => !course.isDeleted).length,
    }));

    return { total, page, limit, data: results };
  }

  async getOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { leads: true, courses: true },
    });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const {
      city,
      region,
      employers,
      job,
      position,
      fullName,
      phoneNumber,
      status,
      courseIds,
    } = dto;

    const user = await this.userRepo.findOne({
      where: { id },
      relations: { courses: true },
    });
    if (!user) return HttpError({ code: 'USER_NOT_FOUND' });

    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const phoneNumber_ = await this.userRepo.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (phoneNumber_) {
        throw HttpError({ code: 'PHONE_NUMBER_ALREADY_EXISTS' });
      }
    }

    const updateData = {
      status,
      city,
      region,
      employers,
      job,
      position,
      fullName,
      phoneNumber,
    };

    for (const key in updateData) {
      if (
        Object.prototype.hasOwnProperty.call(updateData, key) &&
        updateData[key] !== undefined
      ) {
        user[key] = updateData[key];
      }
    }
    if (courseIds !== undefined) {
      if (!Array.isArray(courseIds)) {
        throw HttpError({ code: 'INVALID_COURSE_IDS_FORMAT' });
      }
      if (courseIds.length === 0) {
        throw HttpError({ code: 'COURSE_NOT_FOUND' });
      }

      if (courseIds.length > 0) {
        const courses = await this.courseRepo.find({
          where: { id: In(courseIds) },
        });

        if (courses.length !== courseIds.length) {
          throw HttpError({ code: 'SOME_COURSES_NOT_FOUND' });
        }

        user.courses = courses;
      }
    }

    return await this.userRepo.save(user);
  }
}
