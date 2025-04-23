import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './common/database/database.config';
import { UserModule } from './modules/user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './modules/admin/admin.module';
import { LeadModule } from './modules/lead/lead.module';
import { CourseModule } from './modules/course/course.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { SmsModule } from './modules/sms/sms.module';
import { StatusModule } from './modules/status/status.module';
import { StatsModule } from './modules/stats/stats.module';
import { TelegramModule as TelegramClientModule } from 'nestjs-telegram';
import { LocationModule } from './modules/location/location.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DatabaseConfig),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    UserModule,
    AdminModule,
    LeadModule,
    CourseModule,
    TelegramModule,
    SmsModule,
    StatusModule,
    StatsModule,
    LocationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
