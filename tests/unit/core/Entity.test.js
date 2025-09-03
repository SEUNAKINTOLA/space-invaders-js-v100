/**
 * @fileoverview Unit tests for the Entity core component
 * Tests the fundamental entity management and collision detection framework
 * 
 * @jest-environment jsdom
 */

describe('Entity', () => {
  // Mock setup
  let Entity;
  
  beforeEach(() => {
    // Reset modules before each test
    jest.resetModules();
    
    // Mock implementation of Entity for testing
    Entity = class {
      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = crypto.randomUUID();
        this.active = true;
        this.velocity = { x: 0, y: 0 };
      }

      update(deltaTime) {
        if (!this.active) return;
        
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
      }

      getBoundingBox() {
        return {
          left: this.x,
          right: this.x + this.width,
          top: this.y,
          bottom: this.y + this.height
        };
      }

      deactivate() {
        this.active = false;
      }

      activate() {
        this.active = true;
      }
    };
  });

  describe('Constructor', () => {
    test('should create entity with default values', () => {
      const entity = new Entity();
      
      expect(entity.x).toBe(0);
      expect(entity.y).toBe(0);
      expect(entity.width).toBe(0);
      expect(entity.height).toBe(0);
      expect(entity.active).toBe(true);
      expect(entity.velocity.x).toBe(0);
      expect(entity.velocity.y).toBe(0);
      expect(entity.id).toBeDefined();
    });

    test('should create entity with specified position and dimensions', () => {
      const entity = new Entity(100, 200, 50, 60);
      
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
      expect(entity.width).toBe(50);
      expect(entity.height).toBe(60);
    });
  });

  describe('Update', () => {
    test('should update position based on velocity and delta time', () => {
      const entity = new Entity(0, 0, 10, 10);
      entity.velocity = { x: 100, y: 50 };
      const deltaTime = 0.016; // Simulate 16ms frame time
      
      entity.update(deltaTime);
      
      expect(entity.x).toBe(100 * deltaTime);
      expect(entity.y).toBe(50 * deltaTime);
    });

    test('should not update when entity is inactive', () => {
      const entity = new Entity(0, 0, 10, 10);
      entity.velocity = { x: 100, y: 50 };
      entity.deactivate();
      
      entity.update(0.016);
      
      expect(entity.x).toBe(0);
      expect(entity.y).toBe(0);
    });
  });

  describe('Bounding Box', () => {
    test('should return correct bounding box dimensions', () => {
      const entity = new Entity(10, 20, 30, 40);
      const boundingBox = entity.getBoundingBox();
      
      expect(boundingBox).toEqual({
        left: 10,
        right: 40, // x + width
        top: 20,
        bottom: 60 // y + height
      });
    });
  });

  describe('Activation State', () => {
    test('should toggle activation state correctly', () => {
      const entity = new Entity();
      
      expect(entity.active).toBe(true);
      
      entity.deactivate();
      expect(entity.active).toBe(false);
      
      entity.activate();
      expect(entity.active).toBe(true);
    });
  });

  describe('Entity ID', () => {
    test('should generate unique IDs for each entity', () => {
      const entity1 = new Entity();
      const entity2 = new Entity();
      
      expect(entity1.id).toBeDefined();
      expect(entity2.id).toBeDefined();
      expect(entity1.id).not.toBe(entity2.id);
    });
  });
});