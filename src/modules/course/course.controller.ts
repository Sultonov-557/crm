import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { AddUsersToCourseDto } from './dto/added-users-to-course.dto';
import { Role } from 'src/common/auth/roles/role.enum';
import { PdfService } from '../pdf/pdf.service';
import { CoreApiResponse } from 'src/common/response/core.response';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @DecoratorWrapper('Create Course', true, [Role.Admin])
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get('course/:courseId')
  @DecoratorWrapper('Generate Url')
  generateUrl(@Param('courseId') id: string) {
    return this.courseService.generateUrl(parseInt(id));
  }

  @Get('pdf/all')
  @DecoratorWrapper('Get all admins as PDF', false)
  async getAllAdminsPdf(@Res() res: Response) {
    try {
      // Barcha adminlarni olamiz (limitni katta qilamiz)
      const { data: courses } = await this.courseService.findAll({
        limit: 1000,
        page: 1,
      });

      // PDF generatsiya qilamiz
      const pdfBuffer = await this.pdfService.generatePdf({
        courses: courses as any,
        title: "Kurslar ro'yxati",
      });

      // Response ni sozlaymiz
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=kurslar_list.pdf',
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      return CoreApiResponse.error(error.message);
    }
  }

  @Post('/:courseId/users')
  @DecoratorWrapper('Add Multiple Users to Course', true, [Role.Admin])
  addUsersToCourse(
    @Param('courseId') courseId: string,
    @Body() dto: AddUsersToCourseDto,
  ) {
    return this.courseService.addUsersToCourse(+courseId, dto.userIds);
  }

  @Delete('/:courseId/users')
  @DecoratorWrapper('Remove Multiple Users from Course', true, [Role.Admin])
  removeUsersFromCourse(
    @Param('courseId') courseId: string,
    @Body() dto: AddUsersToCourseDto,
  ) {
    return this.courseService.removeUsersFromCourse(+courseId, dto.userIds);
  }

  @Get()
  @DecoratorWrapper('Find All Course')
  findAll(@Query() query: findAllCourseQueryDto) {
    return this.courseService.findAll(query);
  }

  @Get(':id')
  @DecoratorWrapper('Find One Course')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Course', true, [Role.Admin])
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Course', true, [Role.Admin])
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.courseService.remove(+id);
  }
}
