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
import { TelegrafModule } from 'nestjs-telegraf';
import { env } from './common/config';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: env.BOT_TOKEN,
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
