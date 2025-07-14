# AI Coding Agent Guidelines

This document outlines the guidelines for using AI coding agents in the `placemyshop-backend` project.

## Intended Use

AI coding agents are intended to assist with the development of this project by:

- Generating boilerplate code.
- Implementing new features by first defining behavior with tests (Test-Driven Development).
- Writing unit, integration, and potentially end-to-end tests that precede or co-evolve with implementation code.
- Writing implementation code to make these tests pass.
- Refactoring existing code (and corresponding tests) for clarity and performance.
- Assisting with documentation.

Agents are expected to accelerate development and improve code quality by adhering to the project's standards and conventions, with a strong emphasis on test-first development.

## Project Standards

All contributions made by AI coding agents **must** adhere to the following standards:

- **Test-Driven Development (TDD):**
  - **Test-First Approach:** New features, bug fixes, and significant refactors should begin with writing tests that clearly define the expected behavior or replicate the bug.
  - **Red-Green-Refactor Cycle:** Follow the TDD cycle:
        1. **Red:** Write a test that fails because the feature or fix is not yet implemented.
        2. **Green:** Write the minimal amount of code necessary to make the test pass.
        3. **Refactor:** Improve the code (and tests if necessary) for clarity, performance, and maintainability, ensuring all tests still pass.
  - **AI Agent Role in TDD:**
    - When tasked with a new feature, agents should, where possible, generate test skeletons or initial failing tests based on the requirements.
    - If detailed test cases are provided, agents should implement code to satisfy these tests.
    - If requirements are high-level, agents should ask for clarification on testable scenarios or propose test cases.
    - All new functional code must be accompanied by corresponding tests.
  - **Test Coverage:** Aim for comprehensive test coverage. While specific percentage targets may vary, all critical paths and business logic must be tested.

- **NestJS MVC Architecture:** The project follows NestJS's opinionated Model-View-Controller (MVC) architecture. Agents must generate code that aligns with this pattern. New modules, controllers, services, and providers should follow NestJS conventions.
- **TypeScript Strict Mode:** The project uses TypeScript with strict mode enabled. Agents must generate type-safe code and leverage TypeScript's features to enhance code quality and maintainability.
- **Framework Defaults:** Unless explicitly specified otherwise, agents should always favor NestJS framework defaults and conventions. Avoid custom configurations or patterns where standard solutions exist.

## Role-Based Access Control (RBAC)

The application uses a role-based access control system to manage user permissions. The available roles are `Admin`, `Manager`, and `Assistant`. Each role has a specific set of permissions that determine what actions a user can perform.

### Permissions Matrix

| Permission | Admin | Manager | Assistant |
| --- | --- | --- | --- |
| User Role Management | ✅ | ❌ | ❌ |
| Business Details Management | ✅ | ❌ | ❌ |
| Customer Management | ✅ | ✅ | ❌ |
| Customer Chat Access (Full) | ✅ | ✅ | ❌ |
| Customer Chat Access (Read/Write) | ✅ | ✅ | ✅ |
| External Application Integration Management | ✅ | ❌ | ❌ |

## Documentation Responsibilities

AI coding agents are responsible for extending or updating documentation as features are added or changed. This includes:

- **README.md:** Any significant changes to the project's setup, build process, or core functionalities should be reflected in the `README.md`.
- **Schema Documentation:** When adding or modifying data entities, the schema documentation (e.g., in `docs/SCHEMA.md`) must be updated to reflect these changes. This includes updating JSON-LD examples and descriptions.
- **Code Comments:** Generated code should be well-commented, explaining complex logic or non-obvious decisions.
- **Caching:** When implementing caching, ensure that the cache is invalidated when data is updated or deleted.

## Commit Messages and Documentation Updates Example

Agents should follow a clear and objective style for commit messages and documentation updates.

A good commit message should clearly indicate the scope of changes, including tests.

### Example 1: Initial feature commit with tests

```text
feat: Add User Profile Endpoint

Implemented the GET /users/:id endpoint to retrieve user profile information.
Includes defining tests for user profile retrieval, service logic, and DTOs.
All tests for the new endpoint are passing.
Updated AGENTS.md and docs/SCHEMA.md to reflect the new User entity fields.
```

### Example 2: Commit for a bug fix driven by a new test*

```text
fix: Correct calculation for order total

Added a test case for orders with multiple discounted items, which previously failed.
Modified the order service to accurately calculate totals under these conditions.
All related tests now pass.
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

By following these guidelines, AI coding agents can contribute effectively and maintain the high quality standards of the `placemyshop-backend` project
