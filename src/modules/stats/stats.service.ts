import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from '../user/entities/user.entity';
import { Repository, Between } from 'typeorm';
import { Lead } from '../lead/entities/lead.entity';
import { Course } from '../course/entities/course.entity';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subMonths,
  subDays,
} from 'date-fns';
import { Status } from '../status/entities/status.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Status) private statusRepo: Repository<Status>,
  ) {}

  async get() {
    const [leadStats, courseStats, regionalStats, conversionStats] =
      await Promise.all([
        this.getLeadStats(),
        this.getCourseStats(),
        this.getRegionalStats(),
        this.getConversionStats(),
      ]);

    return {
      leads: {
        ...leadStats,
        conversion: conversionStats,
      },
      courses: courseStats,
      regional: regionalStats,
    };
  }

  private async getLeadStats() {
    const statuses = await this.statusRepo.find();
    const leadCounts = await Promise.all(
      statuses.map((status) =>
        this.leadRepo.count({ where: { status: { id: status.id } } }),
      ),
    );
    return Object.fromEntries(
      statuses.map((status, index) => [
        status.name.toLowerCase(),
        leadCounts[index],
      ]),
    );
  }

  private async getCourseStats() {
    const courses = await this.courseRepo.find();
    const stats = await Promise.all(
      courses.map(async (course) => ({
        name: course.name,
        leads: await this.leadRepo.count({
          where: { course: { id: course.id } },
        }),
      })),
    );
    return stats;
  }

  private async getRegionalStats() {
    const regions = await this.userRepo
      .createQueryBuilder('user')
      .select('user.region', 'region')
      .addSelect('COUNT(DISTINCT lead.id)', 'leads')
      .leftJoin('lead', 'lead', 'lead.userId = user.id')
      .groupBy('user.region')
      .getRawMany();

    return regions.map((region) => ({
      region: region.region,
      leads: parseInt(region.leads),
    }));
  }

  private async getConversionStats() {
    const totalLeads = await this.leadRepo.count();
    const convertedLeads = await this.leadRepo.count({
      where: { user: { status: UserStatus.CLIENT } },
    });

    return {
      total: totalLeads,
      converted: convertedLeads,
      rate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
    };
  }
}
