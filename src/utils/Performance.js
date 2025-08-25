* 
 * @module Performance
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} fps Current frames per second
 * @property {number} frameTime Time taken for last frame (ms)
 * @property {number} avgFrameTime Average frame time (ms)
 * @property {number} minFrameTime Minimum frame time (ms)
 * @property {number} maxFrameTime Maximum frame time (ms)
 * @property {number} memoryUsage Current memory usage (MB)
 */

class PerformanceMonitor {
    /**
     * Creates a new performance monitor instance
     * @param {Object} options Configuration options
     * @param {number} [options.fpsBufferSize=60] Number of frames to average for FPS
     * @param {number} [options.warningThreshold=16.67] Frame time warning threshold in ms (60 FPS)
     */
    constructor(options = {}) {
        this.fpsBufferSize = options.fpsBufferSize || 60;
        this.warningThreshold = options.warningThreshold || 16.67;
        
        // Performance buffers
        this.frameTimes = new Array(this.fpsBufferSize).fill(0);
        this.frameIndex = 0;
        
        // Timing state
        this.frameStartTime = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Statistics
        this.minFrameTime = Number.MAX_VALUE;
        this.maxFrameTime = 0;
        this.totalFrameTime = 0;
        
        // Check if Performance API is available
        this.hasPerformanceAPI = typeof performance !== 'undefined';
        
        // Bind methods
        this.startFrame = this.startFrame.bind(this);
        this.endFrame = this.endFrame.bind(this);
    }

    /**
     * Starts timing a new frame
     * @throws {Error} If called before previous frame was ended
     */
    startFrame() {
        if (this.frameStartTime !== 0) {
            throw new Error('startFrame called before ending previous frame');
        }
        this.frameStartTime = this.hasPerformanceAPI ? 
            performance.now() : Date.now();
    }

    /**
     * Ends timing for the current frame
     * @throws {Error} If called before startFrame
     */
    endFrame() {
        if (this.frameStartTime === 0) {
            throw new Error('endFrame called before startFrame');
        }

        const now = this.hasPerformanceAPI ? 
            performance.now() : Date.now();
        const frameTime = now - this.frameStartTime;

        // Update statistics
        this.lastFrameTime = frameTime;
        this.minFrameTime = Math.min(this.minFrameTime, frameTime);
        this.maxFrameTime = Math.max(this.maxFrameTime, frameTime);
        
        // Update circular buffer
        this.frameTimes[this.frameIndex] = frameTime;
        this.frameIndex = (this.frameIndex + 1) % this.fpsBufferSize;
        
        // Reset frame start time
        this.frameStartTime = 0;
        this.frameCount++;

        // Log warning if frame took too long
        if (frameTime > this.warningThreshold) {
            console.warn(`Long frame detected: ${frameTime.toFixed(2)}ms`);
        }
    }

    /**
     * Gets the current frames per second
     * @returns {number} Current FPS (averaged over buffer size)
     */
    getCurrentFPS() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    }

    /**
     * Gets the average frame time over the sample buffer
     * @returns {number} Average frame time in milliseconds
     */
    getAverageFrameTime() {
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.fpsBufferSize;
    }

    /**
     * Gets current memory usage if available
     * @returns {number|null} Memory usage in MB or null if not available
     */
    getMemoryUsage() {
        if (performance && performance.memory) {
            return performance.memory.usedJSHeapSize / (1024 * 1024);
        }
        return null;
    }

    /**
     * Gets comprehensive performance metrics
     * @returns {PerformanceMetrics} Current performance metrics
     */
    getMetrics() {
        return {
            fps: this.getCurrentFPS(),
            frameTime: this.lastFrameTime,
            avgFrameTime: this.getAverageFrameTime(),
            minFrameTime: this.minFrameTime,
            maxFrameTime: this.maxFrameTime,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Resets all performance measurements
     */
    reset() {
        this.frameTimes.fill(0);
        this.frameIndex = 0;
        this.frameStartTime = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.minFrameTime = Number.MAX_VALUE;
        this.maxFrameTime = 0;
        this.totalFrameTime = 0;
    }
}

export default PerformanceMonitor;