import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { In, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const users = [];
    const course = this.courseRepo.create(createCourseDto);

    if (createCourseDto.userIds?.length) {
      for (let id of createCourseDto.userIds) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }
        users.push(user);
      }
    }
    course.users = users;
    return this.courseRepo.save(course);
  }
  async addedUserToCourse(courseId: number, userId: number) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['users'],
    });
    if (!course) {
      throw new Error('Course not found');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    course.users.push(user);
    return this.courseRepo.save(course);
  }
  
  async findAll(query: findAllCourseQueryDto) {
    const { limit = 10, page = 1 } = query;
    const [result, total] = await this.courseRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!course) {
      throw new Error('Course not found');
    }

    for (const key in updateCourseDto) {
      if (Object.prototype.hasOwnProperty.call(updateCourseDto, key)) {
        course[key] = updateCourseDto[key];
      }
    }

    if (updateCourseDto.userIds?.length) {
      const users = [];
      for (const userId of updateCourseDto.userIds) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        users.push(user);
      }
      course.users = users;
    }

    return this.courseRepo.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    if (!course) {
      throw new Error('Course not found');
    }
    await this.courseRepo.remove(course);
  }

}
