import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonDocument> {
    this.logger.log(`Creating new person with email: ${createPersonDto.email}`);

    // Check if email already exists
    const existingPerson = await this.personModel.findOne({
      email: createPersonDto.email,
    });
    if (existingPerson) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(
      createPersonDto.password,
      saltRounds,
    );

    // Create person document
    const { roleId, ...personDataWithoutSensitive } = createPersonDto;

    // Create the final data structure for database insertion
    const personData: Omit<CreatePersonDto, 'password' | 'roleId'> & {
      passwordHash: string;
      role: string;
    } = {
      ...personDataWithoutSensitive,
      passwordHash,
      role: roleId,
    };

    const createdPerson = await this.personModel.create(personData);
    this.logger.log(
      `Successfully created person with id: ${createdPerson['@id']}`,
    );

    // Return populated person
    const populatedPerson = await this.personModel
      .findById(createdPerson._id)
      .populate('role')
      .exec();

    if (!populatedPerson) {
      throw new Error('Failed to retrieve created person');
    }

    return populatedPerson;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PersonDocument[]> {
    this.logger.log(`Finding all persons - page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    return await this.personModel
      .find({ isDeleted: { $ne: true } }) // Exclude soft-deleted persons
      .populate('role')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<PersonDocument> {
    this.logger.log(`Finding person with id: ${id}`);

    const person = await this.personModel.findById(id).populate('role').exec();

    if (!person || person.isDeleted) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    return person;
  }

  async findByEmail(email: string): Promise<PersonDocument | null> {
    this.logger.log(`Finding person with email: ${email}`);

    return await this.personModel
      .findOne({ email, isDeleted: { $ne: true } })
      .populate('role')
      .exec();
  }

  async update(
    id: string,
    updatePersonDto: UpdatePersonDto,
  ): Promise<PersonDocument> {
    this.logger.log(`Updating person with id: ${id}`);

    // If password is being updated, hash it
    const { password, roleId, ...baseUpdateData } = updatePersonDto;
    const updateData: typeof baseUpdateData & {
      passwordHash?: string;
      role?: string;
    } = { ...baseUpdateData };

    if (password) {
      const saltRounds = 12;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // If roleId is provided, map it to role field
    if (roleId) {
      updateData.role = roleId;
    }

    const updatedPerson = await this.personModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('role')
      .exec();

    if (!updatedPerson || updatedPerson.isDeleted) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    this.logger.log(`Successfully updated person with id: ${id}`);
    return updatedPerson;
  }

  async remove(id: string): Promise<PersonDocument> {
    this.logger.log(`Soft deleting person with id: ${id}`);

    const person = await this.personModel.findById(id).exec();

    if (!person || person.isDeleted) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    const deletedPerson = await person.softDelete();
    this.logger.log(`Successfully soft deleted person with id: ${id}`);

    return deletedPerson;
  }

  async restore(id: string): Promise<PersonDocument> {
    this.logger.log(`Restoring person with id: ${id}`);

    const person = await this.personModel.findById(id).exec();

    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    if (!person.isDeleted) {
      this.logger.warn(`Person with id ${id} is not deleted, no action needed`);
      return person;
    }

    const restoredPerson = await person.restore();
    this.logger.log(`Successfully restored person with id: ${id}`);

    return restoredPerson;
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<PersonDocument | null> {
    this.logger.log(`Validating password for email: ${email}`);

    const person = await this.personModel
      .findOne({ email, isDeleted: { $ne: true } })
      .populate('role')
      .exec();

    if (!person) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, person.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return person;
  }
}
