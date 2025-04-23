import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { HttpError } from 'src/common/exception/http.error';
import { findAllLeadQueryDto } from './dto/findAll-lead.dto';
import { User, UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { env } from 'src/common/config';
import { Status } from '../status/entities/status.entity';
import { findAllLeadKahbanQueryDto } from './dto/findAll-lead-kahban.dto';
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
      telegramUserId,
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
        telegramUserId: telegramUserId,
        position: position,
        employers: employers,
        region: region,
        city: city,
        courseId: courseId,
      });
    } else {
      if (!user.courses) {
        user.courses = [];
      }
      user.courses.push(course);
      user.status = UserStatus.CLIENT;
      user.telegramUserId = telegramUserId;
    }

    const status = await this.statusRepo.findOne({
      where: { isDefault: true },
    });
    if (!status) {
      throw HttpError({ code: 'STATUS_NOT_FOUND' });
    }
    const lead = this.leadRepo.create({});
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
    const { limit = 10, page = 1, statusId, fullName, phoneNumber } = query;

    const [result, total] = await this.leadRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        fullName: Like(`%${fullName?.trim() || ''}%`),
        phoneNumber: Like(`%${phoneNumber?.trim() || ''}%`),
        status: {
          id:
            statusId === undefined
              ? undefined
              : Array.isArray(statusId)
                ? In(statusId)
                : statusId,
        },
        isDeleted: false,
        course: { id: query.courseId, isDeleted: false },
      },
      relations: { course: true, user: true },
    });

    return { total, page, limit, data: result };
  }

  async getLeadsForKanban(query: findAllLeadKahbanQueryDto) {
    const {
      courseId,
      phoneNumber,
      fullName,
      limit = 10,
      loadMoreStatusId,
      statusPage = 1,
      statusLimit = 10,
    } = query;

    // Get all statuses first
    const statuses = await this.statusRepo.find({
      order: { order: 'ASC' },
    });

    if (!statuses.length) {
      return { columns: [] };
    }

    // Create an array to store column data including counts
    const columns = [];

    // Process each status into a column with paginated leads
    for (const status of statuses) {
      // If loading more for a specific status and this isn't that status, use page 1
      const currentStatusPage = loadMoreStatusId === status.id ? statusPage : 1;

      // Create query builder specific to this status
      const queryBuilder = this.leadRepo
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.course', 'course')
        .leftJoinAndSelect('lead.user', 'user')
        .leftJoinAndSelect('lead.status', 'status')
        .where('lead.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('status.id = :statusId', { statusId: status.id })
        .orderBy('lead.updatedAt', 'DESC');

      if (fullName) {
        queryBuilder.andWhere('lead.fullName LIKE :fullName', {
          fullName: `%${fullName}%`,
        });
      }

      if (phoneNumber) {
        queryBuilder.andWhere('lead.phoneNumber LIKE :phoneNumber', {
          phoneNumber: `%${phoneNumber}%`,
        });
      }

      if (courseId) {
        queryBuilder.andWhere('course.id = :courseId', { courseId });
      }

      // Get total count of leads for this status (without pagination)
      const total = await queryBuilder.getCount();

      // Apply pagination and get leads for current page
      const statusLeads = await queryBuilder
        .skip((currentStatusPage - 1) * statusLimit)
        .take(statusLimit)
        .getMany();

      columns.push({
        id: status.id,
        name: status.name,
        color: status.color,
        isDefault: status.isDefault,
        leads: statusLeads,
        total,
        page: currentStatusPage,
        limit: statusLimit,
        hasMore: total > currentStatusPage * statusLimit,
      });
    }

    return {
      columns,
      loadedMore: loadMoreStatusId ? true : false,
      loadMoreStatusId,
    };
  }

  async findOne(id: number) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: { status: true, user: true, course: true },
    });
    if (!lead) {
      throw HttpError({ code: 'LEAD_NOT_FOUND' });
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const { fullName } = updateLeadDto;
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: { user: true },
    });
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
      where: { id: updateLeadDto.courseId, isDeleted: false },
    });
    if (!course) {
      throw HttpError({ code: 'COURSE_NOT_FOUND' });
    }
    const updateDto = {
      fullName,
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
