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
  transform: function (doc: any, ret: any) { // Use any for doc to match Mongoose's flexible signature
    // Customize the 'founder' field output
    if (ret.founder && ret.founder instanceof Document) { // Check if populated Mongoose Document
      const founderObject = ret.founder.toObject({ virtuals: true });
      // console.log("Transforming Business's founder. founderObject:", JSON.stringify(founderObject, null, 2));
      // console.log("founderObject['@id'] type:", typeof founderObject['@id'], "value:", founderObject['@id']);
      // console.log("founderObject._id type:", typeof founderObject._id, "value:", founderObject._id);

      // Removed the duplicated 'let idValue;' and if/else block.
      // Kept the intended single line declaration:

      console.log(`[Business toJSON] founderObject raw:`, JSON.stringify(founderObject));
      console.log(`[Business toJSON] founderObject['@id'] TYPE: ${typeof founderObject['@id']}, VALUE: ${founderObject['@id']}`);
      console.log(`[Business toJSON] founderObject._id TYPE: ${typeof founderObject._id}, VALUE: ${founderObject._id}`);
      console.log(`[Business toJSON] founderObject._id.toString() VALUE: ${founderObject._id?.toString()}`);

      let finalIdValue: string = '';
      if (typeof founderObject['@id'] === 'string' && founderObject['@id'].length > 0) {
        finalIdValue = founderObject['@id'];
      } else if (founderObject._id) {
        finalIdValue = founderObject._id.toString();
      }
      console.log(`[Business toJSON] CHOSEN finalIdValue TYPE: ${typeof finalIdValue}, VALUE: ${finalIdValue}`);
      ret.founder = {
        '@type': 'Person',
        '@id': finalIdValue,
        // Optionally include other relevant founder details like name
        // givenName: founderObject.givenName,
        // familyName: founderObject.familyName,
      };
    } else if (ret.founder) { // If it's just an ID (ObjectId)
      // This block should correctly handle the case where founder is not populated
      ret.founder = {
        '@type': 'Person',
        '@id': String(ret.founder.toString()), // Ensure it's a string
      };
    }

    // Optionally remove Mongoose version key and internal _id
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
