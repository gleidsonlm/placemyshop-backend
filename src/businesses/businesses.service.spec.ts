import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BusinessesService } from './businesses.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Business } from './schemas/business.schema';
import { Person } from '../users/schemas/person.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BusinessesService', () => {
  let service: BusinessesService;

  const mockBusiness = {
    '@id': 'business-uuid-123',
    name: 'Test Business',
    description: 'A test business',
    email: 'test@business.com',
    founder: 'person-uuid-456',
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  const mockBusinessModel = {
    new: jest.fn().mockResolvedValue(mockBusiness),
    constructor: jest.fn().mockResolvedValue(mockBusiness),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  const mockPersonModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BusinessesService,
        {
          provide: getModelToken(Business.name),
          useValue: mockBusinessModel,
        },
        {
          provide: getModelToken(Person.name),
          useValue: mockPersonModel,
        },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new business', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        founderId: 'person-uuid-456',
      };
      const founder = { _id: 'founder-object-id' };

      mockPersonModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(founder),
      });

      const createdBusiness = { ...mockBusiness, _id: 'mock-object-id' };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBusiness),
      };

      mockBusinessModel.create.mockResolvedValue(createdBusiness);
      mockBusinessModel.findById.mockReturnValue(mockQuery);

      const result = await service.create(createBusinessDto);

      expect(mockBusinessModel.create).toHaveBeenCalled();
      expect(mockBusinessModel.findById).toHaveBeenCalledWith(
        createdBusiness._id,
      );
      expect(result).toEqual(mockBusiness);
    });

    it('should throw BadRequestException if founder does not exist', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        founderId: 'nonexistent-founder',
      };

      mockPersonModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createBusinessDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of businesses', async () => {
      const businesses = [mockBusiness];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(businesses),
      };

      mockBusinessModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll(1, 10);

      expect(mockBusinessModel.find).toHaveBeenCalledWith({
        isDeleted: { $ne: true },
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('founder');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(businesses);
    });
  });

  describe('findOne', () => {
    it('should return a business by id', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBusiness),
      };

      mockBusinessModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('business-uuid-123');

      expect(mockBusinessModel.findById).toHaveBeenCalledWith(
        'business-uuid-123',
      );
      expect(mockQuery.populate).toHaveBeenCalledWith('founder');
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockBusinessModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByFounder', () => {
    it('should return businesses by founder id', async () => {
      const businesses = [mockBusiness];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(businesses),
      };

      mockBusinessModel.find.mockReturnValue(mockQuery);

      const result = await service.findByFounder('person-uuid-456');

      expect(mockBusinessModel.find).toHaveBeenCalledWith({
        founder: 'person-uuid-456',
        isDeleted: { $ne: true },
      });
      expect(result).toEqual(businesses);
    });
  });

  describe('update', () => {
    it('should update a business', async () => {
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
        description: 'Updated description',
      };

      const updatedBusiness = { ...mockBusiness, ...updateBusinessDto };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedBusiness),
      };

      mockBusinessModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update(
        'business-uuid-123',
        updateBusinessDto,
      );

      expect(mockBusinessModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'business-uuid-123',
        updateBusinessDto,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updatedBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockBusinessModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(
        service.update('nonexistent-id', updateBusinessDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a business', async () => {
      mockBusinessModel.findById.mockResolvedValue(mockBusiness);
      mockBusiness.softDelete.mockResolvedValue(mockBusiness);

      const result = await service.remove('business-uuid-123');

      expect(mockBusinessModel.findById).toHaveBeenCalledWith(
        'business-uuid-123',
      );
      expect(mockBusiness.softDelete).toHaveBeenCalled();
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockBusinessModel.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
