import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { HttpError } from 'src/common/exception/http.error';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async delete(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    return (await this.userRepo.delete({ id: user.id })).raw;
  }

  async getAll(query: GetUserQueryDto) {
    const { limit = 10, page = 1, full_name } = query;
    const [result, total] = await this.userRepo.findAndCount({
      where: {
        fullName: Like(`%${full_name?.trim() || ''}%`),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { total, page, limit, data: result };
  }

  async getOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) HttpError({ code: 'USER_NOT_FOUND' });
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) return HttpError({ code: 'USER_NOT_FOUND' });

    for (const key in user) {
      if (Object.prototype.hasOwnProperty.call(dto, key)) user[key] = dto[key];
    }

    return await this.userRepo.save(user);
  }
}
