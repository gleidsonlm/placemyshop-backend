import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose'; // Import Model
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs
import { Role } from '../../roles/schemas/role.schema'; // Import Role type for populated fields

// We will define Role later, for now, we can use Types.ObjectId or string
// For schema.org alignment, we'll use a nested structure or a reference string.
// Let's assume Role will have its own schema and we'll reference its _id or a UUID.

export enum PersonStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

// Interface for the Person document (includes Mongoose document properties like createdAt, updatedAt)
export interface PersonDocument extends Person, Document {
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<this & Document<unknown, {}, PersonDocument>>; // Add method signatures
  restore(): Promise<this & Document<unknown, {}, PersonDocument>>;
}

@Schema({ timestamps: true, collection: 'persons' })
export class Person {
  @Prop({ type: String, default: () => uuidv4(), unique: true })
  '@id': string; // schema.org identifier

  @Prop({ required: true })
  givenName: string;

  @Prop({ required: true })
  familyName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  telephone?: string;

  @Prop({ required: true })
  passwordHash: string; // Store hashed password, not plain text

  // Reference to Role. This could be an ObjectId or a UUID string depending on Role's @id
  // For now, let's assume it will be a string representing Role's @id
  // If Role is embedded, the type would be different.
  // Based on the JSON-LD example, it seems like a simplified embedded Role or a reference.
  // For Mongoose, a direct reference is cleaner.
  @Prop({ type: Types.ObjectId, ref: 'Role', index: true }) // Assuming 'Role' is the name of the Role model
  role: Types.ObjectId | Role; // This will be populated with Role details if needed

  @Prop({ type: String, enum: PersonStatus, default: PersonStatus.ACTIVE, index: true })
  status: PersonStatus;

  @Prop({ type: Date, default: null })
  deletedAt?: Date; // For soft delete

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted?: boolean; // For soft delete flag

  // Mongoose timestamps: createdAt and updatedAt are automatically added by `timestamps: true`
  // For schema.org's dateCreated and dateModified, we can use virtuals or ensure they map
  dateCreated?: Date; // Will be `createdAt`
  dateModified?: Date; // Will be `updatedAt`
}

export const PersonSchema = SchemaFactory.createForClass(Person);

// For schema.org alignment in JSON output, virtuals can be used
PersonSchema.virtual('dateCreated').get(function(this: PersonDocument) {
  return this.createdAt;
});

PersonSchema.virtual('dateModified').get(function(this: PersonDocument) {
  return this.updatedAt;
});

// Ensure virtuals are included in toJSON and toObject outputs
PersonSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) { // Reverted doc type to any
    // Ensure the main document's @id is correctly set
    // Prefer the document's '@id' field if it exists and is a non-empty string,
    // otherwise fall back to _id.toString().
    if (typeof doc['@id'] === 'string' && doc['@id'].length > 0) {
      ret['@id'] = doc['@id'];
    } else if (doc._id) {
      ret['@id'] = doc._id.toString();
    }

    // Customize the 'role' field output
    if (ret.role && typeof ret.role === 'object') { // Check if role is populated (object)
        // If role itself has a toObject (it's a Mongoose document)
        const roleDoc = doc.role as any; // doc.role should be the populated Mongoose document
        if (roleDoc && typeof roleDoc.toObject === 'function') {
            const roleObject = roleDoc.toObject({ virtuals: true });
            let roleIdValue = '';
            if (typeof roleObject['@id'] === 'string' && roleObject['@id'].length > 0) {
                roleIdValue = roleObject['@id'];
            } else if (roleObject._id) {
                roleIdValue = roleObject._id.toString();
            }
            ret.role = {
                '@type': 'Role',
                '@id': roleIdValue,
                // Ensure roleName is included if it exists on the transformed roleObject
                ...(roleObject.roleName && { roleName: roleObject.roleName }),
            };
        } else if (ret.role._id) { // If it's a simple object with an _id (less likely for populated)
             let roleIdValue = '';
            if (typeof ret.role['@id'] === 'string' && ret.role['@id'].length > 0) {
                roleIdValue = ret.role['@id'];
            } else {
                roleIdValue = ret.role._id.toString();
            }
            ret.role = {
                '@type': 'Role',
                '@id': roleIdValue,
                ...(ret.role.roleName && { roleName: ret.role.roleName }),
            };
        }
        // If ret.role is already transformed and has '@id', leave it, or handle as needed
    } else if (ret.role) { // If role is just an ObjectId (string or ObjectId)
        ret.role = {
            '@type': 'Role',
            '@id': ret.role.toString(),
        };
    }

    // Remove passwordHash from output
    if ('passwordHash' in ret) {
      delete ret.passwordHash;
    }
    // delete ret.__v; // Mongoose version key
    // delete ret._id; // Keep _id by default, or remove if specified by requirements

    return ret;
  },
});
PersonSchema.set('toObject', { virtuals: true });

// Compound index for soft delete
PersonSchema.index({ isDeleted: 1, email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
PersonSchema.index({ isDeleted: 1, '@id': 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Pre-save hook for soft delete logic if needed, or handle in service layer
// Example:
// PersonSchema.pre('find', function() {
//   this.where({ isDeleted: false });
// });
// PersonSchema.pre('findOne', function() {
//   this.where({ isDeleted: false });
// });
// PersonSchema.pre('count', function() {
//   this.where({ isDeleted: false });
// });
// PersonSchema.pre('countDocuments', function() {
//   this.where({ isDeleted: false });
// });
// PersonSchema.pre('aggregate', function() {
//   this.pipeline().unshift({ $match: { isDeleted: false } });
// });

// Note: The global soft delete pre-hooks can be complex to manage with all query types.
// It's often better to handle this explicitly in service methods.
// However, for basic find operations, they can be useful.
// For now, we'll rely on service-level filtering for soft-deleted documents.

// Add a method for soft deleting
PersonSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isDeleted = true;
  return this.save();
};

// Add a method for restoring a soft-deleted document
PersonSchema.methods.restore = function() {
  this.deletedAt = null;
  this.isDeleted = false;
  return this.save();
};
