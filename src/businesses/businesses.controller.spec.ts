import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { NotFoundException } from '@nestjs/common';

describe('BusinessesController', () => {
  let controller: BusinessesController;

  const mockBusiness = {
    '@id': 'business-uuid-123',
    name: 'Test Business',
    description: 'A test business',
    email: 'test@business.com',
    founder: {
      '@id': 'person-uuid-456',
      givenName: 'John',
      familyName: 'Doe',
    },
    dateCreated: new Date(),
    dateModified: new Date(),
  };

  const mockBusinessesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByFounder: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [BusinessesController],
      providers: [
        {
          provide: BusinessesService,
          useValue: mockBusinessesService,
        },
      ],
    }).compile();

    controller = module.get<BusinessesController>(BusinessesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a business', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        founderId: 'person-uuid-456',
      };

      mockBusinessesService.create.mockResolvedValue(mockBusiness);

      const result = await controller.create(createBusinessDto);

      expect(mockBusinessesService.create).toHaveBeenCalledWith(
        createBusinessDto,
      );
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('findAll', () => {
    it('should return array of businesses with default pagination', async () => {
      const businesses = [mockBusiness];
      mockBusinessesService.findAll.mockResolvedValue(businesses);

      const result = await controller.findAll();

      expect(mockBusinessesService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(businesses);
    });

    it('should return array of businesses with custom pagination', async () => {
      const businesses = [mockBusiness];
      mockBusinessesService.findAll.mockResolvedValue(businesses);

      const result = await controller.findAll(2, 20);

      expect(mockBusinessesService.findAll).toHaveBeenCalledWith(2, 20);
      expect(result).toEqual(businesses);
    });
  });

  describe('findOne', () => {
    it('should return a business', async () => {
      mockBusinessesService.findOne.mockResolvedValue(mockBusiness);

      const result = await controller.findOne('business-uuid-123');

      expect(mockBusinessesService.findOne).toHaveBeenCalledWith(
        'business-uuid-123',
      );
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockBusinessesService.findOne.mockRejectedValue(
        new NotFoundException('Business not found'),
      );

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByFounder', () => {
    it('should return businesses by founder', async () => {
      const businesses = [mockBusiness];
      mockBusinessesService.findByFounder.mockResolvedValue(businesses);

      const result = await controller.findByFounder('person-uuid-456');

      expect(mockBusinessesService.findByFounder).toHaveBeenCalledWith(
        'person-uuid-456',
      );
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
      mockBusinessesService.update.mockResolvedValue(updatedBusiness);

      const result = await controller.update(
        'business-uuid-123',
        updateBusinessDto,
      );

      expect(mockBusinessesService.update).toHaveBeenCalledWith(
        'business-uuid-123',
        updateBusinessDto,
      );
      expect(result).toEqual(updatedBusiness);
    });
  });

  describe('remove', () => {
    it('should soft delete a business', async () => {
      const deletedBusiness = { ...mockBusiness, isDeleted: true };
      mockBusinessesService.remove.mockResolvedValue(deletedBusiness);

      const result = await controller.remove('business-uuid-123');

      expect(mockBusinessesService.remove).toHaveBeenCalledWith(
        'business-uuid-123',
      );
      expect(result).toEqual(deletedBusiness);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted business', async () => {
      mockBusinessesService.restore.mockResolvedValue(mockBusiness);

      const result = await controller.restore('business-uuid-123');

      expect(mockBusinessesService.restore).toHaveBeenCalledWith(
        'business-uuid-123',
      );
      expect(result).toEqual(mockBusiness);
    });
  });
});
