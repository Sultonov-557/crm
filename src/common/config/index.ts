import { cleanEnv, num, str } from 'envalid';
import { config } from 'dotenv';
config();

export const env = cleanEnv(process.env, {
  PORT: num(),
  ENV: str(),

  BOT_TOKEN: str(),

  ESKIZ_EMAIL: str(),
  ESKIZ_PASSWORD: str(),

  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  PASSPHRASE: str(),

  DB_HOST: str(),
  DB_PORT: num(),
  DB_USER: str(),
  DB_PASS: str(),
  DB_NAME: str(),
});
