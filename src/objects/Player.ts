import Phaser from 'phaser';
import type { GameConfig } from '../types/GameTypes';
import { Obstacle } from './Obstacle';
import { ParticleEffect } from './ParticleEffect';

export class Player {
  private scene: Phaser.Scene;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private angle: number = 0;
  private rotationSpeed: number;
  private redOrb!: Phaser.GameObjects.Arc;
  private blueOrb!: Phaser.GameObjects.Arc;
  private isRotatingLeft: boolean = false;
  private isRotatingRight: boolean = false;
  private particleEffect: ParticleEffect;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.centerX = config.centerX;
    this.centerY = config.centerY;
    this.radius = config.orbRadius;
    this.rotationSpeed = config.rotationSpeed;
    this.particleEffect = new ParticleEffect(scene);

    this.createOrbs();
    this.updateOrbPositions();
  }

  private createOrbs(): void {
    // Create red orb with glow effect
    this.redOrb = this.scene.add.circle(0, 0, 15, 0xff3333);
    this.redOrb.setStrokeStyle(3, 0xff6666, 0.8);
    
    // Create blue orb with glow effect
    this.blueOrb = this.scene.add.circle(0, 0, 15, 0x3333ff);
    this.blueOrb.setStrokeStyle(3, 0x6666ff, 0.8);

    // Add subtle pulsing animation
    this.scene.tweens.add({
      targets: [this.redOrb, this.blueOrb],
      scaleX: 1.1,
      scaleY: 1.1,
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });
  }

  public startRotation(direction: 'left' | 'right'): void {
    if (direction === 'left') {
      this.isRotatingLeft = true;
      this.isRotatingRight = false;
    } else {
      this.isRotatingLeft = false;
      this.isRotatingRight = true;
    }
  }

  public stopRotation(): void {
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
  }

  public update(delta: number): void {
    // Update rotation based on input
    if (this.isRotatingLeft) {
      this.angle -= this.rotationSpeed * delta;
    } else if (this.isRotatingRight) {
      this.angle += this.rotationSpeed * delta;
    }

    // Normalize angle
    this.angle = this.angle % (Math.PI * 2);

    this.updateOrbPositions();
  }

  private updateOrbPositions(): void {
    // Red orb position
    const redX = this.centerX + Math.cos(this.angle) * this.radius;
    const redY = this.centerY + Math.sin(this.angle) * this.radius;
    this.redOrb.setPosition(redX, redY);

    // Blue orb position (opposite side)
    const blueX = this.centerX + Math.cos(this.angle + Math.PI) * this.radius;
    const blueY = this.centerY + Math.sin(this.angle + Math.PI) * this.radius;
    this.blueOrb.setPosition(blueX, blueY);
  }

  public checkCollision(obstacle: Obstacle): boolean {
    const obstacleBounds = obstacle.getBounds();
    
    // Check collision with red orb
    const redOrbBounds = this.redOrb.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(redOrbBounds, obstacleBounds)) {
      this.createCollisionEffect(this.redOrb.x, this.redOrb.y, 0xff4444);
      obstacle.setTint(0xff4444);
      return true;
    }

    // Check collision with blue orb
    const blueOrbBounds = this.blueOrb.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(blueOrbBounds, obstacleBounds)) {
      this.createCollisionEffect(this.blueOrb.x, this.blueOrb.y, 0x4444ff);
      obstacle.setTint(0x4444ff);
      return true;
    }

    return false;
  }

  private createCollisionEffect(x: number, y: number, color: number): void {
    // Use the new particle effect system
    this.particleEffect.createCollisionExplosion(x, y, color);
  }

  public reset(): void {
    this.angle = 0;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.updateOrbPositions();
  }

  public getRedOrb(): Phaser.GameObjects.Arc {
    return this.redOrb;
  }

  public getBlueOrb(): Phaser.GameObjects.Arc {
    return this.blueOrb;
  }

  public destroy(): void {
    this.redOrb.destroy();
    this.blueOrb.destroy();
  }
}
