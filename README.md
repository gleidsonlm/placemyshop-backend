# PlaceMyShop Backend API

A backend API for a SaaS platform helping liberal professionals and SMB offices manage their online presence and client interactions.

## Technology Stack

This project is built using:

- **NestJS:** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **TypeScript (Strict Mode):** We leverage TypeScript's strong typing system with strict mode enabled to ensure code quality and maintainability.
- **MVC Pattern:** The project adheres to NestJS's standard Model-View-Controller (MVC) architectural pattern.
- **Test-Driven Development (TDD):** Development practices emphasize writing tests first to ensure code quality, maintainability, and clear specifications. (See `AGENTS.md` for more details on TDD guidelines).

## Project Setup

There are two main ways to set up and run the project locally:

1.  **Using Docker Compose (Recommended for ease of use and consistency)**
2.  **Manual Setup (Running Node.js and MongoDB directly on your machine)**

### 1. Running with Docker Compose

This is the recommended method as it sets up both the NestJS application and the MongoDB database in isolated containers with minimal configuration.

**Prerequisites:**
- Docker and Docker Compose installed on your system.

A `Dockerfile` is included in the project root to define the build steps for the NestJS application image. The `docker-compose.yml` configuration uses this `Dockerfile` to build the application service. It's designed with multi-stage builds to provide an optimized image for production while supporting development needs.

**Steps:**
1.  **Clone the repository (if you haven't already).**
2.  **Navigate to the project root directory.**
3.  **Create and start the services (first time or after changes):**
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

4.  **Starting existing stopped containers:**
    If the containers have been created previously and are just stopped, you can restart them with:
    ```bash
    docker compose start
    ```

5.  **Stopping the services:**
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
1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    This project requires a MongoDB database if run manually. Connection details are managed through a `.env` file.
    - Create a `.env` file in the root of the project. You can copy the `.env.example` file as a template:
      ```bash
      cp .env.example .env
      ```
    - Modify the `.env` file with your MongoDB connection string. For a local MongoDB instance, this is typically:
      ```
      MONGODB_URI=mongodb://localhost:27017/placemyshop
      ```
      Ensure your MongoDB server is running and accessible at this URI.

3.  **Compile and Run the Project:**
    You can compile and run the project in different modes:

    -   **Development Mode (with hot-reloading):**
        ```bash
        npm run start:dev
        ```
    -   **Production Mode:**
        ```bash
        npm run build
        npm run start:prod
        ```
    -   **Watch Mode (Compiles on change):**
        ```bash
        npm run start
        ```

### Initial Data Seeding

Upon application startup, the system automatically seeds essential data if it's not already present. Currently, this includes:

-   **Default User Roles:** Admin, Manager, and Assistant roles with their predefined permissions are created in the database. This process is idempotent and will not create duplicate roles if they already exist.

This ensures that the application has the necessary foundational data to operate correctly from the first run.

## Running Tests

To run the test suites:

-   **Unit Tests:**
    ```bash
    $ npm run test
    ```
-   **End-to-End (E2E) Tests:**
    ```bash
    $ npm run test:e2e
    ```
-   **Test Coverage:**
    ```bash
    $ npm run test:cov
    ```

These tests are integral to our development process. We follow Test-Driven Development (TDD) principles, meaning tests are typically written before or alongside the implementation code. See `AGENTS.md` for detailed TDD guidelines.

## Documentation

Further documentation is in progress and will adhere to the guidelines outlined in [`AGENTS.md`](./AGENTS.md). This includes detailed schema definitions in [`docs/SCHEMA.md`](./docs/SCHEMA.md) and API endpoint documentation.

For guidelines on how AI coding agents should contribute to this project, please see [`AGENTS.md`](./AGENTS.md).

## License

This project is licensed under the GNU Affero General Public License, version 3 (AGPL-3.0).

The full text of the license can be found in the `LICENSE` file.

**Implications for Users and Contributors:**

*   **If you use this software over a network (e.g., as a service provider), you must make the source code available to the users of the service.** This is the main difference from the standard GPL.
*   Any modifications you make to the software must also be licensed under the AGPL-3.0.
*   If you contribute to this project, your contributions will be licensed under the AGPL-3.0.
