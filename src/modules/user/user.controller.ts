import {
  Controller,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Delete,
  Patch,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/auth/roles/role.enum';
import { CoreApiResponse } from 'src/common/response/core.response';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { UserService } from './user.service';
import { Response } from 'express';
import { PdfService } from '../pdf/pdf.service';

@ApiTags('USER')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @DecoratorWrapper('Get Users')
  async getAll(@Query() dto: GetUserQueryDto) {
    return CoreApiResponse.success(await this.userService.getAll(dto));
  }

  @Get(':id')
  @DecoratorWrapper('Get User')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return CoreApiResponse.success(await this.userService.getOne(id));
  }

  @Get('pdf/all')
  @DecoratorWrapper('Get all users as PDF', false)
  async getAllAdminsPdf(@Res() res: Response) {
    try {
      const { data: users } = await this.userService.getAll({
        limit: 1000,
        page: 1,
      });

      const pdfBuffer = await this.pdfService.generatePdf({
        users: users as any,
        title: "Foydalanuvchilar ro'yxati",
      });

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=foydalanuvchilar_list.pdf',
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      return CoreApiResponse.error(error.message);
    }
  }

  @Delete(':id')
  @DecoratorWrapper('Delete User', true, [Role.Admin])
  async delete(@Param('id', ParseIntPipe) id: number) {
    return CoreApiResponse.success(await this.userService.delete(id));
  }

  @Patch(':id')
  @DecoratorWrapper('Update User', true, [Role.Admin])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return CoreApiResponse.success(await this.userService.update(id, dto));
  }
}
