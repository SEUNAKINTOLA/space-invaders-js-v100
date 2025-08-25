/**
 * @fileoverview Core Rendering System for Space Invaders
 * 
 * Handles all game rendering operations with optimized canvas performance.
 * Implements double buffering and frame management for smooth animations.
 * 
 * Key Features:
 * - Double buffering for smooth rendering
 * - Automatic canvas scaling and resolution management
 * - Optimized batch rendering for game entities
 * - Frame timing and VSync support
 * - Error handling and fallbacks for rendering failures
 * 
 * @module core/Renderer
 * @requires None - Uses native Canvas API
 */

/**
 * @typedef {Object} RenderConfig
 * @property {number} width - Canvas width in pixels
 * @property {number} height - Canvas height in pixels
 * @property {boolean} [useDoubleBuffer=true] - Enable double buffering
 * @property {boolean} [smoothing=false] - Enable image smoothing
 */

/**
 * @typedef {Object} RenderStats
 * @property {number} fps - Current frames per second
 * @property {number} frameTime - Time taken to render last frame
 * @property {number} drawCalls - Number of draw calls in last frame
 */

class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to render to
     * @param {RenderConfig} config - Rendering configuration
     * @throws {Error} If canvas creation fails
     */
    constructor(canvas, config) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Invalid canvas element provided to Renderer');
        }

        this.canvas = canvas;
        this.config = this._validateConfig(config);
        
        // Main rendering context
        this.ctx = this._initContext(canvas);
        
        // Double buffer setup
        if (this.config.useDoubleBuffer) {
            this.bufferCanvas = document.createElement('canvas');
            this.bufferCanvas.width = this.config.width;
            this.bufferCanvas.height = this.config.height;
            this.bufferCtx = this._initContext(this.bufferCanvas);
        }

        // Performance metrics
        this.stats = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            lastFrameTime: performance.now()
        };

        // Bind methods
        this.clear = this.clear.bind(this);
        this.render = this.render.bind(this);
        this.drawEntity = this.drawEntity.bind(this);
    }

    /**
     * Validates and normalizes rendering configuration
     * @private
     * @param {RenderConfig} config
     * @returns {RenderConfig}
     */
    _validateConfig(config) {
        const defaultConfig = {
            width: 800,
            height: 600,
            useDoubleBuffer: true,
            smoothing: false
        };

        if (!config) return defaultConfig;

        return {
            width: config.width || defaultConfig.width,
            height: config.height || defaultConfig.height,
            useDoubleBuffer: config.useDoubleBuffer ?? defaultConfig.useDoubleBuffer,
            smoothing: config.smoothing ?? defaultConfig.smoothing
        };
    }

    /**
     * Initializes a canvas rendering context with optimal settings
     * @private
     * @param {HTMLCanvasElement} canvas
     * @returns {CanvasRenderingContext2D}
     */
    _initContext(canvas) {
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });

        if (!ctx) {
            throw new Error('Failed to create canvas rendering context');
        }

        ctx.imageSmoothingEnabled = this.config.smoothing;
        return ctx;
    }

    /**
     * Clears the entire canvas
     * @public
     */
    clear() {
        const ctx = this.config.useDoubleBuffer ? this.bufferCtx : this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.config.width, this.config.height);
    }

    /**
     * Renders a game entity to the canvas
     * @public
     * @param {Object} entity - Game entity to render
     * @param {number} entity.x - X position
     * @param {number} entity.y - Y position
     * @param {number} entity.width - Entity width
     * @param {number} entity.height - Entity height
     * @param {string} entity.color - Entity color
     */
    drawEntity(entity) {
        try {
            const ctx = this.config.useDoubleBuffer ? this.bufferCtx : this.ctx;
            ctx.fillStyle = entity.color || '#ffffff';
            ctx.fillRect(
                Math.round(entity.x),
                Math.round(entity.y),
                entity.width,
                entity.height
            );
            this.stats.drawCalls++;
        } catch (error) {
            console.error('Failed to render entity:', error);
        }
    }

    /**
     * Completes the rendering frame and swaps buffers if needed
     * @public
     * @returns {RenderStats} Current rendering statistics
     */
    render() {
        const currentTime = performance.now();
        this.stats.frameTime = currentTime - this.stats.lastFrameTime;
        this.stats.fps = 1000 / this.stats.frameTime;

        if (this.config.useDoubleBuffer) {
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
        }

        this.stats.lastFrameTime = currentTime;
        const stats = { ...this.stats };
        this.stats.drawCalls = 0;
        return stats;
    }

    /**
     * Resizes the rendering canvas
     * @public
     * @param {number} width - New width in pixels
     * @param {number} height - New height in pixels
     */
    resize(width, height) {
        this.config.width = width;
        this.config.height = height;
        this.canvas.width = width;
        this.canvas.height = height;

        if (this.config.useDoubleBuffer) {
            this.bufferCanvas.width = width;
            this.bufferCanvas.height = height;
        }

        // Reinitialize context settings after resize
        this.ctx.imageSmoothingEnabled = this.config.smoothing;
        if (this.bufferCtx) {
            this.bufferCtx.imageSmoothingEnabled = this.config.smoothing;
        }
    }

    /**
     * Cleans up renderer resources
     * @public
     */
    dispose() {
        // Clear any references and release resources
        this.ctx = null;
        this.bufferCtx = null;
        this.bufferCanvas = null;
        this.canvas = null;
    }
}

export default Renderer;