import { Injectable } from '@nestjs/common';
import { SendSMSDto } from './dto/send-sms.dto';
import axios from 'axios';
import { env } from 'src/common/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  private accessToken: string;

  async send(dto: SendSMSDto) {
    if (!this.accessToken) {
      await this.updateToken();
    } else {
      try {
        await axios.get('https://notify.eskiz.uz/api/auth/user', {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
      } catch {
        await this.updateToken();
      }
    }

    let users: User[];
    if (dto.numbers) {
      users = await this.userRepo.find({
        where: { phoneNumber: In(dto.numbers) },
      });
    } else {
      users = await this.userRepo.find({
        where: {
          region: dto.region,
          city: dto.city,
        },
      });
    }

    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId },
    });

    const staticMessage = `Yangi kurs Ochilyapti: ${course.name}.
Tavsif: ${course.description}.
Davomiyligi: ${course.end_date},
Boshlanish sanasi: ${course.start_date}.
Joylashuv: ${course.location}.
Ko'proq ma'lumot olish va ro'yxatdan o'tish uchun ${env.FRONTEND_URL + course.id}.`;

    for (const user of users) {
      await axios.postForm(
        'https://notify.eskiz.uz/api/message/sms/send',
        {
          from: '4546',
          mobile_phone: user.phoneNumber,
          message: staticMessage,
        },
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
    }
  }

  async updateToken() {
    try {
      const res = await axios.postForm(
        'https://notify.eskiz.uz/api/auth/login',
        {
          email: env.ESKIZ_EMAIL,
          password: env.ESKIZ_PASSWORD,
        },
      );

      this.accessToken = res.data.data.token;
    } catch (e) {
      console.error('Unable to login to eskiz', e);
    }
  }
}
