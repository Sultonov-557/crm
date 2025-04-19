import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { findAllStatusQueryDto } from './dto/findAll-status.dto';
import { HttpError } from 'src/common/exception/http.error';
import { Lead } from '../lead/entities/lead.entity';

@Injectable()
export class StatusService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}
  async onApplicationBootstrap() {
    if (!(await this.statusRepo.findOne({ where: { isDefault: true } }))) {
      await this.create({ name: 'NewLead', isDefault: true });
    }
  }

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
        alreadyDefault.isDefault = false;
        await this.statusRepo.save(alreadyDefault);
      }
    }
    return await this.statusRepo.save(status);
  }

  async findAll(query: findAllStatusQueryDto) {
    const { page = 1, limit = 10 } = query;
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

  async update(id: number, dto: UpdateStatusDto) {
    const status = await this.findOne(id);
    if (dto.name) {
      const existingStatus = await this.statusRepo.findOne({
        where: { name: dto.name },
      });
      if (
        existingStatus &&
        existingStatus.id !== id &&
        status.name !== dto.name
      ) {
        throw HttpError({ code: 'Status already exists' });
      }
    }
    if (dto.isDefault) {
      const alreadyDefault = await this.statusRepo.findOne({
        where: { isDefault: true },
      });
      if (alreadyDefault) {
        alreadyDefault.isDefault = false;
        status.isDefault = true;
        await this.statusRepo.save(alreadyDefault);

        await this.statusRepo.save(status);
      }
    }

    const updated = this.statusRepo.merge(status, {
      name: dto.name,
    });
    return await this.statusRepo.save(updated);
  }
  async remove(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
    });
    if (!status) {
      throw HttpError({ code: 'Status not found' });
    }
    if (status.isDefault) {
      throw HttpError({
        code: 'The default status cannot be deleted. You can only update the default status.',
      });
    }
    const defaultStatus = await this.statusRepo.findOne({
      where: { isDefault: true },
    });
    if (!defaultStatus) {
      throw HttpError({ code: 'Default status not found' });
    }
    const leads = await this.leadRepo.find({
      where: { status: { id } },
    });
    for (const lead of leads) {
      lead.status = defaultStatus
      await this.leadRepo.save(lead);
    }
    const removeStatus = await this.findOne(id);
    return await this.statusRepo.remove(removeStatus)
  }
}
