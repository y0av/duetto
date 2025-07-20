import Phaser from 'phaser';
import { Obstacle } from './Obstacle';
import { Player } from './Player';
import type { LevelData, ObstacleData } from '../types/GameTypes';

export class ObstacleManager {
  private scene: Phaser.Scene;
  private obstacles: Obstacle[] = [];
  private levelData: LevelData | null = null;
  private spawnTimer: number = 0;
  private currentObstacleIndex: number = 0;
  private gameWidth: number;
  private gameHeight: number;

  constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number) {
    this.scene = scene;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public loadLevel(levelData: LevelData): void {
    this.levelData = levelData;
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
    
    if (obstacleData.type === 'single') {
      const obstacle = new Obstacle(
        this.scene,
        obstacleData.x,
        -obstacleData.height / 2, // Start above screen
        obstacleData.width,
        obstacleData.height,
        speed
      );
      this.obstacles.push(obstacle);
    } else if (obstacleData.type === 'double') {
      // Create two obstacles with a gap
      const gapSize = 120; // Size of the gap between obstacles
      const leftWidth = obstacleData.x - gapSize / 2;
      const rightWidth = this.gameWidth - (obstacleData.x + gapSize / 2);

      if (leftWidth > 20) {
        const leftObstacle = new Obstacle(
          this.scene,
          leftWidth / 2,
          -obstacleData.height / 2,
          leftWidth,
          obstacleData.height,
          speed
        );
        this.obstacles.push(leftObstacle);
      }

      if (rightWidth > 20) {
        const rightObstacle = new Obstacle(
          this.scene,
          obstacleData.x + gapSize / 2 + rightWidth / 2,
          -obstacleData.height / 2,
          rightWidth,
          obstacleData.height,
          speed
        );
        this.obstacles.push(rightObstacle);
      }
    } else if (obstacleData.type === 'triple') {
      // Create three obstacles with two gaps
      const gapSize = 80;
      const centerX = this.gameWidth / 2;
      const leftX = centerX - gapSize - obstacleData.width / 2;
      const rightX = centerX + gapSize + obstacleData.width / 2;

      // Left obstacle
      if (leftX - obstacleData.width / 2 > 0) {
        const leftObstacle = new Obstacle(
          this.scene,
          leftX,
          -obstacleData.height / 2,
          obstacleData.width,
          obstacleData.height,
          speed
        );
        this.obstacles.push(leftObstacle);
      }

      // Center obstacle
      const centerObstacle = new Obstacle(
        this.scene,
        centerX,
        -obstacleData.height / 2,
        obstacleData.width,
        obstacleData.height,
        speed
      );
      this.obstacles.push(centerObstacle);

      // Right obstacle
      if (rightX + obstacleData.width / 2 < this.gameWidth) {
        const rightObstacle = new Obstacle(
          this.scene,
          rightX,
          -obstacleData.height / 2,
          obstacleData.width,
          obstacleData.height,
          speed
        );
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

  public getActiveObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
