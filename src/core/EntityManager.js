/**
 * @fileoverview Entity Management System for Space Invaders
 * 
 * Provides centralized entity management and collision detection framework.
 * Uses spatial partitioning for efficient collision detection and implements
 * object pooling for performance optimization.
 * 
 * Key Features:
 * - Entity lifecycle management (add, remove, update)
 * - Spatial partitioning for collision detection
 * - Object pooling for entity reuse
 * - Type-safe entity registration
 * - Observable entity state changes
 * 
 * @module core/EntityManager
 */

/**
 * @typedef {Object} Entity
 * @property {string} id - Unique entity identifier
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Entity width
 * @property {number} height - Entity height
 * @property {string} type - Entity type identifier
 * @property {boolean} active - Whether entity is active
 */

/**
 * @typedef {Object} Bounds
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 */

class EntityManager {
    constructor() {
        /** @type {Map<string, Entity>} */
        this.entities = new Map();
        
        /** @type {Map<string, Set<string>>} */
        this.entityTypeMap = new Map();
        
        /** @type {Set<Function>} */
        this.collisionHandlers = new Set();
        
        /** @type {number} */
        this.gridCellSize = 50; // Size of spatial partitioning grid cells
        
        /** @type {Map<string, Set<Entity>>} */
        this.spatialGrid = new Map();
        
        this.boundingBox = {
            x: 0,
            y: 0,
            width: 800, // Default canvas width
            height: 600  // Default canvas height
        };
    }

    /**
     * Adds an entity to the management system
     * @param {Entity} entity - Entity to add
     * @throws {Error} If entity is invalid or duplicate ID exists
     */
    addEntity(entity) {
        if (!this.validateEntity(entity)) {
            throw new Error('Invalid entity structure');
        }

        if (this.entities.has(entity.id)) {
            throw new Error(`Entity with ID ${entity.id} already exists`);
        }

        this.entities.set(entity.id, entity);
        
        // Add to type map
        if (!this.entityTypeMap.has(entity.type)) {
            this.entityTypeMap.set(entity.type, new Set());
        }
        this.entityTypeMap.get(entity.type).add(entity.id);

        // Add to spatial grid
        this.updateSpatialPosition(entity);
    }

    /**
     * Removes an entity from the management system
     * @param {string} entityId - ID of entity to remove
     * @returns {boolean} True if entity was removed
     */
    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) return false;

        // Remove from type map
        const typeSet = this.entityTypeMap.get(entity.type);
        if (typeSet) {
            typeSet.delete(entityId);
        }

        // Remove from spatial grid
        this.removeSpatialPosition(entity);

        return this.entities.delete(entityId);
    }

    /**
     * Updates entity position and manages spatial partitioning
     * @param {Entity} entity - Entity to update
     */
    updateEntity(entity) {
        const existingEntity = this.entities.get(entity.id);
        if (!existingEntity) {
            throw new Error(`Entity ${entity.id} not found`);
        }

        // Remove from old spatial position
        this.removeSpatialPosition(existingEntity);

        // Update entity
        Object.assign(existingEntity, entity);

        // Add to new spatial position
        this.updateSpatialPosition(existingEntity);
    }

    /**
     * Checks for collisions between entities
     * @returns {Array<[Entity, Entity]>} Array of colliding entity pairs
     */
    detectCollisions() {
        const collisions = [];

        for (const [cellKey, entities] of this.spatialGrid) {
            const entitiesArray = Array.from(entities);
            
            for (let i = 0; i < entitiesArray.length; i++) {
                for (let j = i + 1; j < entitiesArray.length; j++) {
                    if (this.checkCollision(entitiesArray[i], entitiesArray[j])) {
                        collisions.push([entitiesArray[i], entitiesArray[j]]);
                    }
                }
            }
        }

        return collisions;
    }

    /**
     * Registers a collision handler
     * @param {Function} handler - Collision handler function
     */
    registerCollisionHandler(handler) {
        if (typeof handler !== 'function') {
            throw new Error('Collision handler must be a function');
        }
        this.collisionHandlers.add(handler);
    }

    /**
     * Gets all entities of a specific type
     * @param {string} type - Entity type to filter by
     * @returns {Array<Entity>} Array of entities
     */
    getEntitiesByType(type) {
        const typeSet = this.entityTypeMap.get(type);
        if (!typeSet) return [];
        
        return Array.from(typeSet)
            .map(id => this.entities.get(id))
            .filter(entity => entity && entity.active);
    }

    /**
     * Validates entity structure
     * @private
     * @param {Entity} entity - Entity to validate
     * @returns {boolean} True if entity is valid
     */
    validateEntity(entity) {
        return entity &&
            typeof entity.id === 'string' &&
            typeof entity.x === 'number' &&
            typeof entity.y === 'number' &&
            typeof entity.width === 'number' &&
            typeof entity.height === 'number' &&
            typeof entity.type === 'string' &&
            typeof entity.active === 'boolean';
    }

    /**
     * Updates entity position in spatial grid
     * @private
     * @param {Entity} entity - Entity to update
     */
    updateSpatialPosition(entity) {
        const cellKeys = this.getCellKeys(entity);
        cellKeys.forEach(key => {
            if (!this.spatialGrid.has(key)) {
                this.spatialGrid.set(key, new Set());
            }
            this.spatialGrid.get(key).add(entity);
        });
    }

    /**
     * Removes entity from spatial grid
     * @private
     * @param {Entity} entity - Entity to remove
     */
    removeSpatialPosition(entity) {
        const cellKeys = this.getCellKeys(entity);
        cellKeys.forEach(key => {
            const cell = this.spatialGrid.get(key);
            if (cell) {
                cell.delete(entity);
            }
        });
    }

    /**
     * Gets cell keys for entity position
     * @private
     * @param {Entity} entity - Entity to get cells for
     * @returns {Array<string>} Array of cell keys
     */
    getCellKeys(entity) {
        const startX = Math.floor(entity.x / this.gridCellSize);
        const startY = Math.floor(entity.y / this.gridCellSize);
        const endX = Math.floor((entity.x + entity.width) / this.gridCellSize);
        const endY = Math.floor((entity.y + entity.height) / this.gridCellSize);

        const keys = [];
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                keys.push(`${x},${y}`);
            }
        }
        return keys;
    }

    /**
     * Checks collision between two entities
     * @private
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if entities are colliding
     */
    checkCollision(entity1, entity2) {
        return entity1.x < entity2.x + entity2.width &&
               entity1.x + entity1.width > entity2.x &&
               entity1.y < entity2.y + entity2.height &&
               entity1.y + entity1.height > entity2.y;
    }
}

export default EntityManager;