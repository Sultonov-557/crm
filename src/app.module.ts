import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './common/database/database.config';
import { UserModule } from './modules/user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './modules/admin/admin.module';
import { KursModule } from './modules/kurs/kurs.module';
import { LeadModule } from './modules/lead/lead.module';
import { CourseModule } from './modules/course/course.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DatabaseConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    UserModule,
    AdminModule,
    KursModule,
    LeadModule,
    CourseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
