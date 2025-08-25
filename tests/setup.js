/**
 * @fileoverview Test environment setup and configuration for Space Invaders JS
 * This module initializes the test environment, sets up mocks, and provides
 * test utilities for the entire test suite.
 * 
 * @module tests/setup
 * @requires none - uses only native browser APIs and test framework globals
 */

// Global test environment configuration
const TEST_CANVAS_DIMENSIONS = {
  width: 800,
  height: 600
};

/**
 * Mock canvas and context implementation for testing
 * @type {Object}
 */
class MockCanvasContext {
  constructor() {
    this.calls = [];
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    
    // Track all method calls for assertions
    const methods = [
      'fillRect', 'clearRect', 'drawImage', 'beginPath',
      'moveTo', 'lineTo', 'stroke', 'fill'
    ];
    
    methods.forEach(method => {
      this[method] = (...args) => {
        this.calls.push({ method, args });
      };
    });
  }

  /**
   * Reset the mock state
   */
  reset() {
    this.calls = [];
  }
}

/**
 * Mock canvas element for testing
 * @type {Object}
 */
class MockCanvas {
  constructor() {
    this.width = TEST_CANVAS_DIMENSIONS.width;
    this.height = TEST_CANVAS_DIMENSIONS.height;
    this.context = new MockCanvasContext();
  }

  /**
   * Get 2D rendering context
   * @returns {MockCanvasContext}
   */
  getContext(contextType) {
    if (contextType !== '2d') {
      throw new Error('Only 2d context is supported in tests');
    }
    return this.context;
  }
}

/**
 * Mock RequestAnimationFrame for game loop testing
 */
const setupRAFMock = () => {
  let lastTime = 0;
  
  global.requestAnimationFrame = (callback) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    return setTimeout(() => {
      callback(currentTime);
    }, 1000 / 60); // Simulate 60 FPS
  };

  global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
};

/**
 * Mock audio context and related APIs
 */
class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.destination = {};
  }

  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {} },
      connect: () => {}
    };
  }

  createOscillator() {
    return {
      frequency: { value: 440 },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
}

/**
 * Setup test environment before running tests
 */
beforeAll(() => {
  // Setup DOM environment
  global.document = {
    createElement: (type) => {
      if (type === 'canvas') {
        return new MockCanvas();
      }
      return {};
    }
  };

  global.window = {
    innerWidth: TEST_CANVAS_DIMENSIONS.width,
    innerHeight: TEST_CANVAS_DIMENSIONS.height,
    AudioContext: MockAudioContext
  };

  // Setup animation frame mock
  setupRAFMock();

  // Setup performance measurement
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {}
  };
});

/**
 * Cleanup test environment after tests
 */
afterAll(() => {
  delete global.document;
  delete global.window;
  delete global.requestAnimationFrame;
  delete global.cancelAnimationFrame;
  delete global.performance;
});

/**
 * Reset mocks between tests
 */
afterEach(() => {
  // Clear all mock calls and reset state
  if (document.createElement('canvas').context) {
    document.createElement('canvas').context.reset();
  }
});

/**
 * Test utilities for common assertions
 */
global.testUtils = {
  /**
   * Create a new mock canvas for testing
   * @returns {MockCanvas}
   */
  createMockCanvas() {
    return new MockCanvas();
  },

  /**
   * Wait for the next animation frame
   * @returns {Promise}
   */
  waitForNextFrame() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  },

  /**
   * Simulate a game tick with specified delta time
   * @param {number} deltaTime - Time elapsed since last tick in ms
   * @returns {Promise}
   */
  async simulateGameTick(deltaTime = 16.67) {
    await this.waitForNextFrame();
    return deltaTime;
  }
};

// Export test configuration for reference in tests
module.exports = {
  TEST_CANVAS_DIMENSIONS,
  MockCanvas,
  MockCanvasContext,
  MockAudioContext
};