# Performance Considerations

This document outlines performance considerations for the data schema and services in the PlaceMyShop backend. The analysis covers indexing, query optimization, caching, and data growth.

## 1. Indexing

The current schema implementation includes several indexes that are beneficial for performance. However, there are opportunities for further optimization.

### Current Indexes:

- **Person:** `email`, `status`, `isDeleted`, `role`, `@id`
- **Role:** `roleName`, `isDeleted`, `@id`
- **Business:** `name`, `email`, `founder`, `isDeleted`, `@id`

### Recommendations:

- **Compound Indexes:**
  - For the `Person` schema, the compound index `{ isDeleted: 1, email: 1 }` is effective for ensuring uniqueness of email for non-deleted users. A similar index on `{ isDeleted: 1, '@id': 1 }` is also good.
  - Consider a compound index on `{ isDeleted: 1, status: 1 }` in the `Person` schema if filtering by both `isDeleted` and `status` is a common operation.
  - For the `Business` schema, a compound index on `{ isDeleted: 1, name: 1 }` is good for searching businesses by name.

- **Partial Indexes:**
  - The use of `partialFilterExpression: { isDeleted: false }` is excellent for unique indexes on soft-deletable documents. This is already well-implemented.

- **Geospatial Indexes:**
  - The `Business` schema includes a `PostalAddress`. If location-based searches become a feature (e.g., "find businesses near me"), adding a geospatial index on a coordinate field (e.g., `address.location` with GeoJSON) will be crucial.

## 2. Query Optimization

The services use `populate` to fetch related documents, which is convenient but can lead to performance issues if not used carefully.

### Recommendations:

- **Selective Population:**
  - When populating related documents, select only the necessary fields. For example, when populating the `role` in the `Person` schema, you might only need the `roleName` and `permissions`, not the entire `Role` document.
  - Example: `populate('role', 'roleName permissions')`

- **Lean Queries:**
  - For read-only operations where the full Mongoose document is not needed, use `.lean()` to get a plain JavaScript object instead of a Mongoose document. This can significantly improve performance.
  - Example: `this.personModel.find().lean().exec()`

- **Pagination:**
  - The `findAll` methods in the services correctly implement pagination using `skip` and `limit`. This is essential for performance when dealing with large datasets.

- **Projection:**
  - Use projection (`select`) to limit the fields returned from the database. This reduces the amount of data transferred over the network.
  - Example: `this.personModel.find().select('givenName familyName email').exec()`

## 3. Caching

Caching is not currently implemented, but it can provide a significant performance boost for frequently accessed data.

### Recommendations:

- **Cache-Aside Strategy:**
  - Implement a cache-aside strategy using a caching solution like Redis.
  - When a request for data comes in, first check the cache. If the data is in the cache, return it.
  - If the data is not in the cache, fetch it from the database, store it in the cache, and then return it.

- **What to Cache:**
  - **Roles and Permissions:** Roles and their permissions are unlikely to change frequently, making them ideal candidates for caching.
  - **User Sessions:** Cache user session data to reduce database lookups for authentication and authorization.
  - **Frequently Read Businesses:** Cache data for businesses that are frequently viewed.

- **Cache Invalidation:**
  - When data is updated or deleted, the corresponding cache entries must be invalidated. This can be done in the `update` and `remove` methods of the services.

## 4. Data Growth and Scalability

As the application grows, the amount of data will increase. It's important to have a plan for managing this growth.

### Recommendations:

- **Database Sharding:**
  - If the database becomes a bottleneck, consider sharding the database. MongoDB has built-in support for sharding.
  - Sharding can be based on a key, such as the `@id` of the `Business` or `Person`.

- **Archiving Old Data:**
  - For data that is no longer actively used, consider archiving it to a separate, cheaper storage solution.
  - For example, you might archive businesses that have been marked as `deleted` for a long time.

- **Read Replicas:**
  - For read-heavy workloads, use read replicas to distribute the read traffic across multiple database instances.

## 5. Security Considerations

- **Password Hashing:**
  - The use of `bcrypt` for password hashing is a good choice. The salt round of 12 is a reasonable default.

- **Input Validation:**
  - The use of DTOs with validation decorators is essential for preventing invalid data from being saved to the database.

- **Authentication and Authorization:**
  - The implementation of JWT for authentication and RBAC for authorization is crucial for securing the API. Ensure that the `PermissionsGuard` is correctly implemented and applied to all relevant endpoints.
