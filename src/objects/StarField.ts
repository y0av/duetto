import Phaser from 'phaser';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  color: number;
  sprite: Phaser.GameObjects.Arc;
}

export class StarField {
  private scene: Phaser.Scene;
  private stars: Star[] = [];
  private container: Phaser.GameObjects.Container;
  private starCount: number = 200;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(-100); // Behind everything
    this.createStars();
  }

  private createStars(): void {
    const { width, height } = this.scene.cameras.main;

    for (let i = 0; i < this.starCount; i++) {
      const star: Star = {
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(0.5, 3),
        speed: Phaser.Math.FloatBetween(10, 50),
        brightness: Phaser.Math.FloatBetween(0.3, 1),
        color: this.getStarColor(),
        sprite: this.scene.add.circle(0, 0, 1, 0xffffff)
      };

      star.sprite = this.scene.add.circle(star.x, star.y, star.size, star.color, star.brightness);
      
      this.container.add(star.sprite);
      this.stars.push(star);
    }
  }

  private getStarColor(): number {
    const colors = [
      0xffffff, // White
      0xffeedd, // Warm white
      0xddddff, // Cool white
      0xffdddd, // Pink
      0xddffdd, // Green
      0xffffdd, // Yellow
      0xddffff  // Cyan
    ];
    return colors[Phaser.Math.Between(0, colors.length - 1)];
  }

  public update(delta: number): void {
    const { width, height } = this.scene.cameras.main;

    this.stars.forEach(star => {
      // Move stars downward for parallax effect
      star.y += star.speed * (delta / 1000);
      
      // Reset stars that go off screen
      if (star.y > height + 10) {
        star.y = -10;
        star.x = Phaser.Math.Between(0, width);
      }

      // Update sprite position
      star.sprite.setPosition(star.x, star.y);

      // Add subtle twinkling effect
      const twinkle = Math.sin(Date.now() * 0.001 * star.speed * 0.1) * 0.2;
      star.sprite.setAlpha(star.brightness + twinkle);
    });
  }

  public destroy(): void {
    this.container.destroy();
  }
}
