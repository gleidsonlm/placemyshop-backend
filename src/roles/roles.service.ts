import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Role,
  RoleDocument,
  getDefaultPermissionsForRole,
} from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    this.logger.log(`Creating new role: ${createRoleDto.roleName}`);

    // Check if role name already exists
    const existingRole = await this.roleModel.findOne({
      roleName: createRoleDto.roleName,
    });
    if (existingRole) {
      throw new ConflictException(
        `Role with name '${createRoleDto.roleName}' already exists.`,
      );
    }

    // If permissions are not provided, assign default permissions based on role name
    let roleData = { ...createRoleDto };
    if (!createRoleDto.permissions || createRoleDto.permissions.length === 0) {
      const defaultPermissions = getDefaultPermissionsForRole(
        createRoleDto.roleName,
      );
      roleData = { ...createRoleDto, permissions: defaultPermissions };
    }

    const createdRole = await this.roleModel.create(roleData);
    this.logger.log(`Successfully created role with id: ${createdRole['@id']}`);

    // Invalidate cache
    await this.cacheManager.del('allRoles');

    return createdRole;
  }

  @CacheKey('allRoles')
  @CacheTTL(60)
  async findAll(page: number = 1, limit: number = 10): Promise<RoleDocument[]> {
    this.logger.log(`Finding all roles - page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    return await this.roleModel
      .find({ isDeleted: { $ne: true } }) // Exclude soft-deleted roles
      .skip(skip)
      .limit(limit)
      .exec();
  }

  @CacheKey('role_:id')
  @CacheTTL(60)
  async findOne(id: string): Promise<RoleDocument> {
    this.logger.log(`Finding role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (role === null || role.isDeleted === true) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }

  @CacheKey('role_name_:roleName')
  @CacheTTL(60)
  async findByName(roleName: string): Promise<RoleDocument | null> {
    this.logger.log(`Finding role with name: ${roleName}`);

    return await this.roleModel
      .findOne({ roleName, isDeleted: { $ne: true } })
      .exec();
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDocument> {
    this.logger.log(`Updating role with id: ${id}`);

    // Check if role name already exists (if roleName is being updated)
    if (
      updateRoleDto.roleName !== undefined &&
      updateRoleDto.roleName !== null
    ) {
      const existingRole = await this.roleModel.findOne({
        roleName: updateRoleDto.roleName,
        _id: { $ne: id },
      });
      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true, runValidators: true })
      .exec();

    if (updatedRole === null || updatedRole.isDeleted === true) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    // Invalidate cache
    await this.cacheManager.del('allRoles');
    await this.cacheManager.del(`role_${id}`);
    if (updateRoleDto.roleName) {
      await this.cacheManager.del(`role_name_${updateRoleDto.roleName}`);
    }

    this.logger.log(`Successfully updated role with id: ${id}`);
    return updatedRole;
  }

  async remove(id: string): Promise<RoleDocument> {
    this.logger.log(`Soft deleting role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (role === null || role.isDeleted === true) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const deletedRole = await role.softDelete();
    this.logger.log(`Successfully soft deleted role with id: ${id}`);

    // Invalidate cache
    await this.cacheManager.del('allRoles');
    await this.cacheManager.del(`role_${id}`);
    await this.cacheManager.del(`role_name_${role.roleName}`);

    return deletedRole;
  }

  async restore(id: string): Promise<RoleDocument> {
    this.logger.log(`Restoring role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (role.isDeleted !== true) {
      this.logger.warn(`Role with id ${id} is not deleted, no action needed`);
      return role;
    }

    const restoredRole = await role.restore();
    this.logger.log(`Successfully restored role with id: ${id}`);

    return restoredRole;
  }
}
