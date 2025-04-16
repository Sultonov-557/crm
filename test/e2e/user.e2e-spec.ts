import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, UserStatus } from '../../src/modules/user/entities/user.entity';
import { Lead } from '../../src/modules/lead/entities/lead.entity';
import { Course } from '../../src/modules/course/entities/course.entity';
import { Status } from '../../src/modules/status/entities/status.entity';
import { getTestDataSource } from '../database';

describe('User Module (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;
  let testCourseId: number;
  let testStatusId: number;

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
        status: 'ACTIVE',
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

    if (testStatusId) {
      await request(app.getHttpServer())
        .delete(`/status/${testStatusId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    await app.close();
  });

  describe('User Creation', () => {
    it('should create a new user with valid data', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'New Test User',
          phone_number: '+1987654321',
          city: 'New City',
          region: 'New Region',
          job: 'New Job',
          position: 'New Position',
          employers: 'New Employer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.fullName).toBe('New Test User');
          expect(res.body.data.phoneNumber).toBe('+1987654321');
          expect(res.body.data.status).toBe(UserStatus.INTERESTED);
        });
    });

    it('should not create a user with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Incomplete User',
          // Missing phone_number, city, region
        })
        .expect(400);
    });

    it('should not create a user with duplicate phone number', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Duplicate Phone User',
          phone_number: '+1234567890', // Same as test user
          city: 'Duplicate City',
          region: 'Duplicate Region',
        })
        .expect(400);
    });

    it('should not create a user without authentication', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          full_name: 'Unauthorized User',
          phone_number: '+1122334455',
          city: 'Unauthorized City',
          region: 'Unauthorized Region',
        })
        .expect(401);
    });
  });

  describe('User Retrieval', () => {
    it('should get all users with pagination', () => {
      return request(app.getHttpServer())
        .get('/user?limit=10&page=1')
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

    it('should get all users with filtering by name', () => {
      return request(app.getHttpServer())
        .get('/user?full_name=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every((user) => user.fullName.includes('Test')),
          ).toBe(true);
        });
    });

    it('should get all users with filtering by status', () => {
      return request(app.getHttpServer())
        .get('/user?status=INTERESTED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.data.every(
              (user) => user.status === UserStatus.INTERESTED,
            ),
          ).toBe(true);
        });
    });

    it('should get a specific user by ID', () => {
      return request(app.getHttpServer())
        .get(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testUserId);
          expect(res.body.data.fullName).toBe('Test User');
        });
    });

    it('should return 404 for non-existent user ID', () => {
      return request(app.getHttpServer())
        .get('/user/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get users without authentication', () => {
      return request(app.getHttpServer()).get('/user').expect(401);
    });
  });

  describe('User Update', () => {
    it('should update a user with valid data', () => {
      return request(app.getHttpServer())
        .patch(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Updated Test User',
          city: 'Updated City',
          region: 'Updated Region',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testUserId);
          expect(res.body.data.fullName).toBe('Updated Test User');
          expect(res.body.data.city).toBe('Updated City');
          expect(res.body.data.region).toBe('Updated Region');
        });
    });

    it('should update a user status', () => {
      return request(app.getHttpServer())
        .patch(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: UserStatus.CLIENT,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testUserId);
          expect(res.body.data.status).toBe(UserStatus.CLIENT);
        });
    });

    it('should not update a user with duplicate phone number', async () => {
      // Create another user first
      const anotherUser = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Another User',
          phone_number: '+1555555555',
          city: 'Another City',
          region: 'Another Region',
        });

      const anotherUserId = anotherUser.body.data.id;

      // Try to update the first user with the second user's phone number
      return request(app.getHttpServer())
        .patch(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          phoneNumber: '+1555555555',
        })
        .expect(400)
        .then(async () => {
          // Clean up the other user
          await request(app.getHttpServer())
            .delete(`/user/${anotherUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });

    it('should not update a non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/user/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Non-existent User',
        })
        .expect(404);
    });

    it('should not update a user without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/user/${testUserId}`)
        .send({
          fullName: 'Unauthorized Update',
        })
        .expect(401);
    });

    it('should not update a user without admin role', () => {
      return request(app.getHttpServer())
        .patch(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'User Role Update',
        })
        .expect(403);
    });
  });

  describe('User Deletion', () => {
    it('should soft delete a user', () => {
      // Create a user to delete
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'User To Delete',
          phone_number: '+1777777777',
          city: 'Delete City',
          region: 'Delete Region',
        })
        .expect(201)
        .then((res) => {
          const userIdToDelete = res.body.data.id;

          return request(app.getHttpServer())
            .delete(`/user/${userIdToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((deleteRes) => {
              expect(deleteRes.body.data.id).toBe(userIdToDelete);
              expect(deleteRes.body.data.status).toBe(UserStatus.DELETED);
            });
        });
    });

    it('should not delete a non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/user/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not delete a user without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/user/${testUserId}`)
        .expect(401);
    });

    it('should not delete a user without admin role', () => {
      return request(app.getHttpServer())
        .delete(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('User-Lead Relationship', () => {
    it('should create a lead for a user', () => {
      return request(app.getHttpServer())
        .post('/lead')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Test Lead',
          phoneNumber: '+1999999999',
          userId: testUserId,
          courseId: testCourseId,
          statusId: testStatusId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.fullName).toBe('Test Lead');
          expect(res.body.data.user.id).toBe(testUserId);
          expect(res.body.data.course.id).toBe(testCourseId);
          expect(res.body.data.status.id).toBe(testStatusId);
        });
    });

    it('should get a user with their leads', () => {
      return request(app.getHttpServer())
        .get(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testUserId);
          expect(Array.isArray(res.body.data.leads)).toBe(true);
          expect(res.body.data.leads.length).toBeGreaterThan(0);
        });
    });
  });

  describe('User-Course Relationship', () => {
    it('should assign a course to a user', () => {
      return request(app.getHttpServer())
        .post(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBe(true);
        });
    });

    it('should get a user with their courses', () => {
      return request(app.getHttpServer())
        .get(`/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testUserId);
          expect(Array.isArray(res.body.data.courses)).toBe(true);
          expect(res.body.data.courses.length).toBeGreaterThan(0);
          expect(res.body.data.courses[0].id).toBe(testCourseId);
        });
    });

    it('should remove a course from a user', () => {
      return request(app.getHttpServer())
        .delete(`/course/${testCourseId}/user/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBe(true);
        });
    });
  });
});
