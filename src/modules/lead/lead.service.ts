import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { HttpError } from 'src/common/exception/http.error';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { User, UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { env } from 'src/common/config';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    });

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }

    if (!user) {
      user = await this.userService.create({
        phone_number: phoneNumber,
        full_name: fullName,
        job: job,
        position: position,
        employers: employers,
        region: region,
        city: city,
        course_id: courseId,
      });
    } else {
      user.status = UserStatus.CLIENT;
    }
    const lead = this.leadRepo.create(createLeadDto);
    lead.course = course;
    lead.user = user;

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
    const { limit = 10, page = 1, status } = query;

    const whereConditions = {};

    if (status) {
      whereConditions['status'] = status;
    }

    const [result, total] = await this.leadRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
    });

    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    console.log('lead', lead);

    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    const course = await this.courseRepo.findOne({
      where: { id: updateLeadDto.courseId },
    });
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    for (const key in lead) {
      if (Object.prototype.hasOwnProperty.call(updateLeadDto, key))
        lead[key] = updateLeadDto[key];
    }
    lead.course = course;
    return await this.leadRepo.save(lead);
  }

  async remove(id: number) {
    const lead = await this.findOne(id);
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    await this.leadRepo.remove(lead);
  }
}
