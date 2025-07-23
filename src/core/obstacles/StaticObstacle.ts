import { BaseObstacle } from './BaseObstacle';

export class StaticObstacle extends BaseObstacle {
  protected updateMovement(delta: number): void {
    // Convert delta from milliseconds to seconds and apply speed
    // Static obstacles just move downward
    this.y += this.speed * (delta / 1000);
  }
}
