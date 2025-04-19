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
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';
import { AddUsersToCourseDto } from './dto/added-users-to-course.dto';
import { Role } from 'src/common/auth/roles/role.enum';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @DecoratorWrapper('Create Course', true, [Role.Admin])
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Post('course/:courseId/users')
  @DecoratorWrapper('Add Multiple Users to Course', true, [Role.Admin])
  addUsersToCourse(
    @Param('courseId') courseId: string,
    @Body() dto: AddUsersToCourseDto,
  ) {
    return this.courseService.addUsersToCourse(+courseId, dto.userIds);
  }

  @Delete('course/:courseId/users')
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
