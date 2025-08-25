/**
 * @fileoverview Unit tests for the Game Loop implementation
 * Tests the core game loop functionality including timing, state updates,
 * and rendering cycles.
 */

describe('GameLoop', () => {
  let gameLoop;
  let mockUpdate;
  let mockRender;
  let mockRequestAnimationFrame;
  let mockCancelAnimationFrame;
  
  beforeEach(() => {
    // Mock RAF and CAF
    mockRequestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    mockCancelAnimationFrame = jest.fn(id => clearTimeout(id));
    
    // Attach mocks to global
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    
    // Create fresh mocks for each test
    mockUpdate = jest.fn();
    mockRender = jest.fn();
    
    // Create GameLoop instance
    gameLoop = {
      update: mockUpdate,
      render: mockRender,
      isRunning: false,
      lastTime: 0,
      start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.tick();
      },
      stop() {
        this.isRunning = false;
      },
      tick() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        
        this.update(deltaTime);
        this.render();
        
        this.lastTime = currentTime;
        requestAnimationFrame(() => this.tick());
      }
    };
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
    gameLoop.stop();
  });

  describe('Initialization', () => {
    test('should create game loop with initial state', () => {
      expect(gameLoop.isRunning).toBe(false);
      expect(gameLoop.lastTime).toBe(0);
    });
  });

  describe('Start/Stop', () => {
    test('should start the game loop', () => {
      gameLoop.start();
      expect(gameLoop.isRunning).toBe(true);
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    test('should stop the game loop', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(gameLoop.isRunning).toBe(false);
    });
  });

  describe('Update and Render Cycle', () => {
    test('should call update with delta time', done => {
      gameLoop.start();
      
      setTimeout(() => {
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockUpdate.mock.calls[0][0]).toBeGreaterThan(0);
        done();
      }, 32);
    });

    test('should call render after update', done => {
      gameLoop.start();
      
      setTimeout(() => {
        expect(mockRender).toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalledBefore(mockRender);
        done();
      }, 32);
    });

    test('should maintain consistent frame timing', done => {
      const timings = [];
      mockUpdate.mockImplementation((deltaTime) => {
        timings.push(deltaTime);
      });

      gameLoop.start();

      setTimeout(() => {
        const avgDelta = timings.reduce((a, b) => a + b, 0) / timings.length;
        expect(avgDelta).toBeCloseTo(0.016, 2); // Approximately 60 FPS
        done();
      }, 100);
    });
  });

  describe('Error Handling', () => {
    test('should continue running if update throws', done => {
      const error = new Error('Update error');
      mockUpdate.mockImplementationOnce(() => {
        throw error;
      });

      gameLoop.start();

      setTimeout(() => {
        expect(gameLoop.isRunning).toBe(true);
        expect(mockUpdate).toHaveBeenCalledTimes(2);
        done();
      }, 32);
    });

    test('should continue running if render throws', done => {
      const error = new Error('Render error');
      mockRender.mockImplementationOnce(() => {
        throw error;
      });

      gameLoop.start();

      setTimeout(() => {
        expect(gameLoop.isRunning).toBe(true);
        expect(mockRender).toHaveBeenCalledTimes(2);
        done();
      }, 32);
    });
  });

  describe('Performance', () => {
    test('should maintain target frame rate under load', done => {
      const heavyOperation = () => {
        let x = 0;
        for (let i = 0; i < 10000; i++) x += Math.random();
        return x;
      };

      mockUpdate.mockImplementation(heavyOperation);
      mockRender.mockImplementation(heavyOperation);

      gameLoop.start();

      setTimeout(() => {
        const calls = mockUpdate.mock.calls.length;
        expect(calls).toBeGreaterThanOrEqual(5); // At least 5 frames in 100ms
        done();
      }, 100);
    });
  });
});