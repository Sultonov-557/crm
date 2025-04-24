import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { In, Repository } from 'typeorm';
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
      await this.create({ name: 'YangiLid', isDefault: true });
    }
  }

  async create(createStatusDto: CreateStatusDto) {
    const { name, isDefault, color } = createStatusDto;
    const existingStatus = await this.statusRepo.findOne({
      where: { name: createStatusDto.name },
    });
    if (existingStatus) {
      throw HttpError({ code: 'Holat band' });
    }

    let status = this.statusRepo.create({
      name,
      isDefault,
      color,
    });

    if (createStatusDto.isDefault) {
      const alreadyDefault = await this.statusRepo.findOne({
        where: { isDefault: true },
      });
      if (alreadyDefault) {
        alreadyDefault.isDefault = false;
        await this.statusRepo.save(alreadyDefault);
      }
    }
    status.order = await this.statusRepo.count();
    return await this.statusRepo.save(status);
  }

  async reOrder(order: number[]) {
    if (!Array.isArray(order) || order.length === 0) {
      throw HttpError({ code: 'INVALID_ORDER_FORMAT' });
    }
    
    if (!order.every(id => typeof id === 'number')) {
      throw HttpError({ code: 'ORDER_MUST_CONTAIN_ONLY_NUMBERS' });
    }
    const statuses = await this.statusRepo.findBy({ id: In(order) });

    if (statuses.length !== order.length) {
      throw HttpError({ code: 'SOME_STATUSES_NOT_FOUND' });
    }

    const statusMap = new Map(statuses.map((status) => [status.id, status]));

    for (let i = 0; i < order.length; i++) {
      const status = statusMap.get(order[i]);
      status.order = i;
    }

    await this.statusRepo.save([...statusMap.values()]);
  }

  async findAll(query: findAllStatusQueryDto) {
    const { page = 1, limit = 10, forKanban = false } = query;

    if (forKanban) {
      const result = await this.statusRepo.find({
        order: {
          order: 'ASC',
        },
      });
      return { total: result.length, data: result };
    }

    const [result, total] = await this.statusRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        order: 'ASC',
      },
    });

    return { total, page, limit, data: result };
  }

  async findOne(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
    });
    if (!status) {
      throw HttpError({ code: 'Holat topilmadi' });
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
        throw HttpError({ code: 'Holat band' });
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
      color: dto.color,
    });
    return await this.statusRepo.save(updated);
  }
  async remove(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
    });
    if (!status) {
      throw HttpError({ code: 'Holat topilmadi' });
    }
    if (status.isDefault) {
      throw HttpError({
        code: `Standart holatni o'chirib bo'lmaydi. Siz faqat standart holatni yangilashingiz mumkin.`,
      });
    }
    const defaultStatus = await this.statusRepo.findOne({
      where: { isDefault: true },
    });
    if (!defaultStatus) {
      throw HttpError({ code: 'Standard holat topilmadi' });
    }
    const leads = await this.leadRepo.find({
      where: { status: { id } },
    });
    for (const lead of leads) {
      lead.status = defaultStatus;
      await this.leadRepo.save(lead);
    }
    const removeStatus = await this.findOne(id);
    return await this.statusRepo.remove(removeStatus);
  }
}
