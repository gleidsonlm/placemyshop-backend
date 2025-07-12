import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonStatus } from './schemas/person.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockPerson = {
    '@id': 'person-uuid-123',
    givenName: 'John',
    familyName: 'Doe',
    email: 'john.doe@example.com',
    telephone: '+1234567890',
    role: {
      '@id': 'role-uuid-456',
      roleName: 'Manager',
    },
    status: PersonStatus.ACTIVE,
    dateCreated: new Date(),
    dateModified: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a person', async () => {
      const createPersonDto: CreatePersonDto = {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 'role-uuid-456',
      };

      mockUsersService.create.mockResolvedValue(mockPerson);

      const result = await controller.create(createPersonDto);

      expect(service.create).toHaveBeenCalledWith(createPersonDto);
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

      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of persons with default pagination', async () => {
      const persons = [mockPerson];
      mockUsersService.findAll.mockResolvedValue(persons);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(persons);
    });

    it('should return array of persons with custom pagination', async () => {
      const persons = [mockPerson];
      mockUsersService.findAll.mockResolvedValue(persons);

      const result = await controller.findAll(2, 20);

      expect(service.findAll).toHaveBeenCalledWith(2, 20);
      expect(result).toEqual(persons);
    });
  });

  describe('findOne', () => {
    it('should return a person', async () => {
      mockUsersService.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne('person-uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('person-uuid-123');
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException if person not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(
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
      mockUsersService.update.mockResolvedValue(updatedPerson);

      const result = await controller.update(
        'person-uuid-123',
        updatePersonDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'person-uuid-123',
        updatePersonDto,
      );
      expect(result).toEqual(updatedPerson);
    });
  });

  describe('remove', () => {
    it('should soft delete a person', async () => {
      const deletedPerson = { ...mockPerson, isDeleted: true };
      mockUsersService.remove.mockResolvedValue(deletedPerson);

      const result = await controller.remove('person-uuid-123');

      expect(service.remove).toHaveBeenCalledWith('person-uuid-123');
      expect(result).toEqual(deletedPerson);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted person', async () => {
      mockUsersService.restore.mockResolvedValue(mockPerson);

      const result = await controller.restore('person-uuid-123');

      expect(service.restore).toHaveBeenCalledWith('person-uuid-123');
      expect(result).toEqual(mockPerson);
    });
  });
});
