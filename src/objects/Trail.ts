import Phaser from 'phaser';
import { GameProperties } from '../config/GameProperties';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  scale: number;
}

export class Trail {
  private scene: Phaser.Scene;
  private points: TrailPoint[] = [];
  private trailObjects: Phaser.GameObjects.Arc[] = [];
  private color: number;
  private lastUpdateTime: number = 0;
  private enabled: boolean;

  constructor(scene: Phaser.Scene, color: number) {
    this.scene = scene;
    this.color = color;
    this.enabled = GameProperties.player.trail.enabled;
    
    if (this.enabled) {
      this.initializeTrail();
    }
  }

  private initializeTrail(): void {
    const trailLength = GameProperties.player.trail.length;
    
    // Initialize trail points
    for (let i = 0; i < trailLength; i++) {
      this.points.push({
        x: 0,
        y: 0,
        alpha: 0,
        scale: 1
      });
    }

    // Create smooth trail objects with gradient effect
    for (let i = 0; i < trailLength; i++) {
      const trail = this.scene.add.circle(0, 0, GameProperties.player.orbSize * 0.7, this.color);
      trail.setVisible(false);
      trail.setDepth(9); // Behind main orbs
      
      // Add soft glow effect for smoother appearance
      trail.setStrokeStyle(3, this.color, 0.3);
      
      this.trailObjects.push(trail);
    }
    
    console.log(`Smooth trail initialized with ${trailLength} segments`);
  }

  public update(currentX: number, currentY: number, time: number): void {
    if (!this.enabled || this.trailObjects.length === 0) return;

    // Update at high frequency for smooth trails
    if (time - this.lastUpdateTime < GameProperties.player.trail.updateFrequency) {
      return;
    }
    this.lastUpdateTime = time;

    const config = GameProperties.player.trail;
    
    // Smooth position interpolation for existing points
    for (let i = this.points.length - 1; i > 0; i--) {
      const current = this.points[i];
      const previous = this.points[i - 1];
      
      // Smooth interpolation instead of direct copy
      const smoothing = config.smoothing;
      current.x = current.x * (1 - smoothing) + previous.x * smoothing;
      current.y = current.y * (1 - smoothing) + previous.y * smoothing;
      current.alpha = Math.max(previous.alpha * config.scaleReduction, config.minAlpha);
      current.scale = Math.max(previous.scale * config.scaleReduction, 0.2);
    }

    // Update front point with current position
    if (this.points.length > 0) {
      const frontPoint = this.points[0];
      
      // Smooth the front point movement too
      if (frontPoint.x === 0 && frontPoint.y === 0) {
        // First update, set directly
        frontPoint.x = currentX;
        frontPoint.y = currentY;
      } else {
        // Smooth interpolation
        const smoothing = 0.3;
        frontPoint.x = frontPoint.x * (1 - smoothing) + currentX * smoothing;
        frontPoint.y = frontPoint.y * (1 - smoothing) + currentY * smoothing;
      }
      
      frontPoint.alpha = config.maxAlpha;
      frontPoint.scale = 1;
    }

    // Update visual trail objects
    this.updateTrailVisuals();
  }

  private updateTrailVisuals(): void {
    for (let i = 0; i < this.trailObjects.length && i < this.points.length; i++) {
      const trail = this.trailObjects[i];
      const point = this.points[i];
      
      if (point.alpha > GameProperties.player.trail.minAlpha && point.x !== 0 && point.y !== 0) {
        // Position the trail segment
        trail.setPosition(point.x, point.y);
        
        // Create smooth fade effect
        const fadeRatio = point.alpha / GameProperties.player.trail.maxAlpha;
        trail.setAlpha(point.alpha);
        
        // Smooth scale transition
        const minScale = 0.3;
        const scale = minScale + (1 - minScale) * point.scale;
        trail.setScale(scale);
        
        // Make visible
        trail.setVisible(true);
        
        // Adjust stroke alpha for softer appearance
        const strokeAlpha = Math.min(fadeRatio * 0.5, 0.3);
        trail.setStrokeStyle(2, this.color, strokeAlpha);
      } else {
        trail.setVisible(false);
      }
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (!enabled) {
      // Hide all trail objects
      this.trailObjects.forEach(trail => trail.setVisible(false));
    }
  }

  public destroy(): void {
    this.trailObjects.forEach(trail => trail.destroy());
    this.trailObjects = [];
    this.points = [];
  }

  public setColor(color: number): void {
    this.color = color;
    this.trailObjects.forEach(trail => trail.setFillStyle(color));
  }

  public reset(): void {
    // Reset all trail points to invisible state
    this.points.forEach(point => {
      point.x = 0;
      point.y = 0;
      point.alpha = 0;
      point.scale = 1;
    });
    
    // Hide all trail objects
    this.trailObjects.forEach(trail => trail.setVisible(false));
    
    // Reset update timer
    this.lastUpdateTime = 0;
  }
}
