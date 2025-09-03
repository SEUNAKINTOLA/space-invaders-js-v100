/**
 * @fileoverview Performance tests for the collision detection system
 * @module tests/performance/collision.test.js
 */

// Custom performance measurement implementation since perf_hooks isn't available
const Performance = {
    _startTime: Date.now(),
    now() {
        // Return high-resolution timestamp in milliseconds
        // Using Date.now() as fallback for performance.now()
        return Date.now() - this._startTime;
    }
};

const { EventEmitter } = require('events');

/**
 * @typedef {Object} CollisionTestMetrics
 * @property {number} averageDetectionTime - Average time for collision checks (ms)
 * @property {number} peakMemoryUsage - Peak memory usage during test (MB)
 * @property {number} totalEntities - Number of entities in test
 * @property {number} collisionsPerFrame - Average collisions detected per frame
 */

/**
 * @typedef {Object} CollisionTestConfig
 * @property {number} entityCount - Number of entities to test
 * @property {number} iterations - Number of test iterations
 * @property {number} frameDuration - Simulated frame duration in ms
 */

class CollisionPerformanceTest {
    /**
     * @param {CollisionTestConfig} config 
     */
    constructor(config) {
        this.config = {
            entityCount: config.entityCount || 100,
            iterations: config.iterations || 1000,
            frameDuration: config.frameDuration || 16.67 // ~60fps
        };
        
        this.metrics = {
            startTime: 0,
            endTime: 0,
            memoryStart: 0,
            memoryEnd: 0,
            detectionTimes: [],
            collisionCounts: []
        };

        this.entities = new Map();
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Gets current memory usage in bytes
     * @private
     * @returns {number}
     */
    #getMemoryUsage() {
        try {
            return process.memoryUsage().heapUsed;
        } catch (e) {
            // Fallback if process.memoryUsage isn't available
            return 0;
        }
    }

    /**
     * Creates test entities with random positions and velocities
     * @private
     */
    #createTestEntities() {
        for (let i = 0; i < this.config.entityCount; i++) {
            this.entities.set(i, {
                id: i,
                x: Math.random() * 800,
                y: Math.random() * 600,
                width: 32,
                height: 32,
                velocity: {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 5
                }
            });
        }
    }

    /**
     * Simulates basic AABB collision detection
     * @private
     * @returns {number} Number of collisions detected
     */
    #detectCollisions() {
        let collisionCount = 0;
        const entities = Array.from(this.entities.values());

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                if (this.#checkCollision(entityA, entityB)) {
                    collisionCount++;
                }
            }
        }

        return collisionCount;
    }

    /**
     * Checks collision between two entities using AABB
     * @private
     * @param {Object} a First entity
     * @param {Object} b Second entity
     * @returns {boolean} True if collision detected
     */
    #checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + b.height > b.y
        );
    }

    /**
     * Updates entity positions based on velocities
     * @private
     */
    #updateEntities() {
        for (const entity of this.entities.values()) {
            entity.x += entity.velocity.x;
            entity.y += entity.velocity.y;

            // Basic boundary checking
            if (entity.x <= 0 || entity.x >= 800 - entity.width) {
                entity.velocity.x *= -1;
            }
            if (entity.y <= 0 || entity.y >= 600 - entity.height) {
                entity.velocity.y *= -1;
            }
        }
    }

    /**
     * Runs the performance test
     * @returns {Promise<CollisionTestMetrics>}
     */
    async runTest() {
        this.metrics.startTime = Performance.now();
        this.metrics.memoryStart = this.#getMemoryUsage();

        this.#createTestEntities();

        for (let i = 0; i < this.config.iterations; i++) {
            const iterationStart = Performance.now();
            
            this.#updateEntities();
            const collisions = this.#detectCollisions();
            
            const iterationTime = Performance.now() - iterationStart;
            this.metrics.detectionTimes.push(iterationTime);
            this.metrics.collisionCounts.push(collisions);

            // Simulate frame timing
            await new Promise(resolve => 
                setTimeout(resolve, Math.max(0, this.config.frameDuration - iterationTime))
            );
        }

        this.metrics.endTime = Performance.now();
        this.metrics.memoryEnd = this.#getMemoryUsage();

        return this.#calculateMetrics();
    }

    /**
     * Calculates final metrics from the test run
     * @private
     * @returns {CollisionTestMetrics}
     */
    #calculateMetrics() {
        const avgDetectionTime = this.metrics.detectionTimes.reduce((a, b) => a + b, 0) 
            / this.metrics.detectionTimes.length;
        const avgCollisions = this.metrics.collisionCounts.reduce((a, b) => a + b, 0) 
            / this.metrics.collisionCounts.length;

        return {
            averageDetectionTime: avgDetectionTime,
            peakMemoryUsage: (this.metrics.memoryEnd - this.metrics.memoryStart) / 1024 / 1024,
            totalEntities: this.config.entityCount,
            collisionsPerFrame: avgCollisions
        };
    }
}

// Export for test runner
module.exports = {
    CollisionPerformanceTest,
    runCollisionBenchmark: async (config) => {
        const test = new CollisionPerformanceTest(config);
        return await test.runTest();
    }
};