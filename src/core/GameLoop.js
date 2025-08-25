/**
 * @fileoverview Game Loop Implementation
 * Core game loop system that manages the game's update and render cycle.
 * 
 * Architecture:
 * - Uses RAF (RequestAnimationFrame) for optimal rendering
 * - Implements fixed timestep for physics/logic updates
 * - Provides performance monitoring and FPS tracking
 * - Supports pause/resume functionality
 * - Implements error boundary for crash recovery
 * 
 * @module core/GameLoop
 * @requires none
 */

/**
 * @typedef {Object} GameLoopConfig
 * @property {number} [targetFPS=60] - Target frames per second
 * @property {number} [maxDeltaTime=33.33] - Maximum allowed delta time (ms)
 * @property {boolean} [debug=false] - Enable debug mode
 */

/**
 * @typedef {Object} GameLoopStats
 * @property {number} fps - Current FPS
 * @property {number} frameTime - Time taken for last frame
 * @property {number} updateTime - Time taken for last update
 * @property {number} renderTime - Time taken for last render
 */

class GameLoop {
    /**
     * @param {GameLoopConfig} config - Configuration options
     */
    constructor(config = {}) {
        // Core timing properties
        this.targetFPS = config.targetFPS || 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.maxDeltaTime = config.maxDeltaTime || 33.33; // Cap at 30 FPS minimum
        
        // State management
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.accumulator = 0;
        
        // Performance monitoring
        this.debug = config.debug || false;
        this.stats = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        // Callback storage
        this.updateFn = null;
        this.renderFn = null;
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        
        // Error handling state
        this.errorCount = 0;
        this.maxErrors = 3;
    }

    /**
     * Starts the game loop
     * @param {Function} updateFn - Game state update function
     * @param {Function} renderFn - Game rendering function
     * @throws {Error} If update or render functions are not provided
     */
    start(updateFn, renderFn) {
        if (typeof updateFn !== 'function' || typeof renderFn !== 'function') {
            throw new Error('Both update and render functions must be provided');
        }

        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main game loop function
     * @private
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        try {
            const deltaTime = Math.min(
                currentTime - this.lastFrameTime,
                this.maxDeltaTime
            );

            this.lastFrameTime = currentTime;
            this.accumulator += deltaTime;

            const frameStart = performance.now();
            
            // Fixed timestep updates
            while (this.accumulator >= this.frameInterval) {
                const updateStart = performance.now();
                this.updateFn(this.frameInterval);
                this.stats.updateTime = performance.now() - updateStart;
                this.accumulator -= this.frameInterval;
            }

            // Render
            const renderStart = performance.now();
            this.renderFn();
            this.stats.renderTime = performance.now() - renderStart;

            // Calculate performance stats
            this.stats.frameTime = performance.now() - frameStart;
            this.stats.fps = 1000 / deltaTime;

            // Debug logging
            if (this.debug) {
                this.logPerformanceStats();
            }

            requestAnimationFrame(this.gameLoop);
            
            // Reset error count on successful frame
            this.errorCount = 0;

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Handles errors in the game loop
     * @private
     * @param {Error} error - The error that occurred
     */
    handleError(error) {
        console.error('GameLoop Error:', error);
        this.errorCount++;

        if (this.errorCount >= this.maxErrors) {
            console.error('Too many errors, stopping game loop');
            this.stop();
        } else {
            // Attempt to continue
            requestAnimationFrame(this.gameLoop);
        }
    }

    /**
     * Logs performance statistics
     * @private
     */
    logPerformanceStats() {
        console.debug('GameLoop Stats:', {
            fps: Math.round(this.stats.fps),
            frameTime: Math.round(this.stats.frameTime),
            updateTime: Math.round(this.stats.updateTime),
            renderTime: Math.round(this.stats.renderTime)
        });
    }

    /**
     * Gets current performance statistics
     * @returns {GameLoopStats} Current performance stats
     */
    getStats() {
        return { ...this.stats };
    }
}

export default GameLoop;