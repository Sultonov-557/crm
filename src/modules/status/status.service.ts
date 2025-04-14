import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Repository } from 'typeorm';
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
    const { name, isDefault } = createStatusDto;
    const existingStatus = await this.statusRepo.findOne({
      where: { name: createStatusDto.name },
    });
    if (existingStatus) {
      throw HttpError({ code: 'Status already exists' });
    }

    const status = this.statusRepo.create({
      name,
      isDefault,
    });
    // if (!(await this.statusRepo.findOne({ where: { default: true } }))) {
    //   status.default = true;
    // }

    if (createStatusDto.isDefault) {
      const alreadyDefault = await this.statusRepo.findOne({
        where: { isDefault: true },
      });
      if (alreadyDefault) {
        throw HttpError({ code: 'Default status already exists' });
      }
    }
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
    const existingStatus = await this.statusRepo.findOne({
      where: { name: updateStatusDto.name },
    });
    if (existingStatus && existingStatus.id !== id) {
      throw HttpError({ code: 'Status already exists' });
    }

    const updated = this.statusRepo.merge(status, {
      name: updateStatusDto.name,
    });
    return await this.statusRepo.save(updated);
  }
  async remove(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
    });
    if (status.isDefault) {
      throw HttpError({
        code: 'The default status cannot be deleted. You can only update the default status.',
      });
    }
    const removeStatus = await this.findOne(id);
    return await this.statusRepo.remove(removeStatus);
  }
}
