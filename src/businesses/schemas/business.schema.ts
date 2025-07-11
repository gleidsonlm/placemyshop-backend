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
  transform: function (doc: any, ret: any) {
    // Customize the 'founder' field output.
    // When founder is populated, PersonSchema.toJSON will have already run.
    // ret.founder will be the plain object result from PersonSchema.toJSON.
    if (ret.founder && typeof ret.founder === 'object' && !Array.isArray(ret.founder) && ret.founder['@id']) {
      // ret.founder is the already transformed plain object from PersonSchema.toJSON
      const founderPlainObject = ret.founder;

      // The PersonSchema.toJSON should have already correctly set '@id' on founderPlainObject.
      // We are re-shaping it here as per test expectations for businessJSON.founder.
      // console.log(`[Business toJSON] founderPlainObject from PersonSchema.toJSON:`, JSON.stringify(founderPlainObject));
      // console.log(`[Business toJSON] Using founderPlainObject['@id']: ${founderPlainObject['@id']}`);

      ret.founder = {
        '@type': 'Person', // As expected by the test
        '@id': founderPlainObject['@id'], // This should be the correct string ID
        // Test doesn't expect other fields like givenName, familyName here,
        // so we only include @type and @id for the founder object within businessJSON.
      };
    } else if (ret.founder) { // If founder is not populated (it's an ObjectId or its string representation)
      // console.log(`[Business toJSON] Unpopulated founder, value: ${ret.founder.toString()}`);
      ret.founder = {
        '@type': 'Person',
        '@id': ret.founder.toString(), // Convert ObjectId to string
      };
    }

    // Optionally remove Mongoose version key and internal _id from the Business object itself
    // delete ret.__v;
    // delete ret._id;
    return ret;
  },
});
BusinessSchema.set('toObject', { virtuals: true, getters: true });

// Indexes
BusinessSchema.index({ isDeleted: 1, name: 1 });
BusinessSchema.index({ isDeleted: 1, '@id': 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
// Consider geospatial index if address.geolocation is added later
// e.g., BusinessSchema.index({ 'address.location': '2dsphere' });

// Soft delete methods
BusinessSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isDeleted = true;
  return this.save();
};

BusinessSchema.methods.restore = function() {
  this.deletedAt = null;
  this.isDeleted = false;
  return this.save();
};
