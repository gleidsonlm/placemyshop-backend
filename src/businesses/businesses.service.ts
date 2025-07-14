import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Person, PersonDocument } from '../users/schemas/person.schema';
import { Cache } from 'cache-manager';

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);

  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
  ): Promise<BusinessDocument> {
    this.logger.log(`Creating new business: ${createBusinessDto.name}`);

    // Ensure the founder exists
    const founder = await this.personModel
      .findOne({
        '@id': createBusinessDto.founderId,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!founder) {
      throw new BadRequestException(
        `Founder with ID "${createBusinessDto.founderId}" not found.`,
      );
    }

    // Map founderId to founder field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { founderId: _founderId, ...businessDataWithoutFounderId } =
      createBusinessDto;
    const businessData = {
      ...businessDataWithoutFounderId,
      founder: founder._id, // Use the ObjectId of the found user
    };

    const createdBusiness = await this.businessModel.create(businessData);
    this.logger.log(
      `Successfully created business with id: ${createdBusiness['@id']}`,
    );

    // Invalidate cache
    await this.cacheManager.del('allBusinesses');

    // Return populated business
    const populatedBusiness = await this.businessModel
      .findById(createdBusiness._id)
      .populate('founder')
      .exec();

    if (!populatedBusiness) {
      throw new Error('Failed to retrieve created business');
    }

    return populatedBusiness;
  }

  @CacheKey('allBusinesses')
  @CacheTTL(60)
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<BusinessDocument[]> {
    this.logger.log(`Finding all businesses - page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    return await this.businessModel
      .find({ isDeleted: { $ne: true } }) // Exclude soft-deleted businesses
      .populate('founder')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  @CacheKey('business_:id')
  @CacheTTL(60)
  async findOne(id: string): Promise<BusinessDocument> {
    this.logger.log(`Finding business with id: ${id}`);

    const business = await this.businessModel
      .findById(id)
      .populate('founder')
      .exec();

    if (business === null || business.isDeleted === true) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }

    return business;
  }

  @CacheKey('business_founder_:founderId')
  @CacheTTL(60)
  async findByFounder(founderId: string): Promise<BusinessDocument[]> {
    this.logger.log(`Finding businesses by founder id: ${founderId}`);

    return await this.businessModel
      .find({ founder: founderId, isDeleted: { $ne: true } })
      .populate('founder')
      .exec();
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<BusinessDocument> {
    this.logger.log(`Updating business with id: ${id}`);

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(id, updateBusinessDto, {
        new: true,
        runValidators: true,
      })
      .populate('founder')
      .exec();

    if (updatedBusiness === null || updatedBusiness.isDeleted === true) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }

    // Invalidate cache
    await this.cacheManager.del('allBusinesses');
    await this.cacheManager.del(`business_${id}`);

    this.logger.log(`Successfully updated business with id: ${id}`);
    return updatedBusiness;
  }

  async remove(id: string): Promise<BusinessDocument> {
    this.logger.log(`Soft deleting business with id: ${id}`);

    const business = await this.businessModel.findById(id);

    if (business === null || business.isDeleted === true) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }

    const deletedBusiness = await business.softDelete();
    this.logger.log(`Successfully soft deleted business with id: ${id}`);

    // Invalidate cache
    await this.cacheManager.del('allBusinesses');
    await this.cacheManager.del(`business_${id}`);

    return deletedBusiness;
  }

  async restore(id: string): Promise<BusinessDocument> {
    this.logger.log(`Restoring business with id: ${id}`);

    const business = await this.businessModel.findById(id);

    if (!business) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }

    if (business.isDeleted !== true) {
      this.logger.warn(
        `Business with id ${id} is not deleted, no action needed`,
      );
      return business;
    }

    const restoredBusiness = await business.restore();
    this.logger.log(`Successfully restored business with id: ${id}`);

    return restoredBusiness;
  }
}
