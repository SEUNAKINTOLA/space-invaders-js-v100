/**
 * @fileoverview Unit tests for EntityManager class
 * This test suite verifies the core functionality of the entity management system
 * including entity lifecycle, collision detection, and performance characteristics.
 * 
 * @jest
 */

describe('EntityManager', () => {
  let entityManager;
  
  beforeEach(() => {
    // Reset the entity manager before each test
    entityManager = new EntityManager();
  });

  describe('Entity Lifecycle Management', () => {
    test('should add entities correctly', () => {
      const mockEntity = {
        id: 'test-entity-1',
        type: 'player',
        position: { x: 0, y: 0 },
        dimensions: { width: 32, height: 32 }
      };

      entityManager.addEntity(mockEntity);
      expect(entityManager.getEntity(mockEntity.id)).toBe(mockEntity);
    });

    test('should remove entities correctly', () => {
      const mockEntity = {
        id: 'test-entity-2',
        type: 'enemy',
        position: { x: 10, y: 10 },
        dimensions: { width: 32, height: 32 }
      };

      entityManager.addEntity(mockEntity);
      entityManager.removeEntity(mockEntity.id);
      expect(entityManager.getEntity(mockEntity.id)).toBeUndefined();
    });

    test('should update entity properties', () => {
      const mockEntity = {
        id: 'test-entity-3',
        type: 'player',
        position: { x: 0, y: 0 },
        dimensions: { width: 32, height: 32 }
      };

      entityManager.addEntity(mockEntity);
      entityManager.updateEntity(mockEntity.id, { position: { x: 100, y: 100 } });
      
      const updated = entityManager.getEntity(mockEntity.id);
      expect(updated.position).toEqual({ x: 100, y: 100 });
    });
  });

  describe('Collision Detection', () => {
    test('should detect collision between overlapping entities', () => {
      const entity1 = {
        id: 'player',
        type: 'player',
        position: { x: 0, y: 0 },
        dimensions: { width: 32, height: 32 }
      };

      const entity2 = {
        id: 'enemy',
        type: 'enemy',
        position: { x: 16, y: 16 },
        dimensions: { width: 32, height: 32 }
      };

      entityManager.addEntity(entity1);
      entityManager.addEntity(entity2);

      const collisions = entityManager.checkCollisions();
      expect(collisions).toHaveLength(1);
      expect(collisions[0]).toEqual({
        entity1: entity1.id,
        entity2: entity2.id
      });
    });

    test('should not detect collision between non-overlapping entities', () => {
      const entity1 = {
        id: 'player',
        type: 'player',
        position: { x: 0, y: 0 },
        dimensions: { width: 32, height: 32 }
      };

      const entity2 = {
        id: 'enemy',
        type: 'enemy',
        position: { x: 100, y: 100 },
        dimensions: { width: 32, height: 32 }
      };

      entityManager.addEntity(entity1);
      entityManager.addEntity(entity2);

      const collisions = entityManager.checkCollisions();
      expect(collisions).toHaveLength(0);
    });
  });

  describe('Query Operations', () => {
    test('should filter entities by type', () => {
      const entities = [
        { id: 'player1', type: 'player' },
        { id: 'enemy1', type: 'enemy' },
        { id: 'enemy2', type: 'enemy' }
      ];

      entities.forEach(entity => entityManager.addEntity(entity));
      
      const enemies = entityManager.getEntitiesByType('enemy');
      expect(enemies).toHaveLength(2);
      expect(enemies.every(e => e.type === 'enemy')).toBe(true);
    });

    test('should get entities in specified boundary', () => {
      const entities = [
        { 
          id: 'player1', 
          type: 'player',
          position: { x: 50, y: 50 },
          dimensions: { width: 32, height: 32 }
        },
        { 
          id: 'enemy1', 
          type: 'enemy',
          position: { x: 200, y: 200 },
          dimensions: { width: 32, height: 32 }
        }
      ];

      entities.forEach(entity => entityManager.addEntity(entity));

      const boundary = {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      };

      const entitiesInBoundary = entityManager.getEntitiesInBoundary(boundary);
      expect(entitiesInBoundary).toHaveLength(1);
      expect(entitiesInBoundary[0].id).toBe('player1');
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle large number of entities efficiently', () => {
      const startTime = performance.now();
      const entityCount = 1000;

      // Add many entities
      for (let i = 0; i < entityCount; i++) {
        entityManager.addEntity({
          id: `entity-${i}`,
          type: 'test',
          position: { x: i, y: i },
          dimensions: { width: 10, height: 10 }
        });
      }

      const endTime = performance.now();
      const timePerEntity = (endTime - startTime) / entityCount;

      // Ensure each entity addition takes less than 1ms on average
      expect(timePerEntity).toBeLessThan(1);
    });

    test('should perform collision checks efficiently', () => {
      const entityCount = 100;
      
      // Add entities in a grid pattern
      for (let i = 0; i < entityCount; i++) {
        entityManager.addEntity({
          id: `entity-${i}`,
          type: 'test',
          position: { 
            x: (i % 10) * 40, 
            y: Math.floor(i / 10) * 40 
          },
          dimensions: { width: 32, height: 32 }
        });
      }

      const startTime = performance.now();
      const collisions = entityManager.checkCollisions();
      const endTime = performance.now();

      // Collision check should complete in under 100ms for 100 entities
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});