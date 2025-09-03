/**
 * @fileoverview Main Game Controller for Space Invaders
 * 
 * Orchestrates all game systems including entity management, collision detection,
 * input handling, and game state management. Acts as the central hub that connects
 * all core systems together.
 * 
 * Key Features:
 * - Game state management (menu, playing, paused, game over)
 * - Entity lifecycle management
 * - Input processing and game controls
 * - Collision detection and response
 * - Score tracking and level progression
 * 
 * @module core/Game
 */

import { CANVAS, PLAYER, ENEMY, PROJECTILE, GAME_STATES } from '../config/constants.js';
import { ENTITY_TYPES, COLLISION_GROUPS } from '../config/entity-types.js';
import Entity from './Entity.js';
import EntityManager from './EntityManager.js';
import CollisionSystem from './Collision.js';

/**
 * @typedef {Object} GameState
 * @property {string} current - Current game state
 * @property {number} score - Current score
 * @property {number} lives - Remaining lives
 * @property {number} level - Current level
 * @property {boolean} paused - Whether game is paused
 */

/**
 * @typedef {Object} InputState
 * @property {boolean} left - Left arrow key pressed
 * @property {boolean} right - Right arrow key pressed
 * @property {boolean} space - Space bar pressed
 * @property {boolean} escape - Escape key pressed
 */

class Game {
    constructor() {
        // Core systems
        this.entityManager = new EntityManager();
        this.collisionSystem = new CollisionSystem({
            worldBounds: { x: 0, y: 0, width: CANVAS.WIDTH, height: CANVAS.HEIGHT }
        });

        // Game state
        this.state = {
            current: GAME_STATES.MENU,
            score: 0,
            lives: PLAYER.INITIAL_LIVES,
            level: 1,
            paused: false
        };

        // Input handling
        this.input = {
            left: false,
            right: false,
            space: false,
            escape: false
        };

        // Game entities
        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];

        // Timing
        this.lastShot = 0;
        this.enemyMoveTimer = 0;
        this.enemyShootTimer = 0;
        this.enemyDirection = 1; // 1 for right, -1 for left

        // Initialize systems
        this.initialize();
    }

    /**
     * Initialize game systems and set up event handlers
     */
    initialize() {
        this.setupInputHandlers();
        this.collisionSystem.initialize();
        this.startGame();
    }

    /**
     * Set up keyboard input handlers
     */
    setupInputHandlers() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = true;
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = true;
                    event.preventDefault();
                    break;
                case 'Space':
                    this.input.space = true;
                    event.preventDefault();
                    break;
                case 'Escape':
                case 'KeyP':
                    this.input.escape = true;
                    event.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = false;
                    break;
                case 'Space':
                    this.input.space = false;
                    break;
                case 'Escape':
                case 'KeyP':
                    this.input.escape = false;
                    break;
            }
        });
    }

    /**
     * Start a new game
     */
    startGame() {
        this.state.current = GAME_STATES.PLAYING;
        this.state.score = 0;
        this.state.lives = PLAYER.INITIAL_LIVES;
        this.state.level = 1;

        this.createPlayer();
        this.createEnemies();
    }

    /**
     * Create player entity
     */
    createPlayer() {
        this.player = new Entity({
            x: PLAYER.SPAWN.X - PLAYER.SIZE.WIDTH / 2,
            y: PLAYER.SPAWN.Y,
            width: PLAYER.SIZE.WIDTH,
            height: PLAYER.SIZE.HEIGHT,
            speed: PLAYER.MOVEMENT_SPEED,
            type: 'PLAYER'
        });

        this.entityManager.addEntity(this.player);
    }

    /**
     * Create enemy grid
     */
    createEnemies() {
        this.enemies = [];
        const startX = 100;
        const startY = 100;

        for (let row = 0; row < ENEMY.ROWS; row++) {
            for (let col = 0; col < ENEMY.COLUMNS; col++) {
                const enemy = new Entity({
                    x: startX + col * ENEMY.SPACING.HORIZONTAL,
                    y: startY + row * ENEMY.SPACING.VERTICAL,
                    width: 32,
                    height: 32,
                    speed: ENEMY.MOVEMENT.SPEED,
                    type: 'ENEMY_BASIC'
                });

                this.enemies.push(enemy);
                this.entityManager.addEntity(enemy);
            }
        }
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (this.state.current !== GAME_STATES.PLAYING || this.state.paused) {
            return;
        }

        // Handle input
        this.handleInput(deltaTime);

        // Update entities
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);

        // Check collisions
        this.handleCollisions();

        // Clean up inactive entities
        this.cleanupEntities();

        // Check win/lose conditions
        this.checkGameConditions();
    }

    /**
     * Handle player input
     * @param {number} deltaTime - Time elapsed since last update
     */
    handleInput(deltaTime) {
        if (this.input.escape) {
            this.state.paused = !this.state.paused;
            this.input.escape = false;
        }

        if (!this.player || !this.player.active) return;

        // Movement
        if (this.input.left && this.player.x > 0) {
            this.player.x -= this.player.speed * (deltaTime / 1000) * 60;
        }
        if (this.input.right && this.player.x < CANVAS.WIDTH - this.player.width) {
            this.player.x += this.player.speed * (deltaTime / 1000) * 60;
        }

        // Shooting
        if (this.input.space && Date.now() - this.lastShot > PLAYER.SHOOT_COOLDOWN) {
            this.createPlayerBullet();
            this.lastShot = Date.now();
        }
    }

    /**
     * Create player bullet
     */
    createPlayerBullet() {
        if (!this.player || !this.player.active) return;

        const bullet = new Entity({
            x: this.player.x + this.player.width / 2 - PROJECTILE.PLAYER.SIZE.WIDTH / 2,
            y: this.player.y,
            width: PROJECTILE.PLAYER.SIZE.WIDTH,
            height: PROJECTILE.PLAYER.SIZE.HEIGHT,
            speed: PROJECTILE.PLAYER.SPEED,
            type: 'PLAYER_PROJECTILE'
        });

        bullet.setVelocity(0, -1);
        this.playerBullets.push(bullet);
        this.entityManager.addEntity(bullet);
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time elapsed since last update
     */
    updatePlayer(deltaTime) {
        if (this.player && this.player.active) {
            this.player.update(deltaTime);
        }
    }

    /**
     * Update enemy states and movement
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateEnemies(deltaTime) {
        this.enemyMoveTimer += deltaTime;
        this.enemyShootTimer += deltaTime;

        if (this.enemyMoveTimer >= 1000) { // Move every second
            this.moveEnemies();
            this.enemyMoveTimer = 0;
        }

        // Enemy shooting logic
        if (this.enemyShootTimer >= 2000) { // Shoot every 2 seconds
            this.enemyShoot();
            this.enemyShootTimer = 0;
        }

        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.update(deltaTime);
            }
        });
    }

    /**
     * Move enemy formation
     */
    moveEnemies() {
        let shouldMoveDown = false;

        // Check if any enemy hit the edge
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                const newX = enemy.x + (ENEMY.SPACING.HORIZONTAL * this.enemyDirection);
                if (newX <= 0 || newX >= CANVAS.WIDTH - enemy.width) {
                    shouldMoveDown = true;
                }
            }
        });

        if (shouldMoveDown) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                if (enemy.active) {
                    enemy.y += ENEMY.MOVEMENT.DROP_DISTANCE;
                }
            });
        } else {
            this.enemies.forEach(enemy => {
                if (enemy.active) {
                    enemy.x += ENEMY.SPACING.HORIZONTAL * this.enemyDirection;
                }
            });
        }
    }

    /**
     * Handle enemy shooting
     */
    enemyShoot() {
        const activeEnemies = this.enemies.filter(enemy => enemy.active);
        if (activeEnemies.length === 0) return;

        // Find bottom-most enemies (enemies that can shoot)
        const bottomEnemies = [];
        for (let col = 0; col < ENEMY.COLUMNS; col++) {
            let bottomEnemy = null;
            let bottomY = -1;
            
            activeEnemies.forEach(enemy => {
                const enemyCol = Math.floor((enemy.x - 100) / ENEMY.SPACING.HORIZONTAL);
                if (enemyCol === col && enemy.y > bottomY) {
                    bottomY = enemy.y;
                    bottomEnemy = enemy;
                }
            });
            
            if (bottomEnemy) {
                bottomEnemies.push(bottomEnemy);
            }
        }

        // Randomly select 1-3 enemies to shoot
        const shootingCount = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
        for (let i = 0; i < shootingCount; i++) {
            if (bottomEnemies.length > 0) {
                const randomIndex = Math.floor(Math.random() * bottomEnemies.length);
                const shootingEnemy = bottomEnemies.splice(randomIndex, 1)[0];
                this.createEnemyBullet(shootingEnemy);
            }
        }
    }

    /**
     * Create enemy bullet
     * @param {Entity} enemy - Enemy that's shooting
     */
    createEnemyBullet(enemy) {
        const bullet = new Entity({
            x: enemy.x + enemy.width / 2 - PROJECTILE.ENEMY.SIZE.WIDTH / 2,
            y: enemy.y + enemy.height,
            width: PROJECTILE.ENEMY.SIZE.WIDTH,
            height: PROJECTILE.ENEMY.SIZE.HEIGHT,
            speed: PROJECTILE.ENEMY.SPEED,
            type: 'ENEMY_PROJECTILE'
        });

        bullet.setVelocity(0, 1); // Shoot downward
        this.enemyBullets.push(bullet);
        this.entityManager.addEntity(bullet);
    }

    /**
     * Update projectile states
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateProjectiles(deltaTime) {
        // Update player bullets
        this.playerBullets.forEach(bullet => {
            if (bullet.active) {
                bullet.update(deltaTime);
                if (bullet.y < -bullet.height) {
                    bullet.deactivate();
                }
            }
        });

        // Update enemy bullets
        this.enemyBullets.forEach(bullet => {
            if (bullet.active) {
                bullet.update(deltaTime);
                if (bullet.y > CANVAS.HEIGHT) {
                    bullet.deactivate();
                }
            }
        });
    }

    /**
     * Handle collision detection and response
     */
    handleCollisions() {
        const allEntities = [
            this.player,
            ...this.enemies,
            ...this.playerBullets,
            ...this.enemyBullets
        ].filter(entity => entity && entity.active);

        const collisions = this.collisionSystem.update(allEntities);

        collisions.forEach(collision => {
            this.handleCollision(collision.entity1, collision.entity2);
        });
    }

    /**
     * Handle specific collision between two entities
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     */
    handleCollision(entity1, entity2) {
        // Player bullet hits enemy
        if ((entity1.type === 'PLAYER_PROJECTILE' && entity2.type === 'ENEMY_BASIC') ||
            (entity1.type === 'ENEMY_BASIC' && entity2.type === 'PLAYER_PROJECTILE')) {
            
            const bullet = entity1.type === 'PLAYER_PROJECTILE' ? entity1 : entity2;
            const enemy = entity1.type === 'ENEMY_BASIC' ? entity1 : entity2;
            
            bullet.deactivate();
            enemy.deactivate();
            this.state.score += 10;
        }

        // Enemy bullet hits player
        if ((entity1.type === 'PLAYER' && entity2.type === 'ENEMY_PROJECTILE') ||
            (entity1.type === 'ENEMY_PROJECTILE' && entity2.type === 'PLAYER')) {
            
            const bullet = entity1.type === 'ENEMY_PROJECTILE' ? entity1 : entity2;
            
            bullet.deactivate();
            this.state.lives--;
            if (this.state.lives <= 0) {
                this.gameOver();
            } else {
                this.resetPlayerPosition();
            }
        }

        // Enemy hits player
        if ((entity1.type === 'PLAYER' && entity2.type === 'ENEMY_BASIC') ||
            (entity1.type === 'ENEMY_BASIC' && entity2.type === 'PLAYER')) {
            
            this.state.lives--;
            if (this.state.lives <= 0) {
                this.gameOver();
            } else {
                this.resetPlayerPosition();
            }
        }
    }

    /**
     * Clean up inactive entities
     */
    cleanupEntities() {
        this.playerBullets = this.playerBullets.filter(bullet => {
            if (!bullet.active) {
                this.entityManager.removeEntity(bullet.id);
                return false;
            }
            return true;
        });

        this.enemyBullets = this.enemyBullets.filter(bullet => {
            if (!bullet.active) {
                this.entityManager.removeEntity(bullet.id);
                return false;
            }
            return true;
        });

        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.active) {
                this.entityManager.removeEntity(enemy.id);
                return false;
            }
            return true;
        });
    }

    /**
     * Check for win/lose conditions
     */
    checkGameConditions() {
        // Check if all enemies destroyed
        if (this.enemies.filter(enemy => enemy.active).length === 0) {
            this.nextLevel();
        }

        // Check if enemies reached player
        const activeEnemies = this.enemies.filter(enemy => enemy.active);
        const enemyReachedBottom = activeEnemies.some(enemy => 
            enemy.y + enemy.height >= this.player.y
        );

        if (enemyReachedBottom) {
            this.gameOver();
        }
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        this.state.level++;
        this.createEnemies();
    }

    /**
     * Reset player position
     */
    resetPlayerPosition() {
        if (this.player) {
            this.player.setPosition(
                PLAYER.SPAWN.X - PLAYER.SIZE.WIDTH / 2,
                PLAYER.SPAWN.Y
            );
        }
    }

    /**
     * End the game
     */
    gameOver() {
        this.state.current = GAME_STATES.GAME_OVER;
    }

    /**
     * Get all entities for rendering
     * @returns {Array<Entity>} All active entities
     */
    getAllEntities() {
        return [
            this.player,
            ...this.enemies,
            ...this.playerBullets,
            ...this.enemyBullets
        ].filter(entity => entity && entity.active);
    }

    /**
     * Get current game state
     * @returns {GameState} Current game state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Pause/unpause the game
     */
    togglePause() {
        this.state.paused = !this.state.paused;
    }
}

export default Game;
