# AI Coding Agent Guidelines

This document outlines the guidelines for using AI coding agents in the `placemyshop-backend` project.

## Intended Use

AI coding agents are intended to assist with the development of this project by:

- Generating boilerplate code.
- Implementing new features based on detailed specifications.
- Writing unit and integration tests.
- Refactoring existing code for clarity and performance.
- Assisting with documentation.

Agents are expected to accelerate development and improve code quality by adhering to the project's standards and conventions.

## Project Standards

All contributions made by AI coding agents **must** adhere to the following standards:

- **NestJS MVC Architecture:** The project follows NestJS's opinionated Model-View-Controller (MVC) architecture. Agents must generate code that aligns with this pattern. New modules, controllers, services, and providers should follow NestJS conventions.
- **TypeScript Strict Mode:** The project uses TypeScript with strict mode enabled. Agents must generate type-safe code and leverage TypeScript's features to enhance code quality and maintainability.
- **Framework Defaults:** Unless explicitly specified otherwise, agents should always favor NestJS framework defaults and conventions. Avoid custom configurations or patterns where standard solutions exist.

## Documentation Responsibilities

AI coding agents are responsible for extending or updating documentation as features are added or changed. This includes:

- **README.md:** Any significant changes to the project's setup, build process, or core functionalities should be reflected in the `README.md`.
- **Schema Documentation:** When adding or modifying data entities, the schema documentation (e.g., in `docs/SCHEMA.md`) must be updated to reflect these changes. This includes updating JSON-LD examples and descriptions.
- **Code Comments:** Generated code should be well-commented, explaining complex logic or non-obvious decisions.

## Commit Messages and Documentation Updates Example

Agents should follow a clear and objective style for commit messages and documentation updates.

**Commit Message Example:**

```
feat: Add User Profile Endpoint

Implemented the GET /users/:id endpoint to retrieve user profile information.
Includes service logic, DTOs, and unit tests.
Updated AGENTS.md and docs/SCHEMA.md to reflect the new User entity fields.
```

**Documentation Update Example (in `docs/SCHEMA.md`):**

```json
{
  "@context": "http://schema.org/",
  "@type": "User",
  "name": "User",
  "description": "Represents a user of the platform.",
  "properties": {
    "id": {
      "@type": "Text",
      "description": "Unique identifier for the user."
    },
    "email": {
      "@type": "Text",
      "description": "User's email address."
    },
    "newlyAddedField": {
      "@type": "Text",
      "description": "Description of the new field added by the agent."
    }
  }
}
```

By following these guidelines, AI coding agents can contribute effectively and maintain the high quality standards of the `placemyshop-backend` project.
