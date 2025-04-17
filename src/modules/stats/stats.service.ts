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
      dailyStats,
      conversionStats,
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
      this.getDailyStats(),
      this.getConversionStats(),
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
      leads: {
        ...leadStats,
        conversion: conversionStats,
      },
      courses: courseStats,
      regional: regionalStats,
      daily: dailyStats,
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
        completionRate: await this.calculateCourseCompletionRate(course.id),
      })),
    );
    return stats;
  }

  private async calculateCourseCompletionRate(courseId: number) {
    const totalUsers = await this.userRepo.count({
      where: { courses: { id: courseId } },
    });
    if (totalUsers === 0) return 0;

    const completedUsers = await this.userRepo.count({
      where: {
        courses: { id: courseId },
        status: UserStatus.CLIENT,
      },
    });

    return (completedUsers / totalUsers) * 100;
  }

  private async getRegionalStats() {
    const regions = await this.userRepo
      .createQueryBuilder('user')
      .select('user.region')
      .addSelect('COUNT(DISTINCT user.id)', 'userCount')
      .addSelect('COUNT(DISTINCT lead.id)', 'leadCount')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN user.status = :status THEN user.id END)',
        'activeUsers',
      )
      .leftJoin('lead', 'lead', 'lead.userId = user.id')
      .setParameter('status', UserStatus.CLIENT)
      .groupBy('user.region')
      .getRawMany();

    return regions.map((region) => ({
      region: region.region,
      users: parseInt(region.userCount),
      activeUsers: parseInt(region.activeUsers),
      leads: parseInt(region.leadCount),
      conversionRate:
        region.userCount > 0
          ? (parseInt(region.activeUsers) / parseInt(region.userCount)) * 100
          : 0,
    }));
  }

  private async getDailyStats() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: startOfDay(date),
        nextDate: startOfDay(subDays(date, -1)),
      };
    }).reverse();

    const stats = await Promise.all(
      last7Days.map(async ({ date, nextDate }) => ({
        date: date.toISOString().split('T')[0],
        newUsers: await this.userRepo.count({
          where: { createdAt: Between(date, nextDate) },
        }),
        newLeads: await this.leadRepo.count({
          where: { createdAt: Between(date, nextDate) },
        }),
        activeUsers: await this.userRepo.count({
          where: {
            status: UserStatus.CLIENT,
          },
        }),
      })),
    );

    return stats;
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
