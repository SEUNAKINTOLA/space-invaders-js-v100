/**
 * @fileoverview Test environment setup and configuration
 * This module configures the test environment with necessary mocks,
 * global utilities, and test helpers for the Space Invaders game.
 */

// Import constants from the correct relative path
// Note: Using available constants.js from src/config
import {
  CANVAS,
  PERFORMANCE,
  DEBUG
} from '../../src/config/constants.js';

// Import Performance monitor from the correct relative path
// Note: Using available Performance.js from src/utils
import PerformanceMonitor from '../../src/utils/Performance.js';

/**
 * Mock canvas context creation and methods
 * @returns {Object} Mocked canvas context
 */
const createMockContext2D = () => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'left',
  textBaseline: 'top',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  drawImage: jest.fn(),
});

/**
 * Mock HTMLCanvasElement
 */
class MockCanvas {
  constructor() {
    this.width = CANVAS.WIDTH;
    this.height = CANVAS.HEIGHT;
    this.style = {};
    this.getContext = jest.fn(() => createMockContext2D());
  }
}

/**
 * Configure test environment before all tests
 */
beforeAll(() => {
  // Mock canvas element
  global.HTMLCanvasElement = MockCanvas;
  
  // Mock window properties
  global.window = {
    ...global.window,
    devicePixelRatio: CANVAS.PIXEL_RATIO,
    requestAnimationFrame: callback => setTimeout(callback, 1000 / CANVAS.FPS),
    cancelAnimationFrame: jest.fn(),
  };

  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 0,
      jsHeapSizeLimit: PERFORMANCE.MAX_ENTITIES * 1000,
    },
  };

  // Configure performance monitoring
  PerformanceMonitor.configure({
    warningThreshold: PERFORMANCE.FRAME_TIME_WARNING,
    memoryThreshold: PERFORMANCE.MEMORY_WARNING_THRESHOLD,
    enabled: DEBUG.ENABLED,
  });
});

/**
 * Clean up test environment after all tests
 */
afterAll(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

/**
 * Reset mocks and timers before each test
 */
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

/**
 * Test utilities
 */
global.testUtils = {
  createFrameData: (deltaTime = 16.67) => ({
    deltaTime,
    timestamp: performance.now(),
    frameCount: 1,
  }),

  simulateFrames: (frameCount, frameDuration = 16.67) => {
    const frames = [];
    let timestamp = performance.now();
    
    for (let i = 0; i < frameCount; i++) {
      timestamp += frameDuration;
      frames.push({
        deltaTime: frameDuration,
        timestamp,
        frameCount: i + 1,
      });
    }
    return frames;
  },

  flushPromises: () => new Promise(resolve => setImmediate(resolve)),
};

// Export test configuration for reference
export const TEST_CONFIG = Object.freeze({
  FRAME_DURATION: 1000 / CANVAS.FPS,
  MAX_TEST_DURATION: 5000,
  ANIMATION_PRECISION: 1,
  MEMORY_THRESHOLD: PERFORMANCE.MEMORY_WARNING_THRESHOLD,
});