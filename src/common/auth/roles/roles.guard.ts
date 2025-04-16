import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { HttpError } from 'src/common/exception/http.error';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { env } from 'src/common/config';
import { getTokenVersion } from '../token-version.store';
import { getRefreshTokenVersion } from '../refresh-token-version.store';

export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const request = context.switchToHttp().getRequest();
      let bearerToken = request.headers['authorization'];

      if (!bearerToken) {
        HttpError({ code: 'BEARER_TOKEN_NOT_PROVIDED' });
      }

      bearerToken = bearerToken.split(' ')[1];
      const validUser: any = verify(bearerToken, env.ACCESS_TOKEN_SECRET);
      if (!validUser) HttpError({ code: 'LOGIN_FAILED' });

      const storedTokenVersion = getTokenVersion(validUser.id);
      const storedRefreshTokenVersion = getRefreshTokenVersion(validUser.id);

      if (validUser.tokenVersion !== storedTokenVersion) {
        HttpError({ code: 'TOKEN_INVALIDATED' });
      }

      request.user = {
        ...validUser,
        refreshTokenVersion: storedRefreshTokenVersion,
      };
      return requiredRoles?.includes(validUser.role);
    } catch (error) {
      if (error.message == 'jwt expired') HttpError({ code: 'JWT_EXPIRED' });
      if (error instanceof JsonWebTokenError)
        HttpError({ code: 'JWT_INVALID' });
      throw error;
    }
  }
}
