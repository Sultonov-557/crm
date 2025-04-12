import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from '../user/entities/user.entity';
import { Repository, Between } from 'typeorm';
import { Lead } from '../lead/entities/lead.entity';
import { Course } from '../course/entities/course.entity';
import { startOfDay, startOfWeek, startOfMonth, subMonths } from 'date-fns';
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
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      newUsersLastMonth,
      leadStats,
      courseStats,
      regionalStats,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { status: UserStatus.CLIENT } }),
      this.userRepo.count({ where: { createdAt: Between(today, now) } }),
      this.userRepo.count({ where: { createdAt: Between(weekStart, now) } }),
      this.userRepo.count({ where: { createdAt: Between(monthStart, now) } }),
      this.userRepo.count({
        where: { createdAt: Between(lastMonthStart, monthStart) },
      }),
      this.getLeadStats(),
      this.getCourseStats(),
      this.getRegionalStats(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        newLastMonth: newUsersLastMonth,
      },
      leads: leadStats,
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
      statuses.map((status, index) => [status.name, leadCounts[index]]),
    );
  }

  private async getCourseStats() {
    const courses = await this.courseRepo.find();
    const stats = await Promise.all(
      courses.map(async (course) => ({
        id: course.id,
        name: course.name,
        users: await this.userRepo.count({
          where: { courses: { id: course.id } },
        }),
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
      .select('user.region')
      .addSelect('COUNT(DISTINCT user.id)', 'userCount')
      .addSelect('COUNT(DISTINCT lead.id)', 'leadCount')
      .leftJoin('lead', 'lead', 'lead.userId = user.id')
      .groupBy('user.region')
      .getRawMany();

    return regions.map((region) => ({
      region: region.region,
      users: parseInt(region.userCount),
      leads: parseInt(region.leadCount),
    }));
  }
}
