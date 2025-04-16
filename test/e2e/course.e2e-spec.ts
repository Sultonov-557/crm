import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserStatus } from '../../src/modules/user/entities/user.entity';
import { Lead } from '../../src/modules/lead/entities/lead.entity';
import {
  Course,
  CourseStatus,
} from '../../src/modules/course/entities/course.entity';
import { Status } from '../../src/modules/status/entities/status.entity';

describe('Course Module (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;
  let testCourseId: number;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [User, Lead, Course, Status],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as admin to get token
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      });

    adminToken = adminLoginResponse.body.data.accessToken;

    // Create a test user
    const createUserResponse = await request(app.getHttpServer())
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Test User',
        phone_number: '+1234567890',
        city: 'Test City',
        region: 'Test Region',
        job: 'Test Job',
        position: 'Test Position',
        employers: 'Test Employer',
      });

    testUserId = createUserResponse.body.data.id;

    // Login as the test user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        phone_number: '+1234567890',
      });

    userToken = userLoginResponse.body.data.accessToken;

    // Create a test course
    const createCourseResponse = await request(app.getHttpServer())
      .post('/course')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Course',
        description: 'Test Description',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        time: '10:00',
        status: CourseStatus.ACTIVE,
      });

    testCourseId = createCourseResponse.body.data.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await request(app.getHttpServer())
        .delete(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (testCourseId) {
      await request(app.getHttpServer())
        .delete(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    await app.close();
  });

  describe('Course Creation', () => {
    it('should create a new course with valid data', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Test Course',
          description: 'New Test Description',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          location: 'New Test Location',
          time: '14:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('New Test Course');
          expect(res.body.data.description).toBe('New Test Description');
          expect(res.body.data.location).toBe('New Test Location');
          expect(res.body.data.time).toBe('14:00');
          expect(res.body.data.status).toBe(CourseStatus.ACTIVE);
        });
    });

    it('should not create a course with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Course',
          // Missing description, start_date, end_date, location, time, status
        })
        .expect(400);
    });

    it('should not create a course with invalid date format', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Date Course',
          description: 'Invalid Date Description',
          start_date: 'invalid-date',
          end_date: 'invalid-date',
          location: 'Invalid Date Location',
          time: '10:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(400);
    });

    it('should not create a course with end date before start date', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Date Range Course',
          description: 'Invalid Date Range Description',
          start_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          end_date: new Date().toISOString(),
          location: 'Invalid Date Range Location',
          time: '10:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(400);
    });

    it('should not create a course with invalid status', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Status Course',
          description: 'Invalid Status Description',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          location: 'Invalid Status Location',
          time: '10:00',
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('should not create a course without authentication', () => {
      return request(app.getHttpServer())
        .post('/course')
        .send({
          name: 'Unauthorized Course',
          description: 'Unauthorized Description',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          location: 'Unauthorized Location',
          time: '10:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(401);
    });

    it('should not create a course without admin role', () => {
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Role Course',
          description: 'User Role Description',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          location: 'User Role Location',
          time: '10:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(403);
    });
  });

  describe('Course Retrieval', () => {
    it('should get all courses with pagination', () => {
      return request(app.getHttpServer())
        .get('/course?limit=10&page=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('limit');
          expect(res.body.data).toHaveProperty('data');
          expect(Array.isArray(res.body.data.data)).toBe(true);
        });
    });

    it('should get all courses with filtering by name', () => {
      return request(app.getHttpServer())
        .get('/course?name=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((course) => course.name.includes('Test')),
          ).toBe(true);
        });
    });

    it('should get all courses with filtering by status', () => {
      return request(app.getHttpServer())
        .get(`/course?status=${CourseStatus.ACTIVE}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every(
              (course) => course.status === CourseStatus.ACTIVE,
            ),
          ).toBe(true);
        });
    });

    it('should get all courses with filtering by date range', () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      return request(app.getHttpServer())
        .get(`/course?startDate=${today}&endDate=${nextWeek}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((course) => {
              const courseStartDate = new Date(course.start_date)
                .toISOString()
                .split('T')[0];
              return courseStartDate >= today && courseStartDate <= nextWeek;
            }),
          ).toBe(true);
        });
    });

    it('should get a specific course by ID', () => {
      return request(app.getHttpServer())
        .get(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testCourseId);
          expect(res.body.data.name).toBe('Test Course');
          expect(res.body.data.description).toBe('Test Description');
          expect(res.body.data.location).toBe('Test Location');
          expect(res.body.data.time).toBe('10:00');
          expect(res.body.data.status).toBe(CourseStatus.ACTIVE);
        });
    });

    it('should return 404 for non-existent course ID', () => {
      return request(app.getHttpServer())
        .get('/course/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get courses without authentication', () => {
      return request(app.getHttpServer()).get('/course').expect(401);
    });
  });

  describe('Course Update', () => {
    it('should update a course with valid data', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Course',
          description: 'Updated Test Description',
          location: 'Updated Test Location',
          time: '15:00',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testCourseId);
          expect(res.body.data.name).toBe('Updated Test Course');
          expect(res.body.data.description).toBe('Updated Test Description');
          expect(res.body.data.location).toBe('Updated Test Location');
          expect(res.body.data.time).toBe('15:00');
        });
    });

    it('should update a course status', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: CourseStatus.INACTIVE,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testCourseId);
          expect(res.body.data.status).toBe(CourseStatus.INACTIVE);
        });
    });

    it('should not update a course with invalid date format', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          start_date: 'invalid-date',
          end_date: 'invalid-date',
        })
        .expect(400);
    });

    it('should not update a course with end date before start date', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          start_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          end_date: new Date().toISOString(),
        })
        .expect(400);
    });

    it('should not update a course with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('should not update a non-existent course', () => {
      return request(app.getHttpServer())
        .patch('/course/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Non-existent Course',
        })
        .expect(404);
    });

    it('should not update a course without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(401);
    });

    it('should not update a course without admin role', () => {
      return request(app.getHttpServer())
        .patch(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Role Update',
        })
        .expect(403);
    });
  });

  describe('Course Deletion', () => {
    it('should delete a course', () => {
      // Create a course to delete
      return request(app.getHttpServer())
        .post('/course')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Course To Delete',
          description: 'Course To Delete Description',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          location: 'Course To Delete Location',
          time: '10:00',
          status: CourseStatus.ACTIVE,
        })
        .expect(201)
        .then((res) => {
          const courseIdToDelete = res.body.data.id;

          return request(app.getHttpServer())
            .delete(`/course/${courseIdToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((deleteRes) => {
              expect(deleteRes.body.data).toBe(true);
            });
        });
    });

    it('should not delete a non-existent course', () => {
      return request(app.getHttpServer())
        .delete('/course/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not delete a course without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}`)
        .expect(401);
    });

    it('should not delete a course without admin role', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Course-User Relationship', () => {
    it('should assign a user to a course', () => {
      return request(app.getHttpServer())
        .post(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBe(true);
        });
    });

    it('should get a course with its users', () => {
      return request(app.getHttpServer())
        .get(`/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testCourseId);
          expect(Array.isArray(res.body.data.users)).toBe(true);
          expect(res.body.data.users.length).toBeGreaterThan(0);
          expect(res.body.data.users[0].id).toBe(testUserId);
        });
    });

    it('should remove a user from a course', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBe(true);
        });
    });

    it('should not assign a non-existent user to a course', () => {
      return request(app.getHttpServer())
        .post(`/course/${testCourseId}/user/99999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not assign a user to a non-existent course', () => {
      return request(app.getHttpServer())
        .post(`/course/99999/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not remove a non-existent user from a course', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}/user/99999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not remove a user from a non-existent course', () => {
      return request(app.getHttpServer())
        .delete(`/course/99999/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not assign a user to a course without authentication', () => {
      return request(app.getHttpServer())
        .post(`/course/${testCourseId}/user/${testUserId}`)
        .expect(401);
    });

    it('should not remove a user from a course without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}/user/${testUserId}`)
        .expect(401);
    });

    it('should not assign a user to a course without admin role', () => {
      return request(app.getHttpServer())
        .post(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should not remove a user from a course without admin role', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
