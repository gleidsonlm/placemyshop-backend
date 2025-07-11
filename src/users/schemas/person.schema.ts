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
  // Using `any` for doc type in transform to bypass overly strict Mongoose signature
  // while ensuring runtime properties are accessible. `ret` is the modified object.
  transform: function (doc: any, ret: any) {
    // Customize the 'role' field output if it's populated
    // A more robust check for a populated document (vs. just an ObjectId)
    if (ret.role && ret.role instanceof Document) { // Check if it's a Mongoose Document
      const roleObject = ret.role.toObject({ virtuals: true }); // Ensure virtuals from populated doc too
      // console.log("Transforming Person's role. roleObject:", JSON.stringify(roleObject, null, 2));
      // console.log("roleObject['@id'] type:", typeof roleObject['@id'], "value:", roleObject['@id']);
      // console.log("roleObject._id type:", typeof roleObject._id, "value:", roleObject._id);
      // console.log("roleObject._id.toString() value:", roleObject._id?.toString());

      // Removed the duplicated 'let idValue;' and if/else block.
      // Kept the intended single line declaration:

      console.log(`[Person toJSON] roleObject raw:`, JSON.stringify(roleObject));
      console.log(`[Person toJSON] roleObject['@id'] TYPE: ${typeof roleObject['@id']}, VALUE: ${roleObject['@id']}`);
      console.log(`[Person toJSON] roleObject._id TYPE: ${typeof roleObject._id}, VALUE: ${roleObject._id}`);
      console.log(`[Person toJSON] roleObject._id.toString() VALUE: ${roleObject._id?.toString()}`);

      let finalIdValue: string = ''; // Default to empty string
      if (typeof roleObject['@id'] === 'string' && roleObject['@id'].length > 0) {
        finalIdValue = roleObject['@id'];
      } else if (roleObject._id) {
        finalIdValue = roleObject._id.toString();
      }
      console.log(`[Person toJSON] CHOSEN finalIdValue TYPE: ${typeof finalIdValue}, VALUE: ${finalIdValue}`);
      console.log(`[Person toJSON] FINAL CHECK before assign: finalIdValue is: ${finalIdValue}, type: ${typeof finalIdValue}`);

      ret.role = {
        '@type': 'Role',
        '@id': finalIdValue,
        roleName: roleObject.roleName,
      };
    } else if (ret.role) { // If it's just an ID (ObjectId)
      ret.role = {
        '@type': 'Role', // Still good to indicate type
        '@id': ret.role.toString(), // Convert ObjectId to string
      };
    }

    // Remove passwordHash from output
    // Make sure ret.passwordHash is treated as potentially existing
    if ('passwordHash' in ret) {
      delete ret.passwordHash;
    }

    // Optionally remove Mongoose version key and internal _id
    // delete ret.__v;
    // delete ret._id;
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
