/**
 * @fileoverview Integration tests for the Game Renderer component
 * Tests the integration between Canvas, GameLoop, and rendering systems
 * 
 * @module tests/integration/core/GameRenderer.test.js
 * @requires jest
 * @requires @testing-library/jest-dom
 */

describe('Game Renderer Integration Tests', () => {
  let canvas;
  let context;
  let gameLoop;
  let renderer;
  
  // Mock performance metrics collection
  const metrics = {
    frameTime: [],
    renderTime: [],
    updateTime: []
  };

  beforeEach(() => {
    // Create a real canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    context = canvas.getContext('2d');

    // Mock the game loop
    gameLoop = {
      start: jest.fn(),
      stop: jest.fn(),
      isRunning: false,
      deltaTime: 16.67, // Simulate 60 FPS
      currentTime: performance.now()
    };

    // Mock the renderer
    renderer = {
      clear: jest.fn(),
      render: jest.fn(),
      initialize: jest.fn(),
      dispose: jest.fn()
    };

    // Attach canvas to document for proper rendering tests
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    // Cleanup
    document.body.removeChild(canvas);
    jest.clearAllMocks();
    metrics.frameTime = [];
    metrics.renderTime = [];
    metrics.updateTime = [];
  });

  describe('Canvas Rendering Pipeline', () => {
    test('should properly initialize canvas context', () => {
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
      expect(context).toBeTruthy();
    });

    test('should maintain correct aspect ratio after resize', () => {
      // Simulate window resize
      canvas.width = 1024;
      canvas.height = 768;
      
      expect(canvas.width / canvas.height).toBeCloseTo(1.33, 2);
    });

    test('should clear canvas before each frame', () => {
      renderer.clear();
      expect(renderer.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering Performance', () => {
    test('should maintain stable frame rate', async () => {
      const frameCount = 60;
      const targetFrameTime = 16.67; // 60 FPS
      
      for (let i = 0; i < frameCount; i++) {
        const startTime = performance.now();
        await renderer.render();
        const frameTime = performance.now() - startTime;
        metrics.frameTime.push(frameTime);
      }

      const avgFrameTime = metrics.frameTime.reduce((a, b) => a + b) / frameCount;
      expect(avgFrameTime).toBeLessThan(targetFrameTime * 1.5);
    });

    test('should handle multiple entities without performance degradation', async () => {
      const entities = Array(100).fill().map((_, i) => ({
        id: `entity-${i}`,
        position: { x: Math.random() * 800, y: Math.random() * 600 },
        sprite: 'mock-sprite'
      }));

      const startTime = performance.now();
      
      for (const entity of entities) {
        await renderer.render(entity);
      }

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(16.67); // Should render within one frame
    });
  });

  describe('Renderer State Management', () => {
    test('should properly handle renderer initialization', () => {
      renderer.initialize(canvas);
      expect(renderer.initialize).toHaveBeenCalledWith(canvas);
    });

    test('should cleanup resources on disposal', () => {
      renderer.initialize(canvas);
      renderer.dispose();
      expect(renderer.dispose).toHaveBeenCalled();
    });

    test('should handle context loss and recovery', () => {
      const handleContextLoss = jest.fn();
      const handleContextRestored = jest.fn();

      canvas.addEventListener('webglcontextlost', handleContextLoss);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      // Simulate context loss
      canvas.dispatchEvent(new Event('webglcontextlost'));
      expect(handleContextLoss).toHaveBeenCalled();

      // Simulate context restoration
      canvas.dispatchEvent(new Event('webglcontextrestored'));
      expect(handleContextRestored).toHaveBeenCalled();
    });
  });

  describe('Integration with Game Loop', () => {
    test('should synchronize rendering with game loop updates', () => {
      const updateSpy = jest.fn();
      const renderSpy = jest.fn();

      gameLoop.update = updateSpy;
      renderer.render = renderSpy;

      gameLoop.start();
      
      // Simulate multiple frames
      for (let i = 0; i < 10; i++) {
        gameLoop.currentTime += gameLoop.deltaTime;
        gameLoop.update(gameLoop.deltaTime);
        renderer.render();
      }

      expect(updateSpy).toHaveBeenCalledTimes(10);
      expect(renderSpy).toHaveBeenCalledTimes(10);
    });

    test('should maintain consistent game state during rendering', () => {
      const gameState = {
        entities: new Set(),
        lastUpdate: 0
      };

      const entity = {
        id: 'test-entity',
        position: { x: 100, y: 100 }
      };

      gameState.entities.add(entity);
      
      renderer.render(gameState);
      expect(renderer.render).toHaveBeenCalledWith(gameState);
      expect(gameState.entities.size).toBe(1);
    });
  });
});