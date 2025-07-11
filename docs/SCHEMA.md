# Schema Documentation

This document outlines the data schema design for the `placemyshop-backend` project. We use JSON-LD (JSON for Linking Data) to define our entities, promoting interoperability and semantic clarity by aligning with schema.org vocabularies where applicable.

## Rationale for JSON-LD

JSON-LD is chosen for its ability to:

-   **Provide Semantic Context:** It allows us to add context to our JSON data, making it self-descriptive and understandable by machines and humans.
-   **Enhance Interoperability:** By mapping to well-known vocabularies (like Schema.org), our data can be easily understood and consumed by other systems and search engines.
-   **Leverage Existing JSON Tooling:** JSON-LD is built on top of JSON, meaning we can use existing JSON parsers and libraries.
-   **Support Linked Data Principles:** It enables the creation of a web of data, where entities can be linked to other entities, both within and outside our domain.

## Core Entities

The primary entities implemented are Person (User), Role, and Business.

### 1. Person (User) Schema

Represents a user of the platform, aligning with `schema.org/Person`.

**JSON-LD Example (Illustrative Output):**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "givenName": "John",
  "familyName": "Doe",
  "email": "john.doe@example.com",
  "telephone": "+15551234567",
  "role": {
    "@type": "Role",
    "@id": "r1o2l3e4-e5f6-7890-1234-567890abcdef",
    "roleName": "Manager"
  },
  "dateCreated": "2024-07-11T10:00:00.000Z",
  "dateModified": "2024-07-11T10:00:00.000Z",
  "status": "Active"
}
```

**Fields:**

*   **`@context`**: (string) Specifies the vocabulary (Schema.org).
*   **`@type`**: (string) Defines the entity type as `Person`.
*   **`@id`**: (string, UUID v4) Unique identifier for the person.
*   **`givenName`**: (string, required) The person's given name.
*   **`familyName`**: (string, required) The person's family name.
*   **`email`**: (string, required, unique) The person's email address.
*   **`telephone`**: (string, optional) The person's telephone number.
*   **`passwordHash`**: (string, internal) Hashed password for authentication (not present in JSON-LD output).
*   **`role`**: (Object or ObjectId string) Reference to the user's `Role`. When populated, it provides role details.
    *   **`role.@type`**: (string) "Role".
    *   **`role.@id`**: (string, UUID v4) Identifier of the Role.
    *   **`role.roleName`**: (string) Name of the role (e.g., "Admin", "Manager").
*   **`status`**: (string, enum: "Active", "Inactive", default: "Active") Current status of the user.
*   **`dateCreated`**: (datetime) Timestamp of when the user was created (maps to Mongoose `createdAt`).
*   **`dateModified`**: (datetime) Timestamp of when the user was last updated (maps to Mongoose `updatedAt`).
*   **`deletedAt`**: (datetime, internal) Timestamp for soft deletion.
*   **`isDeleted`**: (boolean, internal) Flag for soft deletion.

### 2. Role Schema

Represents the role a user has within the system, defining their permissions. While `schema.org/Role` exists, this implementation includes custom permissions.

**JSON-LD Example (Illustrative Output):**
```json
{
  "@context": "https://schema.org",
  "@type": "Role",
  "@id": "r1o2l3e4-e5f6-7890-1234-567890abcdef",
  "roleName": "Admin",
  "permissions": [
    "user_role_management.manage",
    "business_details.manage",
    "customers.manage_admin",
    "customer_chat.access_full_admin",
    "external_integrations.manage"
  ],
  "dateCreated": "2024-07-11T09:00:00.000Z",
  "dateModified": "2024-07-11T09:00:00.000Z"
}
```

**Fields:**

*   **`@context`**: (string) Specifies the vocabulary (Schema.org).
*   **`@type`**: (string) Defines the entity type as `Role`.
*   **`@id`**: (string, UUID v4) Unique identifier for the role.
*   **`roleName`**: (string, enum: "Admin", "Manager", "Assistant", required, unique) The name of the role.
*   **`permissions`**: (array of strings, required) List of permission keys associated with the role. Examples:
    *   Admin: `user_role_management.manage`, `business_details.manage`, etc.
    *   Manager: `customers.manage_manager`, `customer_chat.access_full_manager`.
    *   Assistant: `customer_chat.access_read_write`.
*   **`dateCreated`**: (datetime) Timestamp of creation.
*   **`dateModified`**: (datetime) Timestamp of last update.
*   **`deletedAt`**: (datetime, internal) Timestamp for soft deletion.
*   **`isDeleted`**: (boolean, internal) Flag for soft deletion.

### 3. Business Schema

Represents a local business, aligning with `schema.org/LocalBusiness`.

**JSON-LD Example (Illustrative Output):**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "b1u2s3i4-n5e6-s7s8-9012-34567890abcd",
  "name": "John Doe's Clinic",
  "description": "A friendly local clinic.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Anytown",
    "addressRegion": "CA",
    "postalCode": "90210",
    "addressCountry": "US"
  },
  "telephone": "+15559876543",
  "email": "contact@johndoesclinic.com",
  "url": "http://www.johndoesclinic.com",
  "sameAs": [
    "http://www.facebook.com/johndoesclinic",
    "http://www.twitter.com/johndoesclinic"
  ],
  "openingHours": [
    "Mo-Fr 09:00-17:00",
    "Sa 10:00-14:00"
  ],
  "founder": {
    "@type": "Person",
    "@id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
  },
  "dateCreated": "2024-07-11T11:00:00.000Z",
  "dateModified": "2024-07-11T11:00:00.000Z"
}
```

**Fields:**

*   **`@context`**: (string) Specifies the vocabulary (Schema.org).
*   **`@type`**: (string, default: "LocalBusiness") Defines the entity type.
*   **`@id`**: (string, UUID v4) Unique identifier for the business.
*   **`name`**: (string, required) The name of the business.
*   **`description`**: (string, optional) A description of the business.
*   **`address`**: (Object, optional) The physical address of the business.
    *   **`address.@type`**: (string) "PostalAddress".
    *   **`address.streetAddress`**: (string, optional)
    *   **`address.addressLocality`**: (string, optional) City.
    *   **`address.addressRegion`**: (string, optional) State/Region.
    *   **`address.postalCode`**: (string, optional)
    *   **`address.addressCountry`**: (string, optional)
*   **`telephone`**: (string, optional) Contact telephone number.
*   **`email`**: (string, optional) Contact email address.
*   **`url`**: (string, optional, URL) The official website of the business.
*   **`sameAs`**: (array of strings, optional, URL) Links to social media profiles or other relevant pages.
*   **`openingHours`**: (array of strings, optional) Textual representation of opening hours (e.g., "Mo-Fr 09:00-17:00").
*   **`founder`**: (Object or ObjectId string, required) Reference to the `Person` who founded/owns the business. When populated:
    *   **`founder.@type`**: (string) "Person".
    *   **`founder.@id`**: (string, UUID v4) Identifier of the founder (Person's `@id`).
*   **`dateCreated`**: (datetime) Timestamp of creation.
*   **`dateModified`**: (datetime) Timestamp of last update.
*   **`deletedAt`**: (datetime, internal) Timestamp for soft deletion.
*   **`isDeleted`**: (boolean, internal) Flag for soft deletion.

---

This documentation will be updated as new entities are introduced or existing ones are modified.
The JSON-LD examples are illustrative of the output when references are populated. The actual stored MongoDB documents will contain ObjectId references for `role` and `founder` fields.
Soft delete fields (`deletedAt`, `isDeleted`) and `passwordHash` are for internal use and generally not exposed directly in public-facing JSON-LD unless specifically required.
```
