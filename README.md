# PlaceMyShop Backend API

A backend API for a SaaS platform helping liberal professionals and SMB offices manage their online presence and client interactions.

## Technology Stack

This project is built using:

- **NestJS:** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **TypeScript (Strict Mode):** We leverage TypeScript's strong typing system with strict mode enabled to ensure code quality and maintainability.
- **MVC Pattern:** The project adheres to NestJS's standard Model-View-Controller (MVC) architectural pattern.
- **Test-Driven Development (TDD):** Development practices emphasize writing tests first to ensure code quality, maintainability, and clear specifications. (See `AGENTS.md` for more details on TDD guidelines).
- **MongoDB:** A NoSQL database for storing application data.
- **Mongoose:** An ODM for MongoDB, providing a schema-based solution to model application data.
- **JSON-LD & schema.org:** We use JSON-LD and schema.org vocabularies to structure our data, making it more discoverable and interoperable.

## Project Setup

There are two main ways to set up and run the project locally:

1. **Using Docker Compose (Recommended for ease of use and consistency)**
2. **Manual Setup (Running Node.js and MongoDB directly on your machine)**

### 1. Running with Docker Compose

This is the recommended method as it sets up both the NestJS application and the MongoDB database in isolated containers with minimal configuration.

**Prerequisites:**

- Docker and Docker Compose installed on your system.

A `Dockerfile` is included in the project root to define the build steps for the NestJS application image. The `docker-compose.yml` configuration uses this `Dockerfile` to build the application service. It's designed with multi-stage builds to provide an optimized image for production while supporting development needs.

**Steps:**

1. **Clone the repository (if you haven't already).**
2. **Navigate to the project root directory.**
3. **Create and start the services (first time or after changes):**

    ```bash
    docker compose up --build
    ```

    (Note: If you have an older Docker Compose version, you might need `docker-compose up --build` with a hyphen.)

    The `--build` flag ensures the application Docker image is built (or rebuilt if your `Dockerfile` or application code changes). This command will:
    - Create and start the NestJS application container.
    - Create and start the MongoDB container.
    - The application will be accessible at `http://localhost:3000` by default.
    - MongoDB data will be persisted in a `./mongo-data` directory in your project root.

    To run in detached mode (in the background):

    ```bash
    docker compose up -d --build
    ```

4. **Starting existing stopped containers:**
    If the containers have been created previously and are just stopped, you can restart them with:

    ```bash
    docker compose start
    ```

5. **Stopping the services:**
    To stop the services running in the foreground, press `Ctrl+C`.
    If running in detached mode (or to stop and remove containers):

    ```bash
    docker compose down
    ```

    To just stop services without removing containers (if they were started with `up -d`):

    ```bash
    docker compose stop
    ```

**Environment Variables with Docker Compose:**

- The `MONGODB_URI` for the application service is set directly in the `docker-compose.yml` file to `mongodb://mongodb:27017/placemyshop`. This allows the application container to connect to the MongoDB container using Docker's internal networking.
- Other environment variables needed by the application can also be added to the `environment` section of the `app` service in `docker-compose.yml`.

### 2. Manual Local Setup

**Prerequisites:**

- Node.js (version as specified in `.nvmrc` or a recent LTS version).
- npm (usually comes with Node.js).
- A running MongoDB instance.

**Steps:**

1. **Install Dependencies:**

    ```bash
    npm install
    ```

2. **Set Up Environment Variables:**
    This project requires a MongoDB database if run manually. Connection details are managed through a `.env` file.
    - Create a `.env` file in the root of the project. You can copy the `.env.example` file as a template:

      ```bash
      cp .env.example .env
      ```

    - Modify the `.env` file with your MongoDB connection string. For a local MongoDB instance, this is typically:

      ```bash
      MONGODB_URI=mongodb://localhost:27017/placemyshop
      ```

      Ensure your MongoDB server is running and accessible at this URI.

3. **Compile and Run the Project:**
    You can compile and run the project in different modes:

    - **Development Mode (with hot-reloading):**

        ```bash
        npm run start:dev
        ```

    - **Production Mode:**

        ```bash
        npm run build
        npm run start:prod
        ```

    - **Watch Mode (Compiles on change):**

        ```bash
        npm run start
        ```

### Initial Data Seeding

Upon application startup, the system automatically seeds essential data if it's not already present. Currently, this includes:

- **Default User Roles:** Admin, Manager, and Assistant roles with their predefined permissions are created in the database. If no permissions are provided when creating a role, default permissions will be assigned based on the role name. This process is idempotent and will not create duplicate roles if they already exist.
- **Default Admin User:** An admin user is created with the email `admin@placemyshop.com` and a secure password.
  - The password is hashed using bcrypt before storage.
  - This user is assigned the Admin role automatically.

- **Founder Validation:** When creating a new business, the system validates that the provided `founderId` corresponds to an existing user.

## Data Schema

The application uses a core data schema based on schema.org vocabularies to ensure data is structured and interoperable. The main entities are:

- **Person (User):** Represents a user of the platform, aligned with `schema.org/Person`.
- **Role:** Defines user roles and permissions.
- **Business:** Represents a business, aligned with `schema.org/LocalBusiness`.

For detailed schema definitions and JSON-LD examples, see `docs/SCHEMA.md`.

## Features

- **Soft Deletes:** The application supports soft deletes for users, roles, and businesses. Deleted entities are marked with an `isDeleted` flag instead of being removed from the database. This allows for data recovery and auditing.

- **Caching:** The application implements in-memory caching for frequently accessed data, such as user lists and roles, to improve performance. This is done using the `@Cacheable` decorator from NestJS.

- **Validation:** The application uses class-validator and class-transformer for DTO validation, ensuring that incoming requests meet the expected structure and types.

## Testing

These tests are integral to our development process. We follow Test-Driven Development (TDD) principles, meaning tests are typically written before or alongside the implementation code. See `AGENTS.md` for detailed TDD guidelines.

This project uses Jest for testing with TypeScript support. The test configuration is designed to work with Node.js/npm.

### Running Tests

```bash
# Run all unit tests (excludes schema tests that require MongoDB)
npm run test:unit

# Run all tests (includes schema tests if MongoDB Memory Server is available)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests (requires MongoDB connection)
npm run test:e2e
```

### Test Structure

- **Unit Tests:** DTO validation, service logic, controller behavior (160 tests)
- **Schema Tests:** Mongoose schema validation and transformation (21 tests, requires MongoDB Memory Server)
- **E2E Tests:** Full application integration tests

### MongoDB Memory Server

Schema tests use MongoDB Memory Server for isolated testing. These tests are automatically skipped in environments where MongoDB Memory Server cannot download required binaries (such as restricted CI/CD environments). In such cases, you'll see:

```
Test Suites: 3 skipped, 21 passed, 21 of 24 total
Tests:       21 skipped, 160 passed, 181 total
```

To force MongoDB-dependent tests to run in CI environments, set the environment variable:
```bash
ALLOW_MONGO_DOWNLOAD=true npm test
```

## Documentation

### API Documentation

The PlaceMyShop Backend provides comprehensive API documentation:

- **Interactive Documentation**: Visit <http://localhost:3000/api/docs> for the Swagger UI
  - Test endpoints directly in your browser
  - View request/response schemas
  - Authenticate and test protected routes
  
- **API Usage Guide**: [`docs/API_USAGE_GUIDE.md`](./docs/API_USAGE_GUIDE.md) - Complete guide with cURL examples
  - Authentication workflows
  - CRUD operations for all endpoints
  - Common workflows and troubleshooting
  - Best practices and security guidelines

### Schema Documentation

- **Data Models**: [`docs/SCHEMA.md`](./docs/SCHEMA.md) - Detailed schema definitions using JSON-LD format

### AI Coding Agent Guidelines

For guidelines on how AI coding agents should contribute to this project:

- **General AI Agent Guidelines:** [`AGENTS.md`](./AGENTS.md) - Contains project standards, TDD practices, and general AI agent responsibilities
- **GitHub Copilot Pro Guidelines:** [`COPILOT_AGENTS.md`](./COPILOT_AGENTS.md) - Specific guidance for using GitHub Copilot Pro effectively with our NestJS/TypeScript/MongoDB stack

## License

This project is licensed under the GNU Affero General Public License, version 3 (AGPL-3.0).

The full text of the license can be found in the `LICENSE` file.

**Implications for Users and Contributors:**

*   **If you use this software over a network (e.g., as a service provider), you must make the source code available to the users of the service.** This is the main difference from the standard GPL.
*   Any modifications you make to the software must also be licensed under the AGPL-3.0.
*   If you contribute to this project, your contributions will be licensed under the AGPL-3.0.

## API Overview

The PlaceMyShop Backend provides a comprehensive REST API for managing users, roles, and businesses:

### Core Endpoints

- **Authentication**: `/auth` - Login, logout, token refresh, user profile
- **Users**: `/users` - User management with role-based access
- **Roles**: `/roles` - Role and permission management
- **Businesses**: `/businesses` - Business profile management

### Key Features

- **JWT Authentication** with refresh tokens
- **Role-based access control** with granular permissions
- **Comprehensive validation** and error handling
- **Pagination** support for list endpoints
- **Soft delete** functionality with restore capabilities
- **In-memory caching** for frequently accessed data
- **RESTful API design** following best practices
- **Interactive API documentation** with Swagger/OpenAPI

### Quick Start

1. Start the application (see setup instructions above)
2. Visit <http://localhost:3000/api/docs> for interactive documentation
3. Use the login endpoint to authenticate and get JWT tokens
4. Explore the API using the Swagger UI or cURL examples in the usage guide

For detailed examples and workflows, see [`docs/API_USAGE_GUIDE.md`](./docs/API_USAGE_GUIDE.md).