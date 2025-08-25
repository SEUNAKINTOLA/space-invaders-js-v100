/**
 * @fileoverview Entity Base Class
 * 
 * Core entity class that serves as the foundation for all game objects in Space Invaders.
 * Implements core functionality for position, movement, collision detection, and lifecycle management.
 * 
 * Key Features:
 * - Position and dimension management
 * - Velocity and movement calculations
 * - Collision boundary computation
 * - Entity state management
 * - Observable lifecycle events
 * 
 * @module core/Entity
 * @requires none
 */

/**
 * @typedef {Object} EntityConfig
 * @property {number} x - Initial X position
 * @property {number} y - Initial Y position
 * @property {number} width - Entity width
 * @property {number} height - Entity height
 * @property {number} [speed=0] - Movement speed
 * @property {string} [type='entity'] - Entity type identifier
 */

/**
 * @typedef {Object} Bounds
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

class Entity {
    /**
     * Creates a new Entity instance
     * @param {EntityConfig} config - Entity configuration object
     * @throws {Error} If required parameters are missing or invalid
     */
    constructor(config) {
        this._validateConfig(config);

        // Core properties
        this.id = crypto.randomUUID();
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed || 0;
        this.type = config.type || 'entity';

        // State
        this.active = true;
        this.visible = true;
        this.velocity = { x: 0, y: 0 };

        // Event handlers
        this._eventHandlers = new Map();

        // Debug mode
        this.debug = false;
    }

    /**
     * Validates entity configuration
     * @private
     * @param {EntityConfig} config 
     * @throws {Error} If configuration is invalid
     */
    _validateConfig(config) {
        const required = ['x', 'y', 'width', 'height'];
        for (const prop of required) {
            if (typeof config[prop] !== 'number') {
                throw new Error(`Invalid ${prop}: must be a number`);
            }
        }
    }

    /**
     * Updates entity state
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update position based on velocity
        this.x += this.velocity.x * this.speed * (deltaTime / 1000);
        this.y += this.velocity.y * this.speed * (deltaTime / 1000);

        this._emitEvent('update', { deltaTime });
    }

    /**
     * Gets entity collision boundaries
     * @returns {Bounds} Collision boundaries
     */
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    /**
     * Checks collision with another entity
     * @param {Entity} other - Entity to check collision with
     * @returns {boolean} True if colliding
     */
    isColliding(other) {
        if (!this.active || !other.active) return false;

        const bounds = this.getBounds();
        const otherBounds = other.getBounds();

        return !(bounds.left >= otherBounds.right || 
                bounds.right <= otherBounds.left || 
                bounds.top >= otherBounds.bottom || 
                bounds.bottom <= otherBounds.top);
    }

    /**
     * Sets entity velocity
     * @param {number} x - X velocity component
     * @param {number} y - Y velocity component
     */
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        this._emitEvent('velocityChange', { x, y });
    }

    /**
     * Sets entity position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this._emitEvent('positionChange', { x, y });
    }

    /**
     * Activates the entity
     */
    activate() {
        this.active = true;
        this._emitEvent('activate');
    }

    /**
     * Deactivates the entity
     */
    deactivate() {
        this.active = false;
        this._emitEvent('deactivate');
    }

    /**
     * Adds event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on(event, handler) {
        if (!this._eventHandlers.has(event)) {
            this._eventHandlers.set(event, new Set());
        }
        this._eventHandlers.get(event).add(handler);
    }

    /**
     * Removes event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    off(event, handler) {
        if (this._eventHandlers.has(event)) {
            this._eventHandlers.get(event).delete(handler);
        }
    }

    /**
     * Emits an event
     * @private
     * @param {string} event - Event name
     * @param {Object} [data] - Event data
     */
    _emitEvent(event, data = {}) {
        if (this._eventHandlers.has(event)) {
            for (const handler of this._eventHandlers.get(event)) {
                try {
                    handler({ type: event, target: this, ...data });
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            }
        }
    }

    /**
     * Destroys the entity and cleans up resources
     */
    destroy() {
        this.active = false;
        this.visible = false;
        this._eventHandlers.clear();
        this._emitEvent('destroy');
    }

    /**
     * Creates a debug representation of the entity
     * @returns {Object} Debug info
     */
    toDebug() {
        return {
            id: this.id,
            type: this.type,
            position: { x: this.x, y: this.y },
            dimensions: { width: this.width, height: this.height },
            velocity: this.velocity,
            speed: this.speed,
            state: { active: this.active, visible: this.visible }
        };
    }
}

export default Entity;