import { Injectable } from '@nestjs/common';
import { SendSMSDto } from './dto/send-sms.dto';
import axios from 'axios';
import { env } from 'src/common/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SmsService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

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

    let messages = dto.numbers.map((number, i) => ({
      to: number,
      text: dto.message,
    }));

    if (!messages) {
      const users = await this.userRepo.find();
      messages = users.map((user, i) => ({
        to: user.phoneNumber,
        text: dto.message,
      }));
    }
    for (let message of messages) {
      await axios.postForm(
        'https://notify.eskiz.uz/api/message/sms/send',
        {
          from: '4546',
          mobile_phone: message.to,
          message: message.text,
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
