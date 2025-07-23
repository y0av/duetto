import { StaticObstacle } from './StaticObstacle';

// Export the StaticObstacle as Obstacle for backward compatibility
export class Obstacle extends StaticObstacle {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, speed: number, id?: string) {
    super(scene, x, y, width, height, speed, id);
  }
}

// Re-export types for backward compatibility
export type { ColorSplash } from './BaseObstacle';
