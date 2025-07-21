import Phaser from 'phaser';
import { GameProperties } from '../config/GameProperties';

export class ParticleEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createCollisionExplosion(x: number, y: number, color: number): void {
    // Create massive particle explosion with screen-wide effects
    this.createMainExplosion(x, y, color);
    this.createScreenWideBlast(x, y, color);
    this.createSparkles(x, y, color);
    this.createMultipleShockwaves(x, y, color);
    this.createGlow(x, y, color);
    this.createDebris(x, y, color);
    this.createLightningEffect(x, y, color);
  }

  private createMainExplosion(x: number, y: number, color: number): void {
    // Massive particle burst
    const burstCount = GameProperties.visual.particles.collision.mainBurst;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const distance = Phaser.Math.Between(50, 300); // Increased range
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(3, 12), color); // Bigger particles
      
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(500, 1200), // Longer duration
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private createScreenWideBlast(x: number, y: number, color: number): void {
    // Create particles that blast across the entire screen
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    const blastCount = GameProperties.visual.particles.collision.screenWideBlast;
    
    for (let i = 0; i < blastCount; i++) {
      const angle = (i / blastCount) * Math.PI * 2;
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 8), color);
      
      // Calculate target position at screen edge
      const targetX = x + Math.cos(angle) * screenWidth;
      const targetY = y + Math.sin(angle) * screenHeight;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(800, 1500),
        ease: 'Power1',
        onComplete: () => particle.destroy()
      });
    }
  }

  private createSparkles(x: number, y: number, _color: number): void {
    // Massive sparkle particles explosion
    const sparkleCount = GameProperties.visual.particles.collision.sparkles;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = this.scene.add.circle(
        x + Phaser.Math.Between(-50, 50),
        y + Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(1, 5), // Bigger sparkles
        0xffffff
      );
      
      this.scene.tweens.add({
        targets: sparkle,
        x: sparkle.x + Phaser.Math.Between(-200, 200), // Wider spread
        y: sparkle.y + Phaser.Math.Between(-200, 200),
        alpha: 0,
        duration: Phaser.Math.Between(400, 1200), // Longer duration
        ease: 'Power1',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  private createMultipleShockwaves(x: number, y: number, color: number): void {
    // Multiple expanding ring effects
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const ring = this.scene.add.circle(x, y, 5, color, 0);
        ring.setStrokeStyle(4 + i, color, 0.8 - (i * 0.15));
        
        this.scene.tweens.add({
          targets: ring,
          radius: 300 + (i * 100), // Bigger rings
          alpha: 0,
          duration: 800 + (i * 200),
          ease: 'Power2',
          onComplete: () => ring.destroy()
        });
      }, i * 100);
    }
  }

  private createDebris(x: number, y: number, color: number): void {
    // Flying debris particles
    for (let i = 0; i < 40; i++) {
      const debris = this.scene.add.rectangle(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(2, 6),
        Phaser.Math.Between(2, 6),
        color
      );
      
      debris.setRotation(Phaser.Math.Between(0, Math.PI * 2));
      
      this.scene.tweens.add({
        targets: debris,
        x: debris.x + Phaser.Math.Between(-300, 300),
        y: debris.y + Phaser.Math.Between(-300, 300),
        rotation: debris.rotation + Phaser.Math.Between(-Math.PI * 4, Math.PI * 4),
        alpha: 0,
        duration: Phaser.Math.Between(600, 1400),
        ease: 'Power1',
        onComplete: () => debris.destroy()
      });
    }
  }

  private createLightningEffect(x: number, y: number, _color: number): void {
    // Lightning-like effects radiating outward
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const length = Phaser.Math.Between(100, 250);
      
      const lightning = this.scene.add.line(x, y, 0, 0, 
        Math.cos(angle) * length, Math.sin(angle) * length, 0xffffff);
      lightning.setStrokeStyle(3, 0xffffff, 0.8);
      lightning.setOrigin(0, 0);
      
      this.scene.tweens.add({
        targets: lightning,
        alpha: 0,
        duration: Phaser.Math.Between(200, 500),
        ease: 'Power2',
        onComplete: () => lightning.destroy()
      });
    }
  }

  private createShockwave(x: number, y: number, color: number): void {
    // Expanding ring effect (kept for backward compatibility)
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
    // Massive glowing orb that fades out
    const glow = this.scene.add.circle(x, y, 60, color, 0.4); // Bigger and more visible
    
    this.scene.tweens.add({
      targets: glow,
      radius: 150, // Expands while fading
      alpha: 0,
      duration: 1000, // Longer duration
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
