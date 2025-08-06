import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { CacheModule } from '@nestjs/cache-manager';
import {
  Role,
  RoleName,
  Permission,
  getDefaultPermissionsForRole,
} from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;

  const mockRole = {
    '@id': 'role-uuid-123',
    roleName: RoleName.MANAGER,
    permissions: [
      Permission.MANAGE_CUSTOMERS_MANAGER,
      Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER,
    ],
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  const mockRoleModel = {
    new: jest.fn().mockResolvedValue(mockRole),
    constructor: jest.fn().mockResolvedValue(mockRole),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.MANAGER,
        permissions: [Permission.MANAGE_CUSTOMERS_MANAGER],
      };

      mockRoleModel.findOne.mockResolvedValue(null); // Role name not exists
      mockRoleModel.create.mockResolvedValue(mockRole);

      const result = await service.create(createRoleDto);

      expect(mockRoleModel.findOne).toHaveBeenCalledWith({
        roleName: createRoleDto.roleName,
      });
      expect(mockRoleModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockRole);
    });

    it('should create a new role with default permissions if none are provided', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.ASSISTANT,
        permissions: [],
      };

      mockRoleModel.findOne.mockResolvedValue(null);
      mockRoleModel.create.mockImplementation((dto) => Promise.resolve(dto));

      const result = await service.create(createRoleDto);

      expect(result.permissions).toEqual(
        getDefaultPermissionsForRole(RoleName.ASSISTANT),
      );
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.MANAGER,
        permissions: [Permission.MANAGE_CUSTOMERS_MANAGER],
      };

      mockRoleModel.findOne.mockResolvedValue(mockRole); // Role name exists

      await expect(service.create(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of roles', async () => {
      const roles = [mockRole];
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(roles),
      };

      mockRoleModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll(1, 10);

      expect(mockRoleModel.find).toHaveBeenCalledWith({
        isDeleted: { $ne: true },
      });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      mockRoleModel.findById.mockResolvedValue(mockRole);

      const result = await service.findOne('role-uuid-123');

      expect(mockRoleModel.findById).toHaveBeenCalledWith('role-uuid-123');
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        permissions: [Permission.MANAGE_BUSINESS_DETAILS],
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedRole),
      };

      mockRoleModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update('role-uuid-123', updateRoleDto);

      expect(mockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'role-uuid-123',
        updateRoleDto,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updatedRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      const updateRoleDto: UpdateRoleDto = {
        permissions: [Permission.MANAGE_BUSINESS_DETAILS],
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockRoleModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(
        service.update('nonexistent-id', updateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating to a role name that already exists', async () => {
      const updateRoleDto: UpdateRoleDto = { roleName: RoleName.ADMIN };

      mockRoleModel.findOne.mockResolvedValue({
        _id: 'some-other-id',
        roleName: RoleName.ADMIN,
      });

      await expect(
        service.update('role-uuid-123', updateRoleDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a role', async () => {
      mockRoleModel.findById.mockResolvedValue(mockRole);
      mockRole.softDelete.mockResolvedValue(mockRole);

      const result = await service.remove('role-uuid-123');

      expect(mockRoleModel.findById).toHaveBeenCalledWith('role-uuid-123');
      expect(mockRole.softDelete).toHaveBeenCalled();
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
