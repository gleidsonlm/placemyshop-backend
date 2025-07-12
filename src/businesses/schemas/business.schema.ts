import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose'; // Import Model
import { v4 as uuidv4 } from 'uuid';
import { Person } from '../../users/schemas/person.schema'; // Import Person type

// Assuming Person is the class name from person.schema.ts
// We'll use Types.ObjectId to reference the Person document for the founder.

@Schema({ _id: false }) // No separate _id for PostalAddress, it's part of Business
export class PostalAddress { // No longer extends Document directly, it's a sub-document
  @Prop({ default: 'PostalAddress' })
  '@type': string;

  @Prop()
  streetAddress?: string;

  @Prop()
  addressLocality?: string; // City

  @Prop()
  addressRegion?: string; // State or Region

  @Prop()
  postalCode?: string;

  @Prop()
  addressCountry?: string;
}
export const PostalAddressSchema = SchemaFactory.createForClass(PostalAddress);

// Interface for the Business document
export interface BusinessDocument extends Business, Document {
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<this & Document<unknown, {}, BusinessDocument>>;
  restore(): Promise<this & Document<unknown, {}, BusinessDocument>>;
}

@Schema({ timestamps: true, collection: 'businesses' })
export class Business {
  @Prop({ type: String, default: () => uuidv4(), unique: true })
  '@id': string; // schema.org identifier

  @Prop({ default: 'LocalBusiness' }) // Defaulting to LocalBusiness as per issue
  '@type': string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: PostalAddressSchema })
  address?: PostalAddress;

  @Prop()
  telephone?: string;

  @Prop({ index: true })
  email?: string;

  @Prop()
  url?: string; // Website URL

  @Prop({ type: [String] })
  sameAs?: string[]; // Array of social media links or other relevant URLs

  @Prop({ type: [String] }) // Example: ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"]
  openingHours?: string[]; // schema.org/openingHours can be text

  // Reference to the Person who founded/owns the business
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  founder: Types.ObjectId | Person; // Stores the ObjectId of the Person document or populated Person

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted?: boolean;

  // Mongoose timestamps: createdAt and updatedAt
  dateCreated?: Date;
  dateModified?: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);

BusinessSchema.virtual('dateCreated').get(function(this: BusinessDocument) {
  return this.createdAt;
});

BusinessSchema.virtual('dateModified').get(function(this: BusinessDocument) {
  return this.updatedAt;
});

BusinessSchema.set('toJSON', {
  virtuals: true,
  getters: true,
  transform: (doc: BusinessDocument, ret: Partial<BusinessDocument>) => {
    ret['@context'] = 'https://schema.org';
    ret['@type'] = ret['@type'] || 'LocalBusiness';

    // Ensure @id is set, preferring the schema's @id over the mongo _id
    ret['@id'] = doc['@id'] || doc._id.toString();

    // Simplify founder representation
    if (ret.founder) {
      const founder = doc.founder;
      let founderId = '';
      if (founder && typeof founder === 'object') {
        // Populated document
        founderId = founder['@id'] || founder._id.toString();
      } else if (founder) {
        // ObjectId or string
        founderId = founder.toString();
      }

      ret.founder = {
        '@type': 'Person',
        '@id': founderId,
      };
    }

    // Set @type for address if it exists
    if (ret.address) {
      ret.address['@type'] = 'PostalAddress';
    }

    // Copy virtuals to the final object
    ret.dateCreated = doc.dateCreated;
    ret.dateModified = doc.dateModified;

    // Remove mongoose specific fields
    delete ret.__v;
    delete ret._id;

    return ret;
  },
});

BusinessSchema.set('toObject', { virtuals: true, getters: true });

// Indexes
BusinessSchema.index({ isDeleted: 1, name: 1 });
BusinessSchema.index({ isDeleted: 1, '@id': 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Soft delete and restore methods using arrow functions
BusinessSchema.methods.softDelete = function (this: BusinessDocument): Promise<BusinessDocument> {
  this.deletedAt = new Date();
  this.isDeleted = true;
  return this.save();
};

BusinessSchema.methods.restore = function (this: BusinessDocument): Promise<BusinessDocument> {
  this.deletedAt = null;
  this.isDeleted = false;
  return this.save();
};
