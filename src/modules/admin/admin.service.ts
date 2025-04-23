import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { UpdateAdminDto } from '../admin/dto/update-admin.dto';
import { HttpError } from 'src/common/exception/http.error';
import { decrypt, encrypt } from 'src/common/utils/hash/hashing.utils';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GetAdminQueryDto } from './dto/get-admin-query.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { env } from 'src/common/config';
import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { RefreshAdminDto } from './dto/refresh-admin.dto';
import { Role } from 'src/common/auth/roles/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import {
  getTokenVersion,
  incrementTokenVersion,
} from 'src/common/auth/token-version.store';
import {
  getRefreshTokenVersion,
  incrementRefreshTokenVersion,
} from 'src/common/auth/refresh-token-version.store';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(dto: CreateAdminDto) {
    const { username } = dto;
    if (
      await this.adminRepo.existsBy({
        username: dto.username,
      })
    )
      HttpError({ code: 'BUSY_USERNAME' });

    let admin = this.adminRepo.create({
      username,
      password: encrypt(dto.password),
    });
    admin = await this.adminRepo.save(admin);

    const tokenVersion = getTokenVersion(admin.id.toString());
    const refreshTokenVersion = getRefreshTokenVersion(admin.id.toString());

    const [accessToken, refreshToken] = [
      sign(
        { id: admin.id, role: Role.Admin, tokenVersion },
        env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '2h',
        },
      ),
      sign(
        { id: admin.id, role: Role.Admin, refreshTokenVersion },
        env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '1d',
        },
      ),
    ];
    admin.refreshToken = await hash(refreshToken, 10);
    await this.adminRepo.save(admin);

    return {
      ...admin,
      accessToken,
      refreshToken,
    };
  }

  async delete(id: number) {
    const admin = await this.adminRepo.findOneBy({ id });
    if (!admin) HttpError({ code: 'ADMIN_NOT_FOUND' });
    return (await this.adminRepo.delete({ id: admin.id })).raw;
  }

  async getAll(query: GetAdminQueryDto) {
    const { limit = 10, page = 1, username } = query;
    const [result, total] = await this.adminRepo.findAndCount({
      where: {
        username: Like(`%${username?.trim() || ''}%`),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { total, page, limit, data: result };
  }

  async getOne(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) HttpError({ code: 'ADMIN_NOT_FOUND' });
    return admin;
  }

  async login(dto: LoginAdminDto) {
    const admin = await this.adminRepo.findOneBy({ username: dto.username });
    if (!admin) return HttpError({ code: 'ADMIN_NOT_FOUND' });

    let passwordMatch = false;
    try {
      passwordMatch = dto.password === decrypt(admin.password);
    } catch (error) {
      HttpError({ code: 'INVALID_PASSWORD_FORMAT' });
    }

    if (!passwordMatch) HttpError({ code: 'WRONG_PASSWORD' });

    incrementTokenVersion(admin.id.toString());
    incrementRefreshTokenVersion(admin.id.toString());

    const tokenVersion = getTokenVersion(admin.id.toString());
    const refreshTokenVersion = getRefreshTokenVersion(admin.id.toString());

    const [accessToken, refreshToken] = [
      sign(
        { id: admin.id, role: Role.Admin, tokenVersion },
        env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '2h',
        },
      ),
      sign(
        { id: admin.id, role: Role.Admin, refreshTokenVersion },
        env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '1d',
        },
      ),
    ];

    await this.adminRepo.update(
      { id: admin.id },
      {
        refreshToken: await hash(refreshToken, 10),
      },
    );

    return {
      username: admin.username,
      accessToken,
      refreshToken,
    };
  }

  async logout(id: number) {
    const admin = await this.adminRepo.findOneBy({ id });
    if (!admin) HttpError({ code: 'ADMIN_NOT_FOUND' });
    incrementTokenVersion(id.toString());
    incrementRefreshTokenVersion(id.toString());
    admin.refreshToken = null;
    return await this.adminRepo.save(admin);
  }

  async refresh(dto: RefreshAdminDto) {
    const token = dto.refreshToken;
    const adminData = verify(token, env.REFRESH_TOKEN_SECRET) as {
      id: number;
      role: string;
      refreshTokenVersion: string;
    };
    if (!adminData) HttpError({ code: 'LOGIN_FAILED' });

    const admin = await this.adminRepo.findOneBy({ id: +adminData.id });
    if (!admin) HttpError({ code: 'ADMIN_NOT_FOUND' });

    const isRefTokenMatch = await compare(dto.refreshToken, admin.refreshToken);
    if (!isRefTokenMatch) HttpError({ code: 'accessToken' });

    const currentRefreshVersion = getRefreshTokenVersion(admin.id.toString());
    if (adminData.refreshTokenVersion !== currentRefreshVersion) {
      HttpError({ code: 'TOKEN_INVALIDATED' });
    }

    incrementTokenVersion(admin.id.toString());
    const currentTokenVersion = getTokenVersion(admin.id.toString());

    const accessToken = sign(
      { id: admin.id, role: Role.Admin, tokenVersion: currentTokenVersion },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '2h' },
    );
    return { accessToken };
  }

  async update(id: number, dto: UpdateAdminDto) {
    const admin = await this.adminRepo.findOneBy({ id });
    if (!admin) return HttpError({ code: 'ADMIN_NOT_FOUND' });

    if (dto.password) {
      if (!dto.oldPassword) HttpError({ code: 'OLD_PASSWORD_REQUIRED' });
      let passwordMatch = false;
      try {
        passwordMatch = dto.oldPassword === decrypt(admin.password);
      } catch (error) {
        HttpError({ code: 'INVALID_PASSWORD_FORMAT' });
      }
      if (!passwordMatch) HttpError({ code: 'WRONG_PASSWORD' });

      admin.password = encrypt(dto.password);
    }

    const updateAdmin = {
      username: dto.username,
    };

    for (const key in admin) {
      if (Object.prototype.hasOwnProperty.call(updateAdmin, key))
        admin[key] = updateAdmin[key];
    }
    if (dto.username && dto.username !== admin.username) {
      const busyUsername = await this.adminRepo.findOneBy({
        username: dto.username,
      });
      if (busyUsername) HttpError({ code: 'BUSY_USERNAME' });
    }

    return await this.adminRepo.save(admin);
  }
}
