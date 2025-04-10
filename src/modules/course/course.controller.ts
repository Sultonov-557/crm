import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { findAllCourseQueryDto } from './dto/findAll-course.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @DecoratorWrapper('Create Course')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Post('course/:courseId/user/:userId')
  @DecoratorWrapper('Added User To Course')
  addedUserToCourse(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.courseService.addedUserToCourse(+courseId, +userId);
  }

  @Get()
  @DecoratorWrapper('Find All Course')
  findAll(@Query() query: findAllCourseQueryDto) {
    return this.courseService.findAll(query);
  }

  @Get(':id')
  @DecoratorWrapper('Find One Course')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @DecoratorWrapper('Update Course')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @DecoratorWrapper('Delete Course')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
