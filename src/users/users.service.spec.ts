import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Person } from './schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonStatus } from './schemas/person.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockPerson = {
    '@id': 'person-uuid-123',
    givenName: 'John',
    familyName: 'Doe',
    email: 'john.doe@example.com',
    telephone: '+1234567890',
    passwordHash: 'hashedpassword123',
    role: 'role-uuid-456',
    status: PersonStatus.ACTIVE,
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  const mockPersonModel = {
    new: jest.fn().mockResolvedValue(mockPerson),
    constructor: jest.fn().mockResolvedValue(mockPerson),
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
        UsersService,
        {
          provide: getModelToken(Person.name),
          useValue: mockPersonModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      const createPersonDto: CreatePersonDto = {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 'role-uuid-456',
      };

      const createdPerson = { ...mockPerson, _id: 'mock-object-id' };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPerson),
      };

      mockPersonModel.findOne.mockResolvedValue(null); // Email not exists
      mockPersonModel.create.mockResolvedValue(createdPerson);
      mockPersonModel.findById.mockReturnValue(mockQuery);

      const result = await service.create(createPersonDto);

      expect(mockPersonModel.findOne).toHaveBeenCalledWith({
        email: createPersonDto.email,
      });
      expect(mockPersonModel.create).toHaveBeenCalled();
      expect(mockPersonModel.findById).toHaveBeenCalledWith(createdPerson._id);
      expect(result).toEqual(mockPerson);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createPersonDto: CreatePersonDto = {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 'role-uuid-456',
      };

      mockPersonModel.findOne.mockResolvedValue(mockPerson); // Email exists

      await expect(service.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of persons', async () => {
      const persons = [mockPerson];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(persons),
      };

      mockPersonModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll(1, 10);

      expect(mockPersonModel.find).toHaveBeenCalledWith({
        isDeleted: { $ne: true },
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('role');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(persons);
    });
  });

  describe('findOne', () => {
    it('should return a person by id', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPerson),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('person-uuid-123');

      expect(mockPersonModel.findById).toHaveBeenCalledWith('person-uuid-123');
      expect(mockQuery.populate).toHaveBeenCalledWith('role');
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException if person not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      const updatePersonDto: UpdatePersonDto = {
        givenName: 'Jane',
        familyName: 'Smith',
      };

      const updatedPerson = { ...mockPerson, ...updatePersonDto };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedPerson),
      };

      mockPersonModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update('person-uuid-123', updatePersonDto);

      expect(mockPersonModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'person-uuid-123',
        updatePersonDto,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updatedPerson);
    });

    it('should throw NotFoundException if person not found', async () => {
      const updatePersonDto: UpdatePersonDto = {
        givenName: 'Jane',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockPersonModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(
        service.update('nonexistent-id', updatePersonDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const updatePersonDto: UpdatePersonDto = {
        email: 'new.email@example.com',
      };

      mockPersonModel.findOne.mockResolvedValue({
        _id: 'some-other-id',
        email: 'new.email@example.com',
      });

      await expect(
        service.update('person-uuid-123', updatePersonDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a person', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPerson),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);
      mockPerson.softDelete.mockResolvedValue(mockPerson);

      const result = await service.remove('person-uuid-123');

      expect(mockPersonModel.findById).toHaveBeenCalledWith('person-uuid-123');
      expect(mockPerson.softDelete).toHaveBeenCalled();
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException if person not found', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted person', async () => {
      const deletedPerson = { ...mockPerson, isDeleted: true };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(deletedPerson),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);
      deletedPerson.restore.mockResolvedValue({
        ...mockPerson,
        isDeleted: false,
      });

      const result = await service.restore('person-uuid-123');

      expect(mockPersonModel.findById).toHaveBeenCalledWith('person-uuid-123');
      expect(deletedPerson.restore).toHaveBeenCalled();
      expect(result.isDeleted).toBe(false);
    });

    it('should throw NotFoundException if person not found', async () => {
      mockPersonModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.restore('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not restore a person that is not deleted', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPerson),
      };

      mockPersonModel.findById.mockReturnValue(mockQuery);

      const result = await service.restore('person-uuid-123');

      expect(mockPersonModel.findById).toHaveBeenCalledWith('person-uuid-123');
      expect(mockPerson.restore).not.toHaveBeenCalled();
      expect(result).toEqual(mockPerson);
    });
  });
});
