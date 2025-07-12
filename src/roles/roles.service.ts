import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    this.logger.log(`Creating new role: ${createRoleDto.roleName}`);

    // Check if role name already exists
    const existingRole = await this.roleModel.findOne({ roleName: createRoleDto.roleName });
    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const createdRole = await this.roleModel.create(createRoleDto);
    this.logger.log(`Successfully created role with id: ${createdRole['@id']}`);

    return createdRole;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<RoleDocument[]> {
    this.logger.log(`Finding all roles - page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    return await this.roleModel
      .find({ isDeleted: { $ne: true } }) // Exclude soft-deleted roles
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<RoleDocument> {
    this.logger.log(`Finding role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (!role || role.isDeleted) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }

  async findByName(roleName: string): Promise<RoleDocument | null> {
    this.logger.log(`Finding role with name: ${roleName}`);

    return await this.roleModel
      .findOne({ roleName, isDeleted: { $ne: true } })
      .exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDocument> {
    this.logger.log(`Updating role with id: ${id}`);

    // Check if role name already exists (if roleName is being updated)
    if (updateRoleDto.roleName) {
      const existingRole = await this.roleModel.findOne({ 
        roleName: updateRoleDto.roleName, 
        _id: { $ne: id }
      });
      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true, runValidators: true })
      .exec();

    if (!updatedRole || updatedRole.isDeleted) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    this.logger.log(`Successfully updated role with id: ${id}`);
    return updatedRole;
  }

  async remove(id: string): Promise<RoleDocument> {
    this.logger.log(`Soft deleting role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (!role || role.isDeleted) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const deletedRole = await role.softDelete();
    this.logger.log(`Successfully soft deleted role with id: ${id}`);

    return deletedRole;
  }

  async restore(id: string): Promise<RoleDocument> {
    this.logger.log(`Restoring role with id: ${id}`);

    const role = await this.roleModel.findById(id);

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (!role.isDeleted) {
      this.logger.warn(`Role with id ${id} is not deleted, no action needed`);
      return role;
    }

    const restoredRole = await role.restore();
    this.logger.log(`Successfully restored role with id: ${id}`);

    return restoredRole;
  }
}