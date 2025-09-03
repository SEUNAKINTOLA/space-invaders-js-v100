/**
 * @fileoverview Entity Type Definitions for Space Invaders
 * @description Defines the core entity types and their properties for the game's
 * entity management and collision detection systems.
 * 
 * Key architectural decisions:
 * - Immutable configuration objects
 * - Type-safe entity definitions
 * - Collision group management
 * - Performance-optimized property access
 * 
 * @version 1.0.0
 * @module config/entity-types
 */

/**
 * @typedef {Object} CollisionMask
 * @property {number} group - The collision group this entity belongs to
 * @property {number[]} collidesWith - Array of group IDs this entity can collide with
 */

/**
 * @typedef {Object} EntityDimensions
 * @property {number} width - Width of the entity hitbox
 * @property {number} height - Height of the entity hitbox
 */

/**
 * @typedef {Object} EntityProperties
 * @property {string} type - Unique identifier for the entity type
 * @property {CollisionMask} collisionMask - Collision properties
 * @property {EntityDimensions} dimensions - Physical dimensions
 * @property {number} baseHealth - Default health points
 * @property {number} baseSpeed - Base movement speed
 * @property {boolean} isDestructible - Whether entity can be destroyed
 * @property {boolean} canMove - Whether entity can move
 */

/**
 * Collision groups for entity interaction
 * @enum {number}
 */
export const COLLISION_GROUPS = Object.freeze({
    NONE: 0,
    PLAYER: 1,
    ENEMY: 2,
    PLAYER_PROJECTILE: 3,
    ENEMY_PROJECTILE: 4,
    POWERUP: 5,
    OBSTACLE: 6
});

/**
 * Entity types with their default properties
 * @type {Object<string, EntityProperties>}
 */
export const ENTITY_TYPES = Object.freeze({
    PLAYER: {
        type: 'PLAYER',
        collisionMask: {
            group: COLLISION_GROUPS.PLAYER,
            collidesWith: [
                COLLISION_GROUPS.ENEMY,
                COLLISION_GROUPS.ENEMY_PROJECTILE,
                COLLISION_GROUPS.POWERUP
            ]
        },
        dimensions: {
            width: 32,
            height: 32
        },
        baseHealth: 100,
        baseSpeed: 5,
        isDestructible: true,
        canMove: true
    },

    ENEMY_BASIC: {
        type: 'ENEMY_BASIC',
        collisionMask: {
            group: COLLISION_GROUPS.ENEMY,
            collidesWith: [
                COLLISION_GROUPS.PLAYER,
                COLLISION_GROUPS.PLAYER_PROJECTILE
            ]
        },
        dimensions: {
            width: 32,
            height: 32
        },
        baseHealth: 20,
        baseSpeed: 2,
        isDestructible: true,
        canMove: true
    },

    PLAYER_PROJECTILE: {
        type: 'PLAYER_PROJECTILE',
        collisionMask: {
            group: COLLISION_GROUPS.PLAYER_PROJECTILE,
            collidesWith: [
                COLLISION_GROUPS.ENEMY,
                COLLISION_GROUPS.OBSTACLE
            ]
        },
        dimensions: {
            width: 4,
            height: 12
        },
        baseHealth: 1,
        baseSpeed: 8,
        isDestructible: true,
        canMove: true
    },

    ENEMY_PROJECTILE: {
        type: 'ENEMY_PROJECTILE',
        collisionMask: {
            group: COLLISION_GROUPS.ENEMY_PROJECTILE,
            collidesWith: [
                COLLISION_GROUPS.PLAYER,
                COLLISION_GROUPS.OBSTACLE
            ]
        },
        dimensions: {
            width: 4,
            height: 12
        },
        baseHealth: 1,
        baseSpeed: 6,
        isDestructible: true,
        canMove: true
    },

    OBSTACLE: {
        type: 'OBSTACLE',
        collisionMask: {
            group: COLLISION_GROUPS.OBSTACLE,
            collidesWith: [
                COLLISION_GROUPS.PLAYER_PROJECTILE,
                COLLISION_GROUPS.ENEMY_PROJECTILE
            ]
        },
        dimensions: {
            width: 64,
            height: 32
        },
        baseHealth: 100,
        baseSpeed: 0,
        isDestructible: true,
        canMove: false
    }
});

/**
 * Validates if an entity type exists
 * @param {string} type - Entity type to validate
 * @returns {boolean} True if entity type exists
 */
export const isValidEntityType = (type) => {
    return Object.prototype.hasOwnProperty.call(ENTITY_TYPES, type);
};

/**
 * Gets collision groups that can interact with the specified group
 * @param {number} groupId - Collision group ID
 * @returns {number[]} Array of collision group IDs
 */
export const getInteractiveGroups = (groupId) => {
    const interactiveGroups = new Set();
    
    Object.values(ENTITY_TYPES).forEach(entity => {
        if (entity.collisionMask.collidesWith.includes(groupId)) {
            interactiveGroups.add(entity.collisionMask.group);
        }
    });
    
    return Array.from(interactiveGroups);
};

/**
 * Checks if two entity types can collide
 * @param {string} typeA - First entity type
 * @param {string} typeB - Second entity type
 * @returns {boolean} True if entities can collide
 * @throws {Error} If invalid entity type is provided
 */
export const canCollide = (typeA, typeB) => {
    if (!isValidEntityType(typeA) || !isValidEntityType(typeB)) {
        throw new Error('Invalid entity type provided');
    }

    const entityA = ENTITY_TYPES[typeA];
    const entityB = ENTITY_TYPES[typeB];

    return entityA.collisionMask.collidesWith.includes(entityB.collisionMask.group) ||
           entityB.collisionMask.collidesWith.includes(entityA.collisionMask.group);
};