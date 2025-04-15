import { Injectable } from '@nestjs/common';
import { Like, Not, Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { HttpError } from 'src/common/exception/http.error';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Lead } from '../lead/entities/lead.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
  ) {}

  async create(dto: CreateUserDto) {
    const { city, full_name, phone_number, region, employers, job, position } =
      dto;
    let user = await this.userRepo.findOne({
      where: { phoneNumber: dto.phone_number },
    });
    user = this.userRepo.create({
      city,
      region,
      employers,
      job,
      position,
      status: UserStatus.INTERESTED,
      fullName: dto.full_name,
      phoneNumber: dto.phone_number,
    });

    return await this.userRepo.save(user);
  }

  async delete(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    user.status = UserStatus.DELETED;
    return await this.userRepo.save(user);
  }

  async getAll(query: GetUserQueryDto) {
    const { limit = 10, page = 1, full_name, status } = query;
    const [result, total] = await this.userRepo.findAndCount({
      where: {
        fullName: Like(`%${full_name?.trim() || ''}%`),
        status: status || Not(UserStatus.DELETED),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { leads: true },
    });
    const results = result.map((user) => ({
      ...user,
      leads: user.leads.length,
    }));
    return { total, page, limit, data: results };
  }

  async getOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { leads: true },
    });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const { city, region, employers, job, position, fullName, phoneNumber } =
      dto;
    const user = await this.userRepo.findOneBy({ id });
    if (!user) return HttpError({ code: 'USER_NOT_FOUND' });
    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const phoneNumber_ = await this.userRepo.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (phoneNumber_) {
        throw HttpError({ code: 'PHONE_NUMBER_ALREADY_EXISTS' });
      }
    }
    dto = {
      city,
      region,
      employers,
      job,
      position,
      fullName,
      phoneNumber,
    };
    for (const key in user) {
      if (Object.prototype.hasOwnProperty.call(dto, key)) user[key] = dto[key];
    }

    return await this.userRepo.save(user);
  }
}
