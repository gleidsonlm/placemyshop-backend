# GitHub Copilot Pro Guidelines for PlaceMyShop Backend

This document provides specific guidance for using GitHub Copilot Pro coding agents effectively within the `placemyshop-backend` project. It builds upon our existing AI agent guidelines in `AGENTS.md` with Copilot Pro-specific best practices and examples.

## Overview

GitHub Copilot Pro is a powerful AI pair programmer that can significantly accelerate development when used effectively with our NestJS/TypeScript/MongoDB stack. This guide focuses on prompt engineering, best practices, and troubleshooting specific to our project architecture.

## Effective Prompt Engineering for Our Stack

### 1. Context-Aware Prompting

Always provide sufficient context about our technology stack and project conventions:

**Good Prompt Example:**
```
// Generate a NestJS controller for managing Person entities
// Stack: NestJS, TypeScript, MongoDB with Mongoose
// Project uses JSON-LD schema.org conventions
// Follow existing patterns in src/roles/ and src/businesses/
// Include proper validation, error handling, and OpenAPI decorators
```

**Avoid Generic Prompts:**
```
// Create a user controller  // Too generic, lacks context
```

### 2. Schema-Specific Prompts

Leverage our JSON-LD schema documentation for consistent entity handling:

**Prompt for Schema-Aligned DTOs:**
```
// Create UpdatePersonDto following our JSON-LD Person schema
// Reference: docs/SCHEMA.md Person section
// Include @ApiProperty decorators for Swagger
// Use class-validator decorators consistent with CreatePersonDto
// Fields: givenName, familyName, email, telephone, status
```

### 3. Test-Driven Development Prompts

Always prompt for tests first, following our TDD approach:

**TDD Prompt Pattern:**
```
// Generate failing tests for PersonController CRUD operations
// Test framework: Jest with @nestjs/testing
// Include: unit tests for service methods, controller endpoints
// Mock dependencies: PersonModel, RoleModel
// Follow patterns in src/roles/role-seeding.service.spec.ts
// Test scenarios: success cases, validation errors, not found errors
```

## Technology Stack-Specific Examples

### NestJS Module Creation

**Prompt for Complete Module Setup:**
```
// Create complete NestJS authentication module
// Include: module, service, controller, guards, strategies
// Dependencies: @nestjs/passport, passport-jwt, passport-local
// Follow NestJS best practices for module organization
// Export services for use in other modules
```

### MongoDB Schema with Mongoose

**Prompt for Schema Creation:**
```
// Create Mongoose schema for Customer entity
// Follow existing patterns in src/users/schemas/person.schema.ts
// Include: JSON-LD @id field, timestamps, soft delete methods
// Reference fields: business (ObjectId), status enum
// Add proper indexes and validation
```

### API Endpoint Development

**Prompt for RESTful Controller:**
```
// Create RESTful PersonController with full CRUD operations
// Endpoints: GET /persons, GET /persons/:id, POST /persons, PUT /persons/:id, DELETE /persons/:id
// Include: validation pipes, OpenAPI decorators, error handling
// Use PersonService for business logic
// Follow existing controller patterns in the project
```

## Authentication and Security Prompts

### JWT Implementation

**Prompt for JWT Strategy:**
```
// Create JWT strategy for NestJS Passport authentication
// Use environment variables for secret key
// Include user payload with id, email, role information
// Validate token expiration and signature
// Follow NestJS Passport documentation patterns
```

### Password Security

**Prompt for Password Handling:**
```
// Create password hashing service using bcrypt
// Include: hash password method, compare password method
// Use appropriate salt rounds (12 for production)
// Integrate with Person schema passwordHash field
// Add proper error handling
```

## Database Integration Prompts

### Service Layer

**Prompt for Database Service:**
```
// Create PersonService with CRUD operations
// Use Mongoose Model injection: @InjectModel(Person.name)
// Include: findAll with pagination, findById, create, update, softDelete
// Handle population of role field for JSON-LD output
// Add proper error handling and logging
```

### Data Validation

**Prompt for DTO Validation:**
```
// Create validation DTOs for Person entity
// Use class-validator decorators: @IsEmail, @IsUUID, @IsEnum
// Include @ApiProperty for OpenAPI documentation
// Follow patterns in src/roles/dto/ and src/businesses/dto/
// Handle optional fields and nested objects
```

## Testing Prompts

### Unit Testing

**Prompt for Service Tests:**
```
// Create comprehensive unit tests for PersonService
// Mock Mongoose model using Jest mocks
// Test scenarios: successful operations, database errors, validation failures
// Use TestingModule for dependency injection
// Follow patterns in src/roles/role-seeding.service.spec.ts
```

### Integration Testing

**Prompt for Controller Tests:**
```
// Create integration tests for PersonController
// Use @nestjs/testing with TestingModule
// Mock PersonService dependencies
// Test HTTP responses, status codes, request/response bodies
// Include authentication testing with JWT guards
```

## OpenAPI/Swagger Documentation Prompts

### API Documentation

**Prompt for Swagger Decorators:**
```
// Add OpenAPI decorators to PersonController
// Include: @ApiTags, @ApiOperation, @ApiResponse for each endpoint
// Document request/response schemas with examples
// Add authentication requirements with @ApiBearerAuth
// Follow OpenAPI 3.0 best practices
```

### Schema Documentation

**Prompt for DTO Documentation:**
```
// Add @ApiProperty decorators to PersonDto
// Include: description, example values, validation rules
// Document nested objects and arrays
// Add proper type definitions for OpenAPI generation
```

## Common Patterns and Conventions

### File Naming and Structure

When prompting for new files, specify our naming conventions:

```
// Create files following our conventions:
// Controllers: person.controller.ts
// Services: person.service.ts
// DTOs: create-person.dto.ts, update-person.dto.ts
// Schemas: person.schema.ts
// Tests: *.spec.ts for all test files
```

### Import Statements

**Prompt for Proper Imports:**
```
// Include proper import statements:
// NestJS: from '@nestjs/common', '@nestjs/mongoose'
// Validation: from 'class-validator', 'class-transformer'
// Types: from 'mongoose', relative schema imports
// Follow existing import patterns in the project
```

## Troubleshooting Common Copilot Issues

### 1. Context Window Limitations

**Problem:** Copilot suggests code that doesn't align with project patterns.

**Solution:** 
- Keep relevant files open in your editor
- Reference specific files in prompts: "Follow patterns in src/roles/roles.module.ts"
- Break complex requests into smaller, focused prompts

### 2. Outdated Dependencies

**Problem:** Copilot suggests outdated NestJS or MongoDB patterns.

**Solution:**
- Specify versions in prompts: "NestJS v11, Mongoose v8"
- Reference our package.json dependencies
- Use "modern" and "latest" keywords in prompts

### 3. TypeScript Strict Mode Issues

**Problem:** Generated code doesn't pass TypeScript strict mode checks.

**Solution:**
- Specify "TypeScript strict mode" in prompts
- Request explicit type annotations
- Ask for null/undefined handling

### 4. Test Framework Confusion

**Problem:** Copilot mixes Jest and other testing frameworks.

**Solution:**
- Always specify "Jest testing framework" in prompts
- Reference existing test files for patterns
- Request @nestjs/testing module usage

## Advanced Copilot Features

### 1. Multi-File Generation

Use Copilot for generating related files together:

```
// Generate complete Person feature:
// 1. person.controller.ts - RESTful controller
// 2. person.service.ts - business logic service  
// 3. person.controller.spec.ts - controller tests
// 4. person.service.spec.ts - service tests
// Follow existing patterns and maintain consistency
```

### 2. Code Refactoring

**Prompt for Refactoring:**
```
// Refactor this controller to follow our error handling patterns
// Add proper HTTP status codes and error responses
// Include logging with NestJS Logger
// Maintain backward compatibility
```

### 3. Performance Optimization

**Prompt for Performance:**
```
// Optimize this MongoDB query for better performance
// Add appropriate indexes and query optimization
// Consider pagination for large result sets
// Include performance monitoring
```

## Integration with Development Workflow

### 1. Before Code Generation

- Review existing similar implementations
- Check our schema documentation (docs/SCHEMA.md)
- Verify current test patterns
- Ensure dependencies are up to date

### 2. After Code Generation

- Run linting: `npm run lint`
- Execute tests: `npm run test:unit`
- Build project: `npm run build`
- Review generated code for our conventions

### 3. Code Review Checklist

Use this checklist when reviewing Copilot-generated code:

- [ ] Follows NestJS conventions and best practices
- [ ] Includes proper TypeScript types and strict mode compliance
- [ ] Has comprehensive test coverage
- [ ] Uses our JSON-LD schema patterns
- [ ] Includes proper error handling and validation
- [ ] Has OpenAPI/Swagger documentation
- [ ] Follows our file naming and structure conventions
- [ ] Integrates properly with existing modules

## Best Practices Summary

1. **Be Specific:** Always include context about our tech stack and patterns
2. **Reference Examples:** Point to existing files for consistency
3. **Test First:** Generate tests before implementation code
4. **Validate Output:** Always review and test generated code
5. **Iterate:** Use follow-up prompts to refine generated code
6. **Document:** Ensure generated code includes proper documentation

## Example Workflow: Adding a New Feature

Here's a complete workflow for adding a new "Customer" entity using Copilot Pro:

```
1. Generate schema tests first:
   "Create failing tests for Customer mongoose schema, follow person.schema.spec.ts patterns"

2. Create the schema:
   "Generate Customer schema following Person schema patterns, include business reference"

3. Create DTOs with tests:
   "Generate Customer DTOs with validation tests, follow existing DTO patterns"

4. Create service with tests:
   "Generate CustomerService with full CRUD and comprehensive tests"

5. Create controller with tests:
   "Generate CustomerController with RESTful endpoints and integration tests"

6. Add OpenAPI documentation:
   "Add complete Swagger/OpenAPI documentation to Customer controller and DTOs"

7. Update module:
   "Update CustomerModule to include all providers and exports"
```

This systematic approach ensures consistency with our existing codebase and maintains high code quality standards.

---

By following these guidelines, you'll be able to leverage GitHub Copilot Pro effectively while maintaining the high standards and consistency required for the PlaceMyShop backend project.