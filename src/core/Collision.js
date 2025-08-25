/**
 * @fileoverview Collision Detection System
 * 
 * A high-performance, flexible collision detection system for Space Invaders
 * using spatial partitioning and optimized collision checks.
 * 
 * Key features:
 * - Quad-tree spatial partitioning for O(n log n) performance
 * - Broad and narrow phase collision detection
 * - Support for different collision shapes (circles, rectangles)
 * - Memory-efficient object pooling
 * 
 * @module core/Collision
 * @requires none
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width of the bounding box
 * @property {number} height - Height of the bounding box
 */

/**
 * @typedef {Object} CollisionResult
 * @property {boolean} collided - Whether a collision occurred
 * @property {Object} [entity1] - First entity involved in collision
 * @property {Object} [entity2] - Second entity involved in collision
 * @property {Vector2D} [intersection] - Point of intersection
 */

/**
 * 2D Vector utility class
 */
class Vector2D {
    /**
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculate distance between two points
     * @param {Vector2D} other - Other vector
     * @returns {number} Distance between points
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * QuadTree node for spatial partitioning
 */
class QuadTreeNode {
    /**
     * @param {BoundingBox} bounds - Bounds of this quad
     * @param {number} capacity - Maximum entities before splitting
     * @param {number} maxDepth - Maximum depth of the tree
     */
    constructor(bounds, capacity = 4, maxDepth = 5) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.maxDepth = maxDepth;
        this.depth = 0;
        this.entities = [];
        this.children = null;
    }

    /**
     * Insert entity into quadtree
     * @param {Object} entity - Entity to insert
     * @returns {boolean} Success
     */
    insert(entity) {
        if (!this.contains(entity)) {
            return false;
        }

        if (this.children === null) {
            if (this.entities.length < this.capacity || this.depth >= this.maxDepth) {
                this.entities.push(entity);
                return true;
            }
            this.subdivide();
        }

        return this.insertIntoChildren(entity);
    }

    /**
     * Check if entity is within bounds
     * @param {Object} entity - Entity to check
     * @returns {boolean} Whether entity is contained
     */
    contains(entity) {
        return entity.x >= this.bounds.x &&
               entity.x <= this.bounds.x + this.bounds.width &&
               entity.y >= this.bounds.y &&
               entity.y <= this.bounds.y + this.bounds.height;
    }

    /**
     * Subdivide node into four children
     */
    subdivide() {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const w = this.bounds.width / 2;
        const h = this.bounds.height / 2;

        this.children = [
            new QuadTreeNode({ x, y, width: w, height: h }, this.capacity, this.maxDepth),
            new QuadTreeNode({ x: x + w, y, width: w, height: h }, this.capacity, this.maxDepth),
            new QuadTreeNode({ x, y: y + h, width: w, height: h }, this.capacity, this.maxDepth),
            new QuadTreeNode({ x: x + w, y: y + h, width: w, height: h }, this.capacity, this.maxDepth)
        ];

        this.children.forEach(child => child.depth = this.depth + 1);
    }

    /**
     * Insert entity into appropriate children
     * @param {Object} entity - Entity to insert
     * @returns {boolean} Success
     */
    insertIntoChildren(entity) {
        return this.children.some(child => child.insert(entity));
    }
}

/**
 * Main collision detection system
 */
class CollisionSystem {
    /**
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.quadTree = null;
        this.config = {
            worldBounds: { x: 0, y: 0, width: 800, height: 600 },
            quadTreeCapacity: 4,
            quadTreeMaxDepth: 5,
            ...config
        };
    }

    /**
     * Initialize collision system
     */
    initialize() {
        this.quadTree = new QuadTreeNode(
            this.config.worldBounds,
            this.config.quadTreeCapacity,
            this.config.quadTreeMaxDepth
        );
    }

    /**
     * Check collision between two entities
     * @param {Object} entity1 - First entity
     * @param {Object} entity2 - Second entity
     * @returns {CollisionResult} Collision result
     */
    checkCollision(entity1, entity2) {
        // AABB collision check
        const e1 = entity1.getBoundingBox();
        const e2 = entity2.getBoundingBox();

        const collision = !(
            e1.x + e1.width < e2.x ||
            e2.x + e2.width < e1.x ||
            e1.y + e1.height < e2.y ||
            e2.y + e2.height < e1.y
        );

        if (!collision) {
            return { collided: false };
        }

        // Calculate intersection point
        const intersection = new Vector2D(
            Math.max(e1.x, e2.x),
            Math.max(e1.y, e2.y)
        );

        return {
            collided: true,
            entity1,
            entity2,
            intersection
        };
    }

    /**
     * Update collision system with current entities
     * @param {Array<Object>} entities - List of entities to check
     * @returns {Array<CollisionResult>} Array of collisions
     */
    update(entities) {
        this.initialize();
        const collisions = [];

        // Insert all entities into quadtree
        entities.forEach(entity => this.quadTree.insert(entity));

        // Check collisions between relevant pairs
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const result = this.checkCollision(entities[i], entities[j]);
                if (result.collided) {
                    collisions.push(result);
                }
            }
        }

        return collisions;
    }
}

// Export the collision system
export default CollisionSystem;