import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { HttpError } from 'src/common/exception/http.error';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { User, UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { env } from 'src/common/config';
import { Status } from '../status/entities/status.entity';
@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
    private readonly userService: UserService,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const {
      fullName,
      phoneNumber,
      job,
      position,
      employers,
      courseId,
      region,
      city,
    } = createLeadDto;

    let user = await this.userRepo.findOne({
      where: { phoneNumber },
      relations: { courses: true },
    });

    const course = await this.courseRepo.findOne({
      where: { id: courseId, isDeleted: false },
    });

    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }

    if (!user) {
      user = await this.userService.create({
        phoneNumber: phoneNumber,
        fullName: fullName,
        job: job,

        position: position,
        employers: employers,
        region: region,
        city: city,
        courseId: courseId,
      });
    } else {
      user.courses.push(course);
      user.status = UserStatus.CLIENT;
    }

    const status = await this.statusRepo.findOne({
      where: { isDefault: true },
    });
    console.log(status);

    const lead = this.leadRepo.create({
      fullName,
      phoneNumber,
    });
    lead.course = course;
    lead.user = user;
    lead.status = status;

    await this.userRepo.save(user);
    return await this.leadRepo.save(lead);
  }

  async generateUrl(id: number) {
    const lead = await this.courseRepo.findOne({ where: { id } });
    if (!lead) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    const url = `${env.FRONTEND_URL}/${lead.id}`;
    return url;
  }

  async findAll(query: findAllLeadQueryDto) {
    const { limit = 10, page = 1, statusId } = query;

    const [result, total] = await this.leadRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        status: { id: statusId === undefined ? undefined : In(statusId) },
      },
      relations: { course: true },
    });

    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: { status: true, user: true },
    });
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const { fullName, phoneNumber } = updateLeadDto;
    const lead = await this.leadRepo.findOne({ where: { id } });
    const status = await this.statusRepo.findOne({
      where: { id: updateLeadDto.statusId },
    });
    if (!status) {
      throw HttpError({ code: 'STATUS_NOT_FOUND' });
    }
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    const course = await this.courseRepo.findOne({
      where: { id: updateLeadDto.courseId },
    });
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    const updateDto = {
      fullName,
      phoneNumber,
    };
    for (const key in lead) {
      if (Object.prototype.hasOwnProperty.call(updateDto, key))
        lead[key] = updateDto[key];
    }
    lead.course = course;
    lead.status = status;
    return await this.leadRepo.save(lead);
  }

  async remove(id: number) {
    const lead = await this.findOne(id);
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    lead.isDeleted = true;
    return await this.leadRepo.save(lead);
  }
}
