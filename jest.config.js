/**
 * Jest Configuration for Space Invaders JS V100
 * ============================================
 * 
 * This configuration sets up Jest testing framework with:
 * - Browser-like environment using jsdom
 * - Code coverage requirements
 * - Module resolution and transforms
 * - Test environment setup and teardown
 * - Performance monitoring for tests
 * 
 * @version 1.0.0
 * @since 2025-01-01
 */

module.exports = {
  // Test environment configuration
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/config/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module resolution
  moduleNameMapper: {
    // Handle CSS imports for testing
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    // Handle image imports for testing
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/mocks/fileMock.js',
    // Path aliases (if needed)
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test matching patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Performance and timeout settings
  testTimeout: 10000,
  maxConcurrency: 4,
  maxWorkers: '50%',

  // Verbose output for CI environments
  verbose: process.env.CI === 'true',

  // Error handling and reporting
  bail: process.env.CI === 'true' ? 1 : 0,
  errorOnDeprecated: true,

  // Watch plugin configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Snapshot configuration
  snapshotSerializers: [],
  snapshotFormat: {
    printBasicPrototype: false,
  },

  // Reporters configuration
  reporters: [
    'default',
    process.env.CI === 'true' && [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ].filter(Boolean),

  // Global variables available in all test files
  globals: {
    __DEV__: true,
    __TEST__: true,
  },
};