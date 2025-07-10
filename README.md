# PlaceMyShop Backend API

A backend API for a SaaS platform helping liberal professionals and SMB offices manage their online presence and client interactions.

## Technology Stack

This project is built using:

- **NestJS:** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **TypeScript (Strict Mode):** We leverage TypeScript's strong typing system with strict mode enabled to ensure code quality and maintainability.
- **MVC Pattern:** The project adheres to NestJS's standard Model-View-Controller (MVC) architectural pattern.

## Project Setup

To get the project running locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    $ npm install
    ```

2.  **Set Up Environment Variables:**
    This project requires a MongoDB database. Connection details are managed through environment variables.
    - Create a `.env` file in the root of the project. You can copy the `.env.example` file as a template:
      ```bash
      $ cp .env.example .env
      ```
    - Modify the `.env` file with your MongoDB connection string:
      ```
      MONGODB_URI=your_mongodb_connection_string
      ```
      For example: `MONGODB_URI=mongodb://localhost:27017/placemyshop`

## Compile and Run the Project

You can compile and run the project in different modes:

-   **Development Mode:**
    ```bash
    # Serves the application with hot-reloading
    $ npm run start:dev
    ```
-   **Production Mode:**
    ```bash
    # Builds the application for production
    $ npm run build
    # Runs the production build
    $ npm run start:prod
    ```
-   **Watch Mode (Compiles on change):**
    ```bash
    $ npm run start
    ```

## Run Tests

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
