/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Person } from '../../users/schemas/person.schema'; // Import Person type

// Assuming Person is the class name from person.schema.ts
// We'll use Types.ObjectId to reference the Person document for the founder.

@Schema({ _id: false }) // No separate _id for PostalAddress, it's part of Business
export class PostalAddress {
  // No longer extends Document directly, it's a sub-document
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
  softDelete(): Promise<
    this & Document<unknown, Record<string, unknown>, BusinessDocument>
  >;
  restore(): Promise<
    this & Document<unknown, Record<string, unknown>, BusinessDocument>
  >;
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

BusinessSchema.virtual('dateCreated').get(function (this: BusinessDocument) {
  return this.createdAt;
});

BusinessSchema.virtual('dateModified').get(function (this: BusinessDocument) {
  return this.updatedAt;
});

BusinessSchema.set('toJSON', {
  virtuals: true,
  getters: true,
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  transform: function (doc: any, ret: any) {
    ret['@context'] = 'https://schema.org';
    // '@type' is already handled by a direct Prop default: 'LocalBusiness'
    // but ensure it's present in the final 'ret' object
    ret['@type'] ??=
      (doc as unknown as Record<string, unknown>)['@type'] ?? 'LocalBusiness';

    // Ensure the main document's @id is correctly set
    if (
      typeof (doc as unknown as Record<string, unknown>)['@id'] === 'string' &&
      String((doc as unknown as Record<string, unknown>)['@id']).length > 0
    ) {
      ret['@id'] = (doc as unknown as Record<string, unknown>)['@id'];
    } else if (doc._id) {
      ret['@id'] = doc._id.toString();
    }

    // Customize the 'founder' field output
    if (ret.founder) {
      const founderDoc = doc.founder as unknown; // Original populated document or ObjectId
      let founderIdValue = '';

      if (founderDoc && typeof founderDoc === 'object') {
        // Populated
        const founderRecord = founderDoc as Record<string, unknown>;
        if (
          typeof founderRecord['@id'] === 'string' &&
          String(founderRecord['@id']).length > 0
        ) {
          founderIdValue = String(founderRecord['@id']);
        } else if (founderRecord._id) {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          founderIdValue = founderRecord._id.toString();
        }
      } else if (founderDoc) {
        // ObjectId or string ID
        founderIdValue =
          typeof founderDoc === 'string'
            ? founderDoc
            : (founderDoc as { toString(): string }).toString();
      }

      if (founderIdValue) {
        ret.founder = {
          '@type': 'Person',
          '@id': founderIdValue,
        };
      } else if (
        typeof ret.founder === 'object' &&
        ret.founder &&
        (ret.founder as Record<string, unknown>)['@id']
      ) {
        // If Person's toJSON already transformed it and put an '@id'
        ret.founder = {
          '@type': 'Person',
          '@id': (ret.founder as Record<string, unknown>)['@id'],
        };
      } else if (ret.founder) {
        // Fallback for non-object ID case
        ret.founder = {
          '@type': 'Person',
          '@id':
            typeof ret.founder === 'string'
              ? ret.founder
              : (ret.founder as { toString(): string }).toString(),
        };
      }
    }

    // Ensure PostalAddress gets its @type if it's not automatically included by sub-schema toJSON
    if (
      ret.address &&
      typeof ret.address === 'object' &&
      !(ret.address as Record<string, unknown>)['@type']
    ) {
      (ret.address as Record<string, unknown>)['@type'] = 'PostalAddress';
    }

    // Ensure dateCreated and dateModified are using the virtuals
    const docWithVirtuals = doc as unknown as {
      dateCreated: unknown;
      dateModified: unknown;
    };
    ret.dateCreated = docWithVirtuals.dateCreated;
    ret.dateModified = docWithVirtuals.dateModified;

    // delete ret.__v;
    // delete ret._id;
    return ret;
  },
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */
});
BusinessSchema.set('toObject', { virtuals: true, getters: true });

// Indexes
BusinessSchema.index({ isDeleted: 1, name: 1 });
BusinessSchema.index(
  { isDeleted: 1, '@id': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
// Consider geospatial index if address.geolocation is added later
// e.g., BusinessSchema.index({ 'address.location': '2dsphere' });

// Soft delete methods

BusinessSchema.methods.softDelete = function (this: BusinessDocument) {
  this.deletedAt = new Date();
  this.isDeleted = true;
  return this.save();
};

BusinessSchema.methods.restore = function (this: BusinessDocument) {
  this.deletedAt = undefined;
  this.isDeleted = false;
  return this.save();
};
