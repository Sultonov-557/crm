import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, UserStatus } from '../../src/modules/user/entities/user.entity';
import { Lead } from '../../src/modules/lead/entities/lead.entity';
import {
  Course,
  CourseStatus,
} from '../../src/modules/course/entities/course.entity';
import { Status } from '../../src/modules/status/entities/status.entity';
import { getTestDataSource } from '../database';

describe('Lead Module (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let adminToken: string;
  let testUserId: number;
  let testCourseId: number;
  let testStatusId: number;
  let testLeadId: number;

  beforeAll(async () => {
    // Get the shared database connection
    await getTestDataSource();

    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [User, Lead, Course, Status],
            synchronize: true,
          }),
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

    // Create a test status
    const createStatusResponse = await request(app.getHttpServer())
      .post('/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Status',
        isDefault: true,
      });

    testStatusId = createStatusResponse.body.data.id;

    // Create a test lead
    const createLeadResponse = await request(app.getHttpServer())
      .post('/lead')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Test Lead',
        phoneNumber: '+1999999999',
        userId: testUserId,
        courseId: testCourseId,
        statusId: testStatusId,
      });

    testLeadId = createLeadResponse.body.data.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testLeadId) {
      await request(app.getHttpServer())
        .delete(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

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

    if (testStatusId) {
      await request(app.getHttpServer())
        .delete(`/status/${testStatusId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    await app.close();
  });

  describe('Lead Creation', () => {
    it('should create a new lead with valid data', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'New Test Lead',
          phoneNumber: '+1987654321',
          userId: testUserId,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.fullName).toBe('New Test Lead');
          expect(res.body.data.phoneNumber).toBe('+1987654321');
          expect(res.body.data.user.id).toBe(testUserId);
          expect(res.body.data.course.id).toBe(testCourseId);
          expect(res.body.data.status.id).toBe(testStatusId);
          expect(res.body.data.isDeleted).toBe(false);
        });
    });

    it('should not create a lead with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Incomplete Lead',
          // Missing phoneNumber, userId, courseId, statusId
        })
        .expect(400);
    });

    it('should not create a lead with non-existent user ID', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Non-existent User Lead',
          phoneNumber: '+1122334455',
          userId: 99999,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(400);
    });

    it('should not create a lead with non-existent course ID', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Non-existent Course Lead',
          phoneNumber: '+1122334455',
          userId: testUserId,
          courseId: 99999,
          statusId: testStatusId,
        })
        .expect(400);
    });

    it('should not create a lead with non-existent status ID', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Non-existent Status Lead',
          phoneNumber: '+1122334455',
          userId: testUserId,
          courseId: testCourseId,
          statusId: 99999,
        })
        .expect(400);
    });

    it('should not create a lead without authentication', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .send({
          fullName: 'Unauthorized Lead',
          phoneNumber: '+1122334455',
          userId: testUserId,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(401);
    });

    it('should not create a lead without admin role', async () => {
      // Create a regular user
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Regular User',
          phone_number: '+1555555555',
          city: 'Regular City',
          region: 'Regular Region',
        });

      const regularUserId = createUserResponse.body.data.id;

      // Login as the regular user
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone_number: '+1555555555',
        });

      const userToken = userLoginResponse.body.data.accessToken;

      // Try to create a lead with regular user token
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Regular User Lead',
          phoneNumber: '+1666666666',
          userId: regularUserId,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(403)
        .then(async () => {
          // Clean up the regular user
          await request(app.getHttpServer())
            .delete(`/user/${regularUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });
  });

  describe('Lead Retrieval', () => {
    it('should get all leads with pagination', () => {
      return request(app.getHttpServer())
        .get('/lead?limit=10&page=1')
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

    it('should get all leads with filtering by name', () => {
      return request(app.getHttpServer())
        .get('/lead?fullName=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((lead) => lead.fullName.includes('Test')),
          ).toBe(true);
        });
    });

    it('should get all leads with filtering by phone number', () => {
      return request(app.getHttpServer())
        .get('/lead?phoneNumber=1999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((lead) =>
              lead.phoneNumber.includes('1999'),
            ),
          ).toBe(true);
        });
    });

    it('should get all leads with filtering by user ID', () => {
      return request(app.getHttpServer())
        .get(`/lead?userId=${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((lead) => lead.user.id === testUserId),
          ).toBe(true);
        });
    });

    it('should get all leads with filtering by course ID', () => {
      return request(app.getHttpServer())
        .get(`/lead?courseId=${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((lead) => lead.course.id === testCourseId),
          ).toBe(true);
        });
    });

    it('should get all leads with filtering by status ID', () => {
      return request(app.getHttpServer())
        .get(`/lead?statusId=${testStatusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((lead) => lead.status.id === testStatusId),
          ).toBe(true);
        });
    });

    it('should get a specific lead by ID', () => {
      return request(app.getHttpServer())
        .get(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testLeadId);
          expect(res.body.data.fullName).toBe('Test Lead');
          expect(res.body.data.user.id).toBe(testUserId);
          expect(res.body.data.course.id).toBe(testCourseId);
          expect(res.body.data.status.id).toBe(testStatusId);
        });
    });

    it('should return 404 for non-existent lead ID', () => {
      return request(app.getHttpServer())
        .get('/lead/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get leads without authentication', () => {
      return request(app.getHttpServer()).get('/lead').expect(401);
    });
  });

  describe('Lead Update', () => {
    it('should update a lead with valid data', () => {
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Updated Test Lead',
          phoneNumber: '+1888888888',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testLeadId);
          expect(res.body.data.fullName).toBe('Updated Test Lead');
          expect(res.body.data.phoneNumber).toBe('+1888888888');
        });
    });

    it('should update a lead status', () => {
      // Create a new status
      return request(app.getHttpServer())
        .post('/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Status',
          isDefault: false,
        })
        .expect(201)
        .then((res) => {
          const newStatusId = res.body.data.id;

          return request(app.getHttpServer())
            .patch(`/lead/${testLeadId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              statusId: newStatusId,
            })
            .expect(200)
            .expect((updateRes) => {
              expect(updateRes.body.data.id).toBe(testLeadId);
              expect(updateRes.body.data.status.id).toBe(newStatusId);
            })
            .then(async () => {
              // Clean up the new status
              await request(app.getHttpServer())
                .delete(`/status/${newStatusId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            });
        });
    });

    it('should not update a lead with non-existent user ID', () => {
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 99999,
        })
        .expect(400);
    });

    it('should not update a lead with non-existent course ID', () => {
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: 99999,
        })
        .expect(400);
    });

    it('should not update a lead with non-existent status ID', () => {
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          statusId: 99999,
        })
        .expect(400);
    });

    it('should not update a non-existent lead', () => {
      return request(app.getHttpServer())
        .patch('/lead/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Non-existent Lead',
        })
        .expect(404);
    });

    it('should not update a lead without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .send({
          fullName: 'Unauthorized Update',
        })
        .expect(401);
    });

    it('should not update a lead without admin role', async () => {
      // Create a regular user
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Regular User',
          phone_number: '+1555555555',
          city: 'Regular City',
          region: 'Regular Region',
        });

      const regularUserId = createUserResponse.body.data.id;

      // Login as the regular user
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone_number: '+1555555555',
        });

      const userToken = userLoginResponse.body.data.accessToken;

      // Try to update a lead with regular user token
      return request(app.getHttpServer())
        .patch(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Regular User Update',
        })
        .expect(403)
        .then(async () => {
          // Clean up the regular user
          await request(app.getHttpServer())
            .delete(`/user/${regularUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });
  });

  describe('Lead Deletion', () => {
    it('should soft delete a lead', () => {
      // Create a lead to delete
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Lead To Delete',
          phoneNumber: '+1777777777',
          userId: testUserId,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(201)
        .then((res) => {
          const leadIdToDelete = res.body.data.id;

          return request(app.getHttpServer())
            .delete(`/lead/${leadIdToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((deleteRes) => {
              expect(deleteRes.body.data.id).toBe(leadIdToDelete);
              expect(deleteRes.body.data.isDeleted).toBe(true);
            });
        });
    });

    it('should not delete a non-existent lead', () => {
      return request(app.getHttpServer())
        .delete('/lead/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not delete a lead without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/lead/${testLeadId}`)
        .expect(401);
    });

    it('should not delete a lead without admin role', async () => {
      // Create a regular user
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Regular User',
          phone_number: '+1555555555',
          city: 'Regular City',
          region: 'Regular Region',
        });

      const regularUserId = createUserResponse.body.data.id;

      // Login as the regular user
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone_number: '+1555555555',
        });

      const userToken = userLoginResponse.body.data.accessToken;

      // Try to delete a lead with regular user token
      return request(app.getHttpServer())
        .delete(`/lead/${testLeadId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .then(async () => {
          // Clean up the regular user
          await request(app.getHttpServer())
            .delete(`/user/${regularUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });
  });

  describe('Lead URL Generation', () => {
    it('should generate a URL for a course', () => {
      return request(app.getHttpServer())
        .get(`/lead/course/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('url');
          expect(typeof res.body.data.url).toBe('string');
          expect(res.body.data.url).toContain(testCourseId.toString());
        });
    });

    it('should not generate a URL for a non-existent course', () => {
      return request(app.getHttpServer())
        .get('/lead/course/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not generate a URL without authentication', () => {
      return request(app.getHttpServer())
        .get(`/lead/course/${testCourseId}`)
        .expect(401);
    });

    it('should not generate a URL without admin role', async () => {
      // Create a regular user
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Regular User',
          phone_number: '+1555555555',
          city: 'Regular City',
          region: 'Regular Region',
        });

      const regularUserId = createUserResponse.body.data.id;

      // Login as the regular user
      const userLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone_number: '+1555555555',
        });

      const userToken = userLoginResponse.body.data.accessToken;

      // Try to generate a URL with regular user token
      return request(app.getHttpServer())
        .get(`/lead/course/${testCourseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .then(async () => {
          // Clean up the regular user
          await request(app.getHttpServer())
            .delete(`/user/${regularUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });
  });
});
