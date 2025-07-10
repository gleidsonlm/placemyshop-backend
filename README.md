# PlaceMyShop Backend API

A backend API for a SaaS platform helping liberal professionals and SMB offices manage their online presence and client interactions.

## Technology Stack

This project is built using:

- **NestJS:** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **TypeScript (Strict Mode):** We leverage TypeScript's strong typing system with strict mode enabled to ensure code quality and maintainability.
- **MVC Pattern:** The project adheres to NestJS's standard Model-View-Controller (MVC) architectural pattern.

## Project Setup

There are two main ways to set up and run the project locally:

1.  **Using Docker Compose (Recommended for ease of use and consistency)**
2.  **Manual Setup (Running Node.js and MongoDB directly on your machine)**

### 1. Running with Docker Compose

This is the recommended method as it sets up both the NestJS application and the MongoDB database in isolated containers with minimal configuration.

**Prerequisites:**
- Docker and Docker Compose installed on your system.

**Steps:**
1.  **Clone the repository (if you haven't already).**
2.  **Navigate to the project root directory.**
3.  **Start the services:**
    ```bash
    docker-compose up --build
    ```
    The `--build` flag ensures the application image is built (or rebuilt if changes are detected).
    This will start the NestJS application (accessible at `http://localhost:3000` by default) and a MongoDB instance. The application will be configured to connect to this MongoDB instance automatically. MongoDB data will be persisted in a `./mongo-data` directory in your project root.

    To run in detached mode (in the background):
    ```bash
    docker-compose up -d --build
    ```

4.  **To stop the services:**
    ```bash
    docker-compose down
    ```
    If you used `-d`, you can also use `docker-compose stop` to just stop them without removing containers.

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

## Documentation

Further documentation is in progress and will adhere to the guidelines outlined in [`AGENTS.md`](./AGENTS.md). This includes detailed schema definitions in [`docs/SCHEMA.md`](./docs/SCHEMA.md) and API endpoint documentation.

For guidelines on how AI coding agents should contribute to this project, please see [`AGENTS.md`](./AGENTS.md).

## License

This project is MIT licensed.
