/**
 * @fileoverview Unit tests for the Renderer component of Space Invaders
 * Tests the core rendering functionality, canvas management, and performance
 * 
 * @requires jest
 * @requires canvas
 */

describe('Renderer', () => {
  let renderer;
  let mockCanvas;
  let mockContext;
  let mockEntityManager;
  let perfMetrics;

  beforeEach(() => {
    // Setup mock canvas and context
    mockContext = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn()
    };

    mockCanvas = {
      getContext: jest.fn(() => mockContext),
      width: 800,
      height: 600
    };

    // Mock entity manager
    mockEntityManager = {
      getEntities: jest.fn(() => []),
      getActiveEntities: jest.fn(() => [])
    };

    // Performance metrics tracking
    perfMetrics = {
      frameTime: 0,
      entityCount: 0,
      renderCalls: 0
    };

    // Create renderer instance
    renderer = new Renderer(mockCanvas, mockEntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct canvas dimensions', () => {
      expect(renderer.canvas.width).toBe(800);
      expect(renderer.canvas.height).toBe(600);
    });

    test('should throw error if canvas is invalid', () => {
      expect(() => new Renderer(null)).toThrow('Invalid canvas element');
      expect(() => new Renderer(undefined)).toThrow('Invalid canvas element');
    });

    test('should create 2D context with correct settings', () => {
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });
  });

  describe('Rendering Pipeline', () => {
    test('should clear canvas before each render', () => {
      renderer.render();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    test('should render all active entities', () => {
      const mockEntities = [
        { id: 1, sprite: 'player', x: 100, y: 100, render: jest.fn() },
        { id: 2, sprite: 'enemy', x: 200, y: 200, render: jest.fn() }
      ];

      mockEntityManager.getActiveEntities.mockReturnValue(mockEntities);
      renderer.render();

      mockEntities.forEach(entity => {
        expect(entity.render).toHaveBeenCalledWith(mockContext);
      });
    });

    test('should handle empty entity list gracefully', () => {
      mockEntityManager.getActiveEntities.mockReturnValue([]);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('Performance Optimization', () => {
    test('should track render performance metrics', () => {
      const startTime = performance.now();
      renderer.render();
      expect(perfMetrics.frameTime).toBeGreaterThanOrEqual(0);
      expect(perfMetrics.renderCalls).toBe(1);
    });

    test('should batch similar render operations', () => {
      const similarEntities = Array(10).fill({
        type: 'enemy',
        sprite: 'enemy1',
        render: jest.fn()
      });

      mockEntityManager.getActiveEntities.mockReturnValue(similarEntities);
      renderer.render();

      // Check if batching occurred by comparing context save/restore calls
      expect(mockContext.save).toHaveBeenCalledTimes(1);
      expect(mockContext.restore).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle failed entity renders gracefully', () => {
      const errorEntity = {
        id: 'error1',
        render: jest.fn().mockImplementation(() => {
          throw new Error('Render failed');
        })
      };

      mockEntityManager.getActiveEntities.mockReturnValue([errorEntity]);
      expect(() => renderer.render()).not.toThrow();
    });

    test('should log render errors with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorEntity = {
        id: 'error2',
        render: () => { throw new Error('Render error'); }
      };

      mockEntityManager.getActiveEntities.mockReturnValue([errorEntity]);
      renderer.render();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Canvas State Management', () => {
    test('should properly manage canvas transform state', () => {
      renderer.render();
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    test('should reset transform between frames', () => {
      renderer.render();
      expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    });
  });

  describe('Viewport Management', () => {
    test('should handle viewport resize', () => {
      renderer.resize(1024, 768);
      expect(mockCanvas.width).toBe(1024);
      expect(mockCanvas.height).toBe(768);
    });

    test('should maintain aspect ratio on resize', () => {
      renderer.resize(1000, 500);
      expect(mockCanvas.width / mockCanvas.height).toBeCloseTo(2);
    });
  });
});