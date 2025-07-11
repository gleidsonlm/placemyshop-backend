# Bun Test Configuration

Bun test runner is not compatible with Jest syntax. For testing with Bun:

1. **Use npm test for Jest tests** (recommended for now)
2. **Use Bun for build and development** but npm for testing

## Alternative: Convert tests to Bun format

To make tests compatible with Bun, we would need to:
- Replace `jest.mock()` with Bun's mock system
- Replace `jest.fn()` with Bun's mock functions  
- Update Jest expect syntax to Bun's expect syntax
- Modify test setup and teardown

## Current Recommendation

For this project, use:
- `npm test` - for running tests (Jest with TypeScript)
- `bun run build` - for building the application
- `bun run start:dev` - for development

This provides the best compatibility with the existing NestJS testing ecosystem.