import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { AuthorizationGuard } from './auth.guard';
import { Role } from './roles/role.enum';
import { Roles } from './roles/roles.decorator';

export function DecoratorWrapper(
  summary: string,
  authRequired = false,
  roles?: Role[],
) {
  return authRequired
    ? applyDecorators(
        ApiOperation({
          summary: summary.split('-')[0],
          description: summary.split('-')[1],
        }),
        ApiBearerAuth('token'),
        ApiHeader({ name: 'Authorization', required: false }),
        Roles(...roles),
        UseGuards(AuthorizationGuard),
      )
    : applyDecorators(ApiOperation({ summary }));
}
