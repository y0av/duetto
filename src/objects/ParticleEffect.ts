import Phaser from 'phaser';

export class ParticleEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createCollisionExplosion(x: number, y: number, color: number): void {
    // Create multiple particle systems for a complex effect
    this.createMainExplosion(x, y, color);
    this.createSparkles(x, y, color);
    this.createShockwave(x, y, color);
    this.createGlow(x, y, color);
  }

  private createMainExplosion(x: number, y: number, color: number): void {
    // Main particle burst
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const distance = Phaser.Math.Between(20, 100);
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 6), color);
      
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private createSparkles(x: number, y: number, color: number): void {
    // Smaller sparkle particles
    for (let i = 0; i < 20; i++) {
      const sparkle = this.scene.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      
      this.scene.tweens.add({
        targets: sparkle,
        x: sparkle.x + Phaser.Math.Between(-50, 50),
        y: sparkle.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: Phaser.Math.Between(200, 800),
        ease: 'Power1',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  private createShockwave(x: number, y: number, color: number): void {
    // Expanding ring effect
    const ring = this.scene.add.circle(x, y, 5, color, 0);
    ring.setStrokeStyle(3, color, 0.8);
    
    this.scene.tweens.add({
      targets: ring,
      radius: 150,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }

  private createGlow(x: number, y: number, color: number): void {
    // Glowing orb that fades out
    const glow = this.scene.add.circle(x, y, 30, color, 0.6);
    
    this.scene.tweens.add({
      targets: glow,
      radius: 80,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => glow.destroy()
    });
  }

  public createLevelCompleteEffect(x: number, y: number): void {
    // Celebratory particle effect for level completion
    for (let i = 0; i < 50; i++) {
      const colors = [0x00ff00, 0x00ff88, 0x44ff44, 0xffffff];
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];
      
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(2, 5),
        color
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(100, 200),
        x: particle.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(1000, 1500),
        ease: 'Power1',
        onComplete: () => particle.destroy()
      });
    }
  }
}
