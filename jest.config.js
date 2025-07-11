module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Set test environment to node for NestJS applications
  testEnvironment: 'node',
  
  // File extensions Jest should recognize
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Root directory for tests
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts'
  ],
  
  // Transform configuration for TypeScript files
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  
  // Handle module resolution for NestJS
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Setup files for tests
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
  
  // Test timeout configuration
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output for better debugging
  verbose: true,
  
  // Handle module resolution for NestJS
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles to help with debugging hanging tests
  detectOpenHandles: true,
};