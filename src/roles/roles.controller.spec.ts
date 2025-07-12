import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleName, Permission } from './schemas/role.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRole = {
    '@id': 'role-uuid-123',
    roleName: RoleName.MANAGER,
    permissions: [Permission.MANAGE_CUSTOMERS_MANAGER, Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER],
    dateCreated: new Date(),
    dateModified: new Date(),
  };

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.MANAGER,
        permissions: [Permission.MANAGE_CUSTOMERS_MANAGER],
      };

      mockRolesService.create.mockResolvedValue(mockRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockRole);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.MANAGER,
        permissions: [Permission.MANAGE_CUSTOMERS_MANAGER],
      };

      mockRolesService.create.mockRejectedValue(new ConflictException('Role name already exists'));

      await expect(controller.create(createRoleDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return array of roles with default pagination', async () => {
      const roles = [mockRole];
      mockRolesService.findAll.mockResolvedValue(roles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(roles);
    });

    it('should return array of roles with custom pagination', async () => {
      const roles = [mockRole];
      mockRolesService.findAll.mockResolvedValue(roles);

      const result = await controller.findAll(2, 20);

      expect(service.findAll).toHaveBeenCalledWith(2, 20);
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne('role-uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('role-uuid-123');
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRolesService.findOne.mockRejectedValue(new NotFoundException('Role not found'));

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        permissions: [Permission.MANAGE_BUSINESS_DETAILS],
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update('role-uuid-123', updateRoleDto);

      expect(service.update).toHaveBeenCalledWith('role-uuid-123', updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('remove', () => {
    it('should soft delete a role', async () => {
      const deletedRole = { ...mockRole, isDeleted: true };
      mockRolesService.remove.mockResolvedValue(deletedRole);

      const result = await controller.remove('role-uuid-123');

      expect(service.remove).toHaveBeenCalledWith('role-uuid-123');
      expect(result).toEqual(deletedRole);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted role', async () => {
      mockRolesService.restore.mockResolvedValue(mockRole);

      const result = await controller.restore('role-uuid-123');

      expect(service.restore).toHaveBeenCalledWith('role-uuid-123');
      expect(result).toEqual(mockRole);
    });
  });
});