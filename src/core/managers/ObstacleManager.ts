import Phaser from 'phaser';
import { Obstacle } from '../obstacles/Obstacle';
import { MovingObstacle } from '../obstacles/MovingObstacle';
import { BaseObstacle } from '../obstacles/BaseObstacle';
import { Player } from '../../objects/Player';
import type { LevelData, ObstacleData } from '../../types/GameTypes';

export class ObstacleManager {
  private scene: Phaser.Scene;
  private obstacles: BaseObstacle[] = [];
  private levelData: LevelData | null = null;
  private spawnTimer: number = 0;
  private currentObstacleIndex: number = 0;
  private gameWidth: number;
  private gameHeight: number;
  private currentLevel: number = 1;

  constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number) {
    this.scene = scene;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public loadLevel(levelData: LevelData, levelNumber: number = 1): void {
    this.levelData = levelData;
    this.currentLevel = levelNumber;
    this.currentObstacleIndex = 0;
    this.spawnTimer = 0;
    this.clearAllObstacles();
  }

  public update(delta: number): void {
    if (!this.levelData) return;

    // Update spawn timer
    this.spawnTimer += delta;

    // Check if we should spawn the next obstacle
    if (this.currentObstacleIndex < this.levelData.obstacles.length) {
      const nextObstacle = this.levelData.obstacles[this.currentObstacleIndex];
      if (this.spawnTimer >= nextObstacle.delay) {
        console.log(`Spawning obstacle ${this.currentObstacleIndex} at time ${this.spawnTimer}`);
        this.spawnObstacle(nextObstacle);
        this.currentObstacleIndex++;
      }
    }

    // Update all active obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(delta);

      // Remove obstacles that are off screen
      if (obstacle.isOffScreen(this.gameHeight)) {
        console.log('Obstacle went off screen');
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private spawnObstacle(obstacleData: ObstacleData): void {
    const speed = this.levelData?.obstacleSpeed || 100;
    const levelId = `level_${this.currentLevel}`;
    
    // Get responsive scaling factor
    const scale = Math.min(this.gameWidth / 1920, this.gameHeight / 1080);
    
    if (obstacleData.type === 'single') {
      const obstacleId = `single_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
      const obstacle = new Obstacle(
        this.scene,
        obstacleData.x,
        -obstacleData.height / 2, // Start above screen
        obstacleData.width,
        obstacleData.height,
        speed,
        obstacleId
      );
      
      // Load existing splash data
      obstacle.loadSplashesFromStorage(levelId);
      
      this.obstacles.push(obstacle);
    } else if (obstacleData.type === 'moving-single') {
      const obstacleId = `moving_single_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
      const horizontalSpeed = obstacleData.horizontalSpeed || 100;
      const obstacle = new MovingObstacle(
        this.scene,
        obstacleData.x,
        -obstacleData.height / 2, // Start above screen
        obstacleData.width,
        obstacleData.height,
        speed,
        this.gameWidth,
        horizontalSpeed,
        obstacleId
      );
      
      // Load existing splash data
      obstacle.loadSplashesFromStorage(levelId);
      
      this.obstacles.push(obstacle);
    } else if (obstacleData.type === 'double') {
      // Create two obstacles with a gap - scale gap for higher resolution
      const gapSize = Math.max(250 * scale, 180); // Increased gap for larger orb radius
      const leftWidth = obstacleData.x - gapSize / 2;
      const rightWidth = this.gameWidth - (obstacleData.x + gapSize / 2);

      if (leftWidth > 40 * scale) {
        const leftId = `double_left_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
        const leftObstacle = new Obstacle(
          this.scene,
          leftWidth / 2,
          -obstacleData.height / 2,
          leftWidth,
          obstacleData.height,
          speed,
          leftId
        );
        
        // Load existing splash data
        leftObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(leftObstacle);
      }

      if (rightWidth > 40 * scale) {
        const rightId = `double_right_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
        const rightObstacle = new Obstacle(
          this.scene,
          obstacleData.x + gapSize / 2 + rightWidth / 2,
          -obstacleData.height / 2,
          rightWidth,
          obstacleData.height,
          speed,
          rightId
        );
        
        // Load existing splash data
        rightObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(rightObstacle);
      }
    } else if (obstacleData.type === 'triple') {
      // Create three obstacles with two gaps - scale for higher resolution
      const gapSize = Math.max(180 * scale, 120); // Increased gap size for larger orbs
      const centerX = this.gameWidth / 2;
      const leftX = centerX - gapSize - obstacleData.width / 2;
      const rightX = centerX + gapSize + obstacleData.width / 2;

      // Left obstacle
      if (leftX - obstacleData.width / 2 > 0) {
        const leftId = `triple_left_${this.currentObstacleIndex}_${obstacleData.width}_${obstacleData.height}`;
        const leftObstacle = new Obstacle(
          this.scene,
          leftX,
          -obstacleData.height / 2,
          obstacleData.width,
          obstacleData.height,
          speed,
          leftId
        );
        
        // Load existing splash data
        leftObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(leftObstacle);
      }

      // Center obstacle
      const centerId = `triple_center_${this.currentObstacleIndex}_${obstacleData.width}_${obstacleData.height}`;
      const centerObstacle = new Obstacle(
        this.scene,
        centerX,
        -obstacleData.height / 2,
        obstacleData.width,
        obstacleData.height,
        speed,
        centerId
      );
      
      // Load existing splash data
      centerObstacle.loadSplashesFromStorage(levelId);
      
      this.obstacles.push(centerObstacle);

      // Right obstacle
      if (rightX + obstacleData.width / 2 < this.gameWidth) {
        const rightId = `triple_right_${this.currentObstacleIndex}_${obstacleData.width}_${obstacleData.height}`;
        const rightObstacle = new Obstacle(
          this.scene,
          rightX,
          -obstacleData.height / 2,
          obstacleData.width,
          obstacleData.height,
          speed,
          rightId
        );
        
        // Load existing splash data
        rightObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(rightObstacle);
      }
    } else if (obstacleData.type === 'moving-double') {
      // Create two moving obstacles with a gap
      const gapSize = Math.max(250 * scale, 180); // Increased gap for larger orb radius
      const leftWidth = obstacleData.x - gapSize / 2;
      const rightWidth = this.gameWidth - (obstacleData.x + gapSize / 2);
      const horizontalSpeed = obstacleData.horizontalSpeed || 100;

      if (leftWidth > 40 * scale) {
        const leftId = `moving_double_left_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
        const leftObstacle = new MovingObstacle(
          this.scene,
          leftWidth / 2,
          -obstacleData.height / 2,
          leftWidth,
          obstacleData.height,
          speed,
          this.gameWidth,
          horizontalSpeed,
          leftId
        );
        
        // Load existing splash data
        leftObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(leftObstacle);
      }

      if (rightWidth > 40 * scale) {
        const rightId = `moving_double_right_${this.currentObstacleIndex}_${obstacleData.x}_${obstacleData.height}`;
        const rightObstacle = new MovingObstacle(
          this.scene,
          obstacleData.x + gapSize / 2 + rightWidth / 2,
          -obstacleData.height / 2,
          rightWidth,
          obstacleData.height,
          speed,
          this.gameWidth,
          horizontalSpeed,
          rightId
        );
        
        // Load existing splash data
        rightObstacle.loadSplashesFromStorage(levelId);
        
        this.obstacles.push(rightObstacle);
      }
    }
  }

  public checkCollisions(player: Player): boolean {
    for (const obstacle of this.obstacles) {
      if (player.checkCollision(obstacle)) {
        return true;
      }
    }
    return false;
  }

  public clearAllObstacles(): void {
    for (const obstacle of this.obstacles) {
      obstacle.destroy();
    }
    this.obstacles = [];
  }

  public isLevelComplete(): boolean {
    return (
      this.levelData !== null &&
      this.currentObstacleIndex >= this.levelData.obstacles.length &&
      this.obstacles.length === 0
    );
  }

  public getActiveObstacles(): BaseObstacle[] {
    return this.obstacles;
  }
}
