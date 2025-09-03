/**
 * @fileoverview Core game constants and configuration values
 * @module config/constants
 * 
 * This module defines all core game constants used throughout Space Invaders.
 * Constants are organized by domain and frozen to prevent modification.
 * All values are validated on module load.
 * 
 * @version 1.0.0
 */

/**
 * Canvas rendering constants
 * @constant {Object}
 */
export const CANVAS = Object.freeze({
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#000000',
  FPS: 60,
  PIXEL_RATIO: (typeof window !== 'undefined' && window.devicePixelRatio) || 1
});

/**
 * Game physics and movement constants
 * @constant {Object}
 */
export const PHYSICS = Object.freeze({
  GRAVITY: 0,
  MAX_VELOCITY: 10,
  FRICTION: 0.98,
  COLLISION_PRECISION: 2
});

/**
 * Player related constants
 * @constant {Object}
 */
export const PLAYER = Object.freeze({
  INITIAL_LIVES: 3,
  MOVEMENT_SPEED: 5,
  SHOOT_COOLDOWN: 100, // ms - faster shooting
  SIZE: {
    WIDTH: 32,
    HEIGHT: 32
  },
  SPAWN: {
    X: CANVAS.WIDTH / 2,
    Y: CANVAS.HEIGHT - 50
  }
});

/**
 * Enemy related constants
 * @constant {Object}
 */
export const ENEMY = Object.freeze({
  ROWS: 5,
  COLUMNS: 11,
  SPACING: {
    HORIZONTAL: 50,
    VERTICAL: 40
  },
  MOVEMENT: {
    SPEED: 2,
    DROP_DISTANCE: 20,
    ACCELERATION: 1.1
  },
  POINTS: {
    TOP_ROW: 30,
    MIDDLE_ROW: 20,
    BOTTOM_ROW: 10
  }
});

/**
 * Projectile constants
 * @constant {Object}
 */
export const PROJECTILE = Object.freeze({
  PLAYER: {
    SPEED: 50,
    SIZE: { WIDTH: 2, HEIGHT: 10 },
    COLOR: '#ffffff'
  },
  ENEMY: {
    SPEED: 5,
    SIZE: { WIDTH: 2, HEIGHT: 10 },
    COLOR: '#ff0000'
  }
});

/**
 * Game state constants
 * @constant {Object}
 */
export const GAME_STATES = Object.freeze({
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  HIGH_SCORE: 'HIGH_SCORE'
});

/**
 * Scoring system constants
 * @constant {Object}
 */
export const SCORING = Object.freeze({
  HIGH_SCORE_COUNT: 10,
  BONUS_MULTIPLIER: 1.5,
  COMBO_TIMEOUT: 1000, // ms
  LEVEL_COMPLETION_BONUS: 1000
});

/**
 * Performance thresholds and limits
 * @constant {Object}
 */
export const PERFORMANCE = Object.freeze({
  MAX_ENTITIES: 1000,
  GARBAGE_COLLECTION_INTERVAL: 1000,
  FRAME_TIME_WARNING: 16.67, // ms (60 FPS)
  MEMORY_WARNING_THRESHOLD: 0.9 // 90% of available memory
});

/**
 * Debug and development constants
 * @constant {Object}
 */
export const DEBUG = Object.freeze({
  ENABLED: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  SHOW_HITBOXES: false,
  SHOW_FPS: true,
  LOG_LEVEL: window.location.hostname === 'localhost' ? 'debug' : 'error'
});

/**
 * Validates all constant values are within acceptable ranges
 * @throws {Error} If any constants are invalid
 */
function validateConstants() {
  if (CANVAS.WIDTH <= 0 || CANVAS.HEIGHT <= 0) {
    throw new Error('Canvas dimensions must be positive');
  }
  
  if (PHYSICS.MAX_VELOCITY <= 0) {
    throw new Error('Maximum velocity must be positive');
  }
  
  if (PLAYER.INITIAL_LIVES <= 0) {
    throw new Error('Initial lives must be positive');
  }
  
  if (ENEMY.ROWS <= 0 || ENEMY.COLUMNS <= 0) {
    throw new Error('Enemy grid dimensions must be positive');
  }
  
  if (PROJECTILE.PLAYER.SPEED <= 0 || PROJECTILE.ENEMY.SPEED <= 0) {
    throw new Error('Projectile speeds must be positive');
  }
}

// Validate constants on module load (only in browser environment)
if (typeof window !== 'undefined') {
  validateConstants();
}

/**
 * Export a frozen version of all constants
 */
export default Object.freeze({
  CANVAS,
  PHYSICS,
  PLAYER,
  ENEMY,
  PROJECTILE,
  GAME_STATES,
  SCORING,
  PERFORMANCE,
  DEBUG
});