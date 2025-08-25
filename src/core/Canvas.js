/**
 * @fileoverview Canvas Management System for Space Invaders
 * 
 * Responsible for managing the game's canvas context, handling rendering
 * operations, and maintaining the canvas state. Implements efficient
 * canvas operations with proper cleanup and error handling.
 * 
 * Key Features:
 * - Automatic canvas scaling and resolution management
 * - Error handling for canvas operations
 * - Performance optimized clearing and drawing
 * - Resource management and cleanup
 * 
 * @module core/Canvas
 * @requires None - Uses only browser built-ins
 */

/**
 * Represents canvas operation errors
 */
class CanvasError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CanvasError';
    }
}

/**
 * Canvas manager class handling all canvas-related operations
 */
class Canvas {
    /**
     * @typedef {Object} CanvasConfig
     * @property {number} width - Canvas width in pixels
     * @property {number} height - Canvas height in pixels
     * @property {string} [backgroundColor='#000000'] - Canvas background color
     */

    /**
     * @param {CanvasConfig} config - Canvas configuration
     * @throws {CanvasError} If canvas creation fails
     */
    constructor(config) {
        this.validateConfig(config);
        
        this.width = config.width;
        this.height = config.height;
        this.backgroundColor = config.backgroundColor || '#000000';
        
        this.initialize();
    }

    /**
     * Validates the configuration object
     * @private
     * @param {CanvasConfig} config 
     * @throws {CanvasError}
     */
    validateConfig(config) {
        if (!config) {
            throw new CanvasError('Canvas configuration is required');
        }
        
        if (!Number.isFinite(config.width) || config.width <= 0) {
            throw new CanvasError('Invalid canvas width');
        }
        
        if (!Number.isFinite(config.height) || config.height <= 0) {
            throw new CanvasError('Invalid canvas height');
        }
    }

    /**
     * Initializes the canvas element and context
     * @private
     * @throws {CanvasError}
     */
    initialize() {
        try {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            this.context = this.canvas.getContext('2d');
            if (!this.context) {
                throw new CanvasError('Failed to get 2D context');
            }

            // Set initial state
            this.clear();
        } catch (error) {
            throw new CanvasError(`Canvas initialization failed: ${error.message}`);
        }
    }

    /**
     * Clears the entire canvas
     * @returns {void}
     */
    clear() {
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Gets the canvas element
     * @returns {HTMLCanvasElement}
     */
    getElement() {
        return this.canvas;
    }

    /**
     * Gets the rendering context
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.context;
    }

    /**
     * Resizes the canvas
     * @param {number} width - New width
     * @param {number} height - New height
     * @throws {CanvasError}
     */
    resize(width, height) {
        if (!Number.isFinite(width) || width <= 0 || 
            !Number.isFinite(height) || height <= 0) {
            throw new CanvasError('Invalid dimensions for resize');
        }

        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.clear();
    }

    /**
     * Draws an image on the canvas
     * @param {CanvasImageSource} image - Image to draw
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width to draw
     * @param {number} height - Height to draw
     * @throws {CanvasError}
     */
    drawImage(image, x, y, width, height) {
        try {
            this.context.drawImage(image, x, y, width, height);
        } catch (error) {
            throw new CanvasError(`Failed to draw image: ${error.message}`);
        }
    }

    /**
     * Saves the current canvas state
     * @returns {void}
     */
    save() {
        this.context.save();
    }

    /**
     * Restores the last saved canvas state
     * @returns {void}
     */
    restore() {
        this.context.restore();
    }

    /**
     * Cleanup method for canvas resources
     * @returns {void}
     */
    destroy() {
        // Remove any event listeners if added
        this.canvas.remove();
        // Clear references
        this.context = null;
        this.canvas = null;
    }
}

// Export the Canvas class
export default Canvas;