/**
 * @fileoverview Object Pool Implementation for Space Invaders
 * Provides efficient object reuse to minimize garbage collection and improve performance
 * 
 * @module utils/ObjectPool
 * @requires none
 * 
 * Key architectural decisions:
 * - Uses a pre-allocation strategy to minimize runtime allocations
 * - Implements automatic pool expansion when needed
 * - Provides type-safe operation through JSDoc annotations
 * - Includes comprehensive error handling and logging
 */

/**
 * @typedef {Object} PoolOptions
 * @property {number} initialSize - Initial size of the pool
 * @property {number} expandSize - How many objects to add when pool is empty
 * @property {number} maxSize - Maximum pool size (0 for unlimited)
 * @property {Function} factory - Function that creates new objects
 * @property {Function} reset - Function to reset object state
 */

/**
 * @typedef {Object} PoolMetrics
 * @property {number} size - Current pool size
 * @property {number} available - Number of available objects
 * @property {number} allocated - Total objects ever allocated
 * @property {number} maxUsed - Maximum number of objects used simultaneously
 */

class ObjectPool {
    /**
     * Creates a new ObjectPool instance
     * @param {PoolOptions} options - Pool configuration options
     * @throws {Error} If invalid options are provided
     */
    constructor(options) {
        this._validateOptions(options);

        this._factory = options.factory;
        this._reset = options.reset;
        this._initialSize = options.initialSize;
        this._expandSize = options.expandSize;
        this._maxSize = options.maxSize;

        // Internal state
        this._pool = [];
        this._active = new Set();
        this._metrics = {
            allocated: 0,
            maxUsed: 0
        };

        // Initialize pool
        this._expandPool(this._initialSize);
    }

    /**
     * Acquires an object from the pool
     * @returns {Object} An object from the pool
     * @throws {Error} If pool is at maximum size and empty
     */
    acquire() {
        if (this._pool.length === 0) {
            if (this._maxSize && this._active.size >= this._maxSize) {
                throw new Error('Object pool maximum size reached');
            }
            this._expandPool(this._expandSize);
        }

        const object = this._pool.pop();
        this._active.add(object);

        // Update metrics
        this._metrics.maxUsed = Math.max(
            this._metrics.maxUsed,
            this._active.size
        );

        return object;
    }

    /**
     * Returns an object to the pool
     * @param {Object} object - Object to return to pool
     * @throws {Error} If object didn't originate from this pool
     */
    release(object) {
        if (!this._active.has(object)) {
            throw new Error('Attempting to release an object not from this pool');
        }

        this._reset(object);
        this._active.delete(object);
        this._pool.push(object);
    }

    /**
     * Gets current pool metrics
     * @returns {PoolMetrics} Current pool metrics
     */
    getMetrics() {
        return {
            size: this._pool.length + this._active.size,
            available: this._pool.length,
            allocated: this._metrics.allocated,
            maxUsed: this._metrics.maxUsed
        };
    }

    /**
     * Clears the pool and resets all metrics
     */
    clear() {
        this._pool = [];
        this._active.clear();
        this._metrics.allocated = 0;
        this._metrics.maxUsed = 0;
        this._expandPool(this._initialSize);
    }

    /**
     * Validates pool options
     * @private
     * @param {PoolOptions} options - Options to validate
     * @throws {Error} If options are invalid
     */
    _validateOptions(options) {
        if (!options || typeof options !== 'object') {
            throw new Error('Options must be an object');
        }

        if (typeof options.factory !== 'function') {
            throw new Error('Factory must be a function');
        }

        if (typeof options.reset !== 'function') {
            throw new Error('Reset must be a function');
        }

        if (!Number.isInteger(options.initialSize) || options.initialSize < 0) {
            throw new Error('Initial size must be a non-negative integer');
        }

        if (!Number.isInteger(options.expandSize) || options.expandSize < 1) {
            throw new Error('Expand size must be a positive integer');
        }

        if (options.maxSize !== 0 && (!Number.isInteger(options.maxSize) || options.maxSize < options.initialSize)) {
            throw new Error('Max size must be 0 (unlimited) or greater than initial size');
        }
    }

    /**
     * Expands the pool by creating new objects
     * @private
     * @param {number} count - Number of objects to create
     */
    _expandPool(count) {
        for (let i = 0; i < count; i++) {
            const object = this._factory();
            this._pool.push(object);
            this._metrics.allocated++;
        }
    }
}

// Export the class
export default ObjectPool;