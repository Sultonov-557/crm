import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';

export const AuthorizationGuard = new RolesGuard(new Reflector());
