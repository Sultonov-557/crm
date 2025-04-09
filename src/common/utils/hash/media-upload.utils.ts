import { AES } from 'crypto-js';
import { config } from 'dotenv';
config();

const MEDIA_UPLOAD_CLIENT = process.env.MEDIA_UPLOAD_CLIENT;
const MEDIA_UPLOAD_SECRET = process.env.MEDIA_UPLOAD_SECRET;
const MEDIA_UPLOAD_KEY = process.env.MEDIA_UPLOAD_KEY;

export const handleEncrypted = () =>
  AES.encrypt(
    JSON.stringify({
      client: MEDIA_UPLOAD_CLIENT,
      secret: MEDIA_UPLOAD_SECRET,
      time: Date.now(),
    }),
    MEDIA_UPLOAD_KEY,
  ).toString();
