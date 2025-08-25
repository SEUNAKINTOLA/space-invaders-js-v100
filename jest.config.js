/**
 * Jest Configuration for Space Invaders JS V100
 * ============================================
 * 
 * This configuration establishes the testing environment for the Space Invaders game,
 * focusing on unit, integration, and end-to-end testing capabilities.
 * 
 * Key Features:
 * - Comprehensive code coverage reporting
 * - DOM environment simulation
 * - Performance testing support
 * - Modular test organization
 * 
 * @type {import('@jest/types').Config.InitialOptions}
 */

module.exports = {
  // Test Environment Configuration
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage Configuration
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test Pattern Configuration
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.test.js',
  ],
  
  // Module Resolution
  moduleNameMapper: {
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Performance and Resource Configuration
  maxWorkers: '50%',
  timers: 'modern',
  testTimeout: 10000,
  
  // Reporting Configuration
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports/junit',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
    }],
  ],
  
  // Error Handling and Debugging
  bail: 0,
  errorOnDeprecated: true,
  
  // Module Transform Configuration
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Test Isolation and Cleanup
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
  
  // Global Setup
  globals: {
    __DEV__: true,
    CANVAS_DIMENSIONS: {
      WIDTH: 800,
      HEIGHT: 600,
    },
  },
  
  // Watch Configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Performance Monitoring
  notify: true,
  notifyMode: 'failure-change',
  
  // Custom Resolver Configuration
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Snapshot Configuration
  snapshotSerializers: [],
  snapshotFormat: {
    printBasicPrototype: false,
  },
};