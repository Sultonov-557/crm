import './module-resolver';
import { closeTestDataSource } from './database';

export default async function globalTeardown() {
  await closeTestDataSource();
}
