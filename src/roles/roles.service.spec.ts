import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolesService } from './roles.service';
import { Role, RoleName, Permission } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let model: Model<Role>;

  const mockRole = {
    '@id': 'role-uuid-123',
    roleName: RoleName.MANAGER,
    permissions: [Permission.MANAGE_CUSTOMERS_MANAGER, Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER],
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
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    model = module.get<Model<Role>>(getModelToken(Role.name));
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

      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ roleName: createRoleDto.roleName });
      expect(mockRoleModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockRole);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: RoleName.MANAGER,
        permissions: [Permission.MANAGE_CUSTOMERS_MANAGER],
      };

      mockRoleModel.findOne.mockResolvedValue(mockRole); // Role name exists

      await expect(service.create(createRoleDto)).rejects.toThrow(ConflictException);
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

      expect(mockRoleModel.find).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
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

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
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
        { new: true, runValidators: true }
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

      await expect(service.update('nonexistent-id', updateRoleDto)).rejects.toThrow(NotFoundException);
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

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});