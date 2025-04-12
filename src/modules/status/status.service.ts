import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { findAllStatusQueryDto } from './dto/findAll-status.dto';
import { HttpError } from 'src/common/exception/http.error';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
  ) {}
  async create(createStatusDto: CreateStatusDto) {
    const status = this.statusRepo.create({
      ...createStatusDto,
    });
    return await this.statusRepo.save(status);
  }

  async findAll(query: findAllStatusQueryDto) {
    const { page, limit } = query;
    const [result, total] = await this.statusRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
    });
    if (!status) {
      throw HttpError({ code: 'Status not found' });
    }
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);
    const updated = this.statusRepo.merge(status, updateStatusDto);
    return await this.statusRepo.save(updated);
  }

  async remove(id: number) {
    if (id == 1) {
      throw HttpError({ code: 'Status is not deletable' });
    }
    const status = await this.findOne(id);
    return await this.statusRepo.remove(status);
  }
}
