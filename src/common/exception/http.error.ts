import { HttpException, HttpStatus } from '@nestjs/common';

export function HttpError(error: IHttpError) {
  throw new HttpException(
    error?.response ||
      error?.message ||
      error?.code ||
      'Unknown Http Exception',
    error?.statusCode || HttpStatus.BAD_REQUEST,
  );
}

interface IHttpError {
  code?: any;
  response?: any;
  message?: any;
  statusCode?: any;
}
