import Phaser from 'phaser';
import type { GameConfig } from '../types/GameTypes';
import { ParticleEffect } from '../effects/ParticleEffect';
import { Trail } from '../effects/Trail';
import { GameProperties } from '../config/GameProperties';
import type { BaseObstacle } from '../core/obstacles/BaseObstacle';

export class Player {
  private scene: Phaser.Scene;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private angle: number = 0;
  private rotationSpeed: number;
  private redOrb!: Phaser.GameObjects.Arc;
  private blueOrb!: Phaser.GameObjects.Arc;
  private redTrail!: Trail;
  private blueTrail!: Trail;
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
    this.createTrails();
    this.updateOrbPositions();
  }

  private createOrbs(): void {
    // Create red orb with glow effect
    this.redOrb = this.scene.add.circle(0, 0, GameProperties.player.orbSize, GameProperties.player.redOrbColor);
    this.redOrb.setStrokeStyle(3, GameProperties.player.redOrbGlow, GameProperties.player.glowIntensity);
    this.redOrb.setDepth(10); // Set orbs at depth 10
    
    // Create blue orb with glow effect
    this.blueOrb = this.scene.add.circle(0, 0, GameProperties.player.orbSize, GameProperties.player.blueOrbColor);
    this.blueOrb.setStrokeStyle(3, GameProperties.player.blueOrbGlow, GameProperties.player.glowIntensity);
    this.blueOrb.setDepth(10); // Set orbs at depth 10

    // Add subtle pulsing animation
    this.scene.tweens.add({
      targets: [this.redOrb, this.blueOrb],
      scaleX: GameProperties.player.pulseScale,
      scaleY: GameProperties.player.pulseScale,
      yoyo: true,
      repeat: -1,
      duration: GameProperties.player.pulseSpeed,
      ease: 'Sine.easeInOut'
    });
  }

  private createTrails(): void {
    // Create trail effects for both orbs
    this.redTrail = new Trail(this.scene, GameProperties.player.redOrbColor);
    this.blueTrail = new Trail(this.scene, GameProperties.player.blueOrbColor);
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
    
    // Update trails with current orb positions
    const currentTime = this.scene.time.now;
    this.redTrail.update(this.redOrb.x, this.redOrb.y, currentTime);
    this.blueTrail.update(this.blueOrb.x, this.blueOrb.y, currentTime);
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

  public checkCollision(obstacle: BaseObstacle): boolean {
    const obstacleBounds = obstacle.getBounds();
    
    // Check collision with red orb
    const redOrbBounds = this.redOrb.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(redOrbBounds, obstacleBounds)) {
      // Calculate the exact collision point on the obstacle's edge
      const collisionPoint = this.calculateCollisionPoint(this.redOrb.x, this.redOrb.y, obstacle);
      
      this.createCollisionEffect(this.redOrb.x, this.redOrb.y, 0xff4444);
      obstacle.setTint(0xff4444);
      
      // Add permanent color splash to obstacle at the exact collision point
      obstacle.addColorSplash(collisionPoint.x, collisionPoint.y, GameProperties.player.redOrbColor);
      
      return true;
    }

    // Check collision with blue orb
    const blueOrbBounds = this.blueOrb.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(blueOrbBounds, obstacleBounds)) {
      // Calculate the exact collision point on the obstacle's edge
      const collisionPoint = this.calculateCollisionPoint(this.blueOrb.x, this.blueOrb.y, obstacle);
      
      this.createCollisionEffect(this.blueOrb.x, this.blueOrb.y, 0x4444ff);
      obstacle.setTint(0x4444ff);
      
      // Add permanent color splash to obstacle at the exact collision point
      obstacle.addColorSplash(collisionPoint.x, collisionPoint.y, GameProperties.player.blueOrbColor);
      
      return true;
    }

    return false;
  }

  private calculateCollisionPoint(orbX: number, orbY: number, obstacle: BaseObstacle): { x: number, y: number } {
    // Get obstacle bounds
    const obstacleLeft = obstacle.x - obstacle.width / 2;
    const obstacleRight = obstacle.x + obstacle.width / 2;
    const obstacleTop = obstacle.y - obstacle.height / 2;
    const obstacleBottom = obstacle.y + obstacle.height / 2;
    
    // Get orb radius from game properties
    const orbRadius = GameProperties.player.orbSize;
    
    // Find the closest point on the obstacle's rectangle to the orb center
    let closestX = Math.max(obstacleLeft, Math.min(orbX, obstacleRight));
    let closestY = Math.max(obstacleTop, Math.min(orbY, obstacleBottom));
    
    // Calculate the direction vector from orb center to closest point on rectangle
    const dx = closestX - orbX;
    const dy = closestY - orbY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If distance is 0 (orb center is inside rectangle), find nearest edge
    if (distance === 0) {
      // Calculate distances to each edge
      const distToLeft = orbX - obstacleLeft;
      const distToRight = obstacleRight - orbX;
      const distToTop = orbY - obstacleTop;
      const distToBottom = obstacleBottom - orbY;
      
      // Find the minimum distance to determine which edge to project to
      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
      
      if (minDist === distToLeft) {
        return { x: obstacleLeft, y: orbY };
      } else if (minDist === distToRight) {
        return { x: obstacleRight, y: orbY };
      } else if (minDist === distToTop) {
        return { x: orbX, y: obstacleTop };
      } else {
        return { x: orbX, y: obstacleBottom };
      }
    }
    
    // The collision point is where the line from orb center to closest rectangle point
    // intersects the orb's circle boundary
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Move from orb center towards the rectangle by the orb's radius
    const collisionX = orbX + normalizedDx * orbRadius;
    const collisionY = orbY + normalizedDy * orbRadius;
    
    // Ensure the collision point is actually on the rectangle's edge
    const clampedCollisionX = Math.max(obstacleLeft, Math.min(collisionX, obstacleRight));
    const clampedCollisionY = Math.max(obstacleTop, Math.min(collisionY, obstacleBottom));
    
    return { x: clampedCollisionX, y: clampedCollisionY };
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
    
    // Reset trails
    this.redTrail.reset();
    this.blueTrail.reset();
  }

  public destroy(): void {
    // Clean up trails
    if (this.redTrail) {
      this.redTrail.destroy();
    }
    if (this.blueTrail) {
      this.blueTrail.destroy();
    }
    
    // Destroy orbs
    if (this.redOrb) {
      this.redOrb.destroy();
    }
    if (this.blueOrb) {
      this.blueOrb.destroy();
    }
  }

  public setTrailEnabled(enabled: boolean): void {
    if (this.redTrail) {
      this.redTrail.setEnabled(enabled);
    }
    if (this.blueTrail) {
      this.blueTrail.setEnabled(enabled);
    }
  }

  public getRedOrb(): Phaser.GameObjects.Arc {
    return this.redOrb;
  }

  public getBlueOrb(): Phaser.GameObjects.Arc {
    return this.blueOrb;
  }
}
