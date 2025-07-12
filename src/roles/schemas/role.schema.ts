import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define specific permissions as string constants or enums for better maintainability
// These are based on the issue description.
export enum Permission {
  // Admin Role Permissions
  MANAGE_USER_ROLES = 'user_role_management.manage', // assign/remove roles
  MANAGE_BUSINESS_DETAILS = 'business_details.manage', // CRUD
  MANAGE_CUSTOMERS_ADMIN = 'customers.manage_admin', // CRUD (Admin level)
  ACCESS_CUSTOMER_CHAT_FULL_ADMIN = 'customer_chat.access_full_admin', // Full chat access (Admin level)
  MANAGE_EXTERNAL_INTEGRATIONS = 'external_integrations.manage',

  // Manager Role Permissions
  MANAGE_CUSTOMERS_MANAGER = 'customers.manage_manager', // CRUD (Manager level)
  ACCESS_CUSTOMER_CHAT_FULL_MANAGER = 'customer_chat.access_full_manager', // Full chat access (Manager level)

  // Assistant Role Permissions
  ACCESS_CUSTOMER_CHAT_READ_WRITE = 'customer_chat.access_read_write', // Read/Write chat access
}

export enum RoleName {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  ASSISTANT = 'Assistant',
}

// Interface for the Role document
export interface RoleDocument extends Role, Document {
  createdAt: Date;
  updatedAt: Date;
  softDelete(): Promise<
    this & Document<unknown, Record<string, unknown>, RoleDocument>
  >;
  restore(): Promise<
    this & Document<unknown, Record<string, unknown>, RoleDocument>
  >;
}

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ type: String, default: () => uuidv4(), unique: true })
  '@id': string; // schema.org identifier (though Role isn't strictly schema.org, using consistent ID pattern)

  @Prop({ required: true, unique: true, enum: RoleName, index: true })
  roleName: RoleName;

  @Prop({ type: [String], enum: Object.values(Permission), required: true })
  permissions: Permission[];

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted?: boolean;

  // Mongoose timestamps: createdAt and updatedAt
  dateCreated?: Date;
  dateModified?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.virtual('dateCreated').get(function (this: RoleDocument) {
  return this.createdAt;
});

RoleSchema.virtual('dateModified').get(function (this: RoleDocument) {
  return this.updatedAt;
});

RoleSchema.set('toJSON', {
  virtuals: true,
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
  transform: function (doc: any, ret: any) {
    ret['@context'] = 'https://schema.org'; // Or appropriate context if not schema.org
    ret['@type'] = 'Role';

    // Ensure the main document's @id is correctly set
    if (
      typeof (doc as unknown as Record<string, unknown>)['@id'] === 'string' &&
      String((doc as unknown as Record<string, unknown>)['@id']).length > 0
    ) {
      ret['@id'] = (doc as unknown as Record<string, unknown>)['@id'];
    } else if (doc._id) {
      // Mongoose Document _id

      ret['@id'] = doc._id.toString();
    }

    // Ensure dateCreated and dateModified are using the virtuals
    ret.dateCreated = doc.dateCreated;
    ret.dateModified = doc.dateModified;

    // delete ret._id;
    // delete ret.__v;
    return ret;
  },
});
RoleSchema.set('toObject', { virtuals: true });

// Indexes
RoleSchema.index(
  { isDeleted: 1, roleName: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
RoleSchema.index(
  { isDeleted: 1, '@id': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

// Soft delete methods

RoleSchema.methods.softDelete = function (this: RoleDocument) {
  this.deletedAt = new Date();
  this.isDeleted = true;
  return this.save();
};

RoleSchema.methods.restore = function (this: RoleDocument) {
  this.deletedAt = undefined;
  this.isDeleted = false;
  return this.save();
};

// Helper to map RoleName to its default permissions
export const getDefaultPermissionsForRole = (
  roleName: RoleName,
): Permission[] => {
  switch (roleName) {
    case RoleName.ADMIN:
      return [
        Permission.MANAGE_USER_ROLES,
        Permission.MANAGE_BUSINESS_DETAILS,
        Permission.MANAGE_CUSTOMERS_ADMIN,
        Permission.ACCESS_CUSTOMER_CHAT_FULL_ADMIN,
        Permission.MANAGE_EXTERNAL_INTEGRATIONS,
      ];
    case RoleName.MANAGER:
      return [
        Permission.MANAGE_CUSTOMERS_MANAGER,
        Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER,
      ];
    case RoleName.ASSISTANT:
      return [Permission.ACCESS_CUSTOMER_CHAT_READ_WRITE];
    default:
      return [];
  }
};
