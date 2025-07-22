import { BaseObstacle } from './BaseObstacle';

export class MovingObstacle extends BaseObstacle {
  private horizontalSpeed: number;
  private direction: number; // 1 for right, -1 for left
  private gameWidth: number;
  private minX: number;
  private maxX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, speed: number, gameWidth: number, horizontalSpeed: number = 100, id?: string) {
    super(scene, x, y, width, height, speed, id);
    
    this.gameWidth = gameWidth;
    this.horizontalSpeed = horizontalSpeed;
    this.direction = Math.random() > 0.5 ? 1 : -1; // Random initial direction
    
    // Set movement bounds (keep obstacle on screen)
    this.minX = this.width / 2;
    this.maxX = this.gameWidth - this.width / 2;
    
    // Ensure starting position is within bounds
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
  }

  protected updateMovement(delta: number): void {
    const deltaSeconds = delta / 1000;
    
    // Move downward like static obstacles
    this.y += this.speed * deltaSeconds;
    
    // Move horizontally side to side
    this.x += this.horizontalSpeed * this.direction * deltaSeconds;
    
    // Bounce off screen edges
    if (this.x <= this.minX) {
      this.x = this.minX;
      this.direction = 1; // Change direction to right
    } else if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.direction = -1; // Change direction to left
    }
  }

  // Override setPosition to update bounds when position changes
  public setPosition(x: number, y: number): void {
    super.setPosition(x, y);
    // Ensure position is within horizontal bounds
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
  }
}
