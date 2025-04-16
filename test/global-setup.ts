import './module-resolver';
import { getTestDataSource } from './database';

export default async function globalSetup() {
  await getTestDataSource();
}
