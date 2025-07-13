import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Person.name) private personModel: Model<PersonDocument>) {}

  async findOneByEmail(email: string): Promise<PersonDocument | undefined> {
    return this.personModel.findOne({ email }).populate('role').exec();
  }

  async create(createPersonDto: CreatePersonDto): Promise<PersonDocument> {
    const createdPerson = new this.personModel(createPersonDto);
    return createdPerson.save();
  }
}
