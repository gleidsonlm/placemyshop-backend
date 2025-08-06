import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../schemas/role.schema';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
