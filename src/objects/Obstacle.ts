import Phaser from 'phaser';

export class Obstacle {
  private scene: Phaser.Scene;
  private shape: Phaser.GameObjects.Rectangle;
  private speed: number;
  public width: number;
  public height: number;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, speed: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.shape = this.scene.add.rectangle(x, y, width, height, 0xffffff);
    this.shape.setStrokeStyle(2, 0xcccccc);
  }

  public update(delta: number): void {
    // Convert delta from milliseconds to seconds and apply speed
    this.y += this.speed * (delta / 1000);
    this.shape.setPosition(this.x, this.y);
  }

  public isOffScreen(screenHeight: number): boolean {
    return this.y - this.height / 2 > screenHeight;
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return this.shape.getBounds();
  }

  public setTint(color: number): void {
    this.shape.setFillStyle(color);
  }

  public destroy(): void {
    this.shape.destroy();
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.shape.setPosition(x, y);
  }

  public getGameObject(): Phaser.GameObjects.Rectangle {
    return this.shape;
  }
}
