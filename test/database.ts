import './module-resolver';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/user/entities/user.entity';
import { Lead } from '../src/modules/lead/entities/lead.entity';
import { Course } from '../src/modules/course/entities/course.entity';
import { Status } from '../src/modules/status/entities/status.entity';
import { config } from 'dotenv';

config();
let dataSource: DataSource | null = null;

export async function getTestDataSource(): Promise<DataSource> {
  if (dataSource) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'mysql',
    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    entities: [User, Lead, Course, Status],
    synchronize: true,
  });

  await dataSource.initialize();
  return dataSource;
}

export async function closeTestDataSource(): Promise<void> {
  if (dataSource) {
    await dataSource.destroy();
    dataSource = null;
  }
}
