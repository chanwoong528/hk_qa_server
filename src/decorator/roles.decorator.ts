import { SetMetadata } from '@nestjs/common';
import { E_Role } from 'src/enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: E_Role[]) => SetMetadata(ROLES_KEY, roles);
