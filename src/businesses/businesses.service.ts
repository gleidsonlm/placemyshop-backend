import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);

  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
  ): Promise<BusinessDocument> {
    this.logger.log(`Creating new business: ${createBusinessDto.name}`);

    // Map founderId to founder field
    const { founderId, ...businessDataWithoutFounderId } = createBusinessDto;
    const businessData = {
      ...businessDataWithoutFounderId,
      founder: founderId,
    };

    const createdBusiness = await this.businessModel.create(businessData);
    this.logger.log(
      `Successfully created business with id: ${createdBusiness['@id']}`,
    );

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
