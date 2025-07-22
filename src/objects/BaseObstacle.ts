import Phaser from 'phaser';
import { GameStateManager, type ColorSplashData } from './GameStateManager';

export interface ColorSplash {
  x: number; // Relative position on obstacle (0-1)
  y: number; // Relative position on obstacle (0-1)
  color: number;
  size: number;
  alpha: number;
  visualObjects: { obj: Phaser.GameObjects.Arc; relativeX: number; relativeY: number }[]; // Store relative positions
}

export abstract class BaseObstacle {
  protected scene: Phaser.Scene;
  protected shape: Phaser.GameObjects.Rectangle;
  protected speed: number;
  protected colorSplashes: ColorSplash[] = [];
  protected splashObjects: Phaser.GameObjects.Arc[] = [];
  protected obstacleId: string; // Unique identifier
  protected maskGraphics: Phaser.GameObjects.Graphics; // For clipping splashes
  protected splashContainer: Phaser.GameObjects.Container; // Container for masked splashes
  public width: number;
  public height: number;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, speed: number, id?: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.obstacleId = id || `obstacle_${x}_${y}_${width}_${height}_${Date.now()}`; // Generate unique ID

    this.shape = this.scene.add.rectangle(x, y, width, height, 0xffffff);
    this.shape.setStrokeStyle(2, 0xcccccc);

    // Create container for splashes
    this.splashContainer = this.scene.add.container(x, y);
    this.splashContainer.setDepth(7); // Just above obstacles but below orbs

    // Create mask graphics for clipping splashes to obstacle bounds
    this.maskGraphics = this.scene.add.graphics();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(x - width / 2, y - height / 2, width, height);
    
    // Apply mask to splash container
    const mask = this.maskGraphics.createGeometryMask();
    this.splashContainer.setMask(mask);
  }

  public update(delta: number): void {
    // Update position based on movement behavior (implemented by subclasses)
    this.updateMovement(delta);
    
    // Update visual position
    this.shape.setPosition(this.x, this.y);
    
    // Update splash container and mask position
    this.splashContainer.setPosition(this.x, this.y);
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    
    // Update splash positions to move with obstacle
    this.updateSplashPositions();
  }

  // Abstract method to be implemented by subclasses for different movement patterns
  protected abstract updateMovement(delta: number): void;

  private updateSplashPositions(): void {
    // Since splashes are now in a container that moves with the obstacle,
    // we only need to update their local positions if the obstacle changes size
    // (which doesn't happen in this game), so this method can be simplified
    // The container position is updated in the main update() method
  }

  public addColorSplash(hitX: number, hitY: number, color: number): void {
    // Convert world coordinates to relative position on obstacle
    const relativeX = (hitX - (this.x - this.width / 2)) / this.width;
    const relativeY = (hitY - (this.y - this.height / 2)) / this.height;
    
    // Clamp to obstacle bounds (0-1 range) but allow edge positioning
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));
    
    // Create irregular splash objects at the exact collision point
    const visualObjects = this.createIrregularSplash(clampedX, clampedY, color, 4 + Math.random() * 3, 0.7 + Math.random() * 0.2);
    
    // Create splash data with visual objects
    const splash: ColorSplash = {
      x: clampedX,
      y: clampedY,
      color: color,
      size: 4 + Math.random() * 3, // Smaller size: 4-7 pixels
      alpha: 0.7 + Math.random() * 0.2, // Random alpha between 0.7-0.9
      visualObjects: visualObjects
    };
    
    this.colorSplashes.push(splash);
    
    // Add all visual objects to main array for cleanup
    this.splashObjects.push(...visualObjects.map(v => v.obj));
    
    // Save to persistent storage
    this.saveSplashesToStorage();
    
    console.log(`Color splash added to obstacle ${this.obstacleId} at relative pos (${clampedX.toFixed(2)}, ${clampedY.toFixed(2)}) with color ${color.toString(16)}`);
  }

  private createIrregularSplash(relativeX: number, relativeY: number, color: number, baseSize: number, baseAlpha: number): { obj: Phaser.GameObjects.Arc; relativeX: number; relativeY: number }[] {
    const visualObjects: { obj: Phaser.GameObjects.Arc; relativeX: number; relativeY: number }[] = [];
    
    // Calculate world position relative to obstacle center
    const localX = (relativeX - 0.5) * this.width;
    const localY = (relativeY - 0.5) * this.height;
    
    // Create main splash droplet and add to container
    const mainSplash = this.scene.add.circle(localX, localY, baseSize, color);
    mainSplash.setAlpha(baseAlpha);
    this.splashContainer.add(mainSplash); // Add to masked container
    visualObjects.push({
      obj: mainSplash,
      relativeX: relativeX,
      relativeY: relativeY
    });
    
    // Add 2-4 smaller satellite droplets around the main splash
    // Adjust satellite positioning based on splash location to keep them on the obstacle
    const satelliteCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < satelliteCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      let distance = baseSize * 0.5 + Math.random() * baseSize * 0.3; // Slightly smaller distance
      
      // If main splash is near edge, bias satellite placement inward
      const isNearLeftEdge = relativeX < 0.15;
      const isNearRightEdge = relativeX > 0.85;
      const isNearTopEdge = relativeY < 0.15;
      const isNearBottomEdge = relativeY > 0.85;
      
      let adjustedAngle = angle;
      if (isNearLeftEdge) {
        // Bias angles toward the right (0 to π)
        adjustedAngle = Math.random() * Math.PI - Math.PI/2;
      } else if (isNearRightEdge) {
        // Bias angles toward the left (π to 2π)
        adjustedAngle = Math.random() * Math.PI + Math.PI/2;
      }
      
      if (isNearTopEdge) {
        // Bias angles downward
        adjustedAngle = Math.random() * Math.PI;
      } else if (isNearBottomEdge) {
        // Bias angles upward
        adjustedAngle = Math.random() * Math.PI + Math.PI;
      }
      
      const satelliteSize = baseSize * 0.3 + Math.random() * baseSize * 0.3; // 30-60% of main size
      
      const satelliteLocalX = localX + Math.cos(adjustedAngle) * distance;
      const satelliteLocalY = localY + Math.sin(adjustedAngle) * distance;
      
      // Calculate relative position for satellite
      const satRelativeX = (satelliteLocalX / this.width) + 0.5;
      const satRelativeY = (satelliteLocalY / this.height) + 0.5;
      
      // Keep satellites within reasonable bounds (mask will clip them anyway)
      if (satRelativeX >= -0.1 && satRelativeX <= 1.1 && satRelativeY >= -0.1 && satRelativeY <= 1.1) {
        const satellite = this.scene.add.circle(satelliteLocalX, satelliteLocalY, satelliteSize, color);
        satellite.setAlpha(baseAlpha * 0.6); // Slightly more transparent than main splash
        this.splashContainer.add(satellite); // Add to masked container
        visualObjects.push({
          obj: satellite,
          relativeX: satRelativeX,
          relativeY: satRelativeY
        });
      }
    }
    
    return visualObjects;
  }

  public getId(): string {
    return this.obstacleId;
  }

  private saveSplashesToStorage(): void {
    // Convert internal splash format to storage format
    const splashData: ColorSplashData[] = this.colorSplashes.map(splash => ({
      x: splash.x,
      y: splash.y,
      color: splash.color,
      size: splash.size,
      alpha: splash.alpha
    }));
    
    // Save to game state (we'll need level ID from the game scene)
    const levelId = `level_${(this.scene as any).currentLevel || 1}`;
    GameStateManager.getInstance().saveColorSplashes(levelId, this.obstacleId, splashData);
  }

  public loadSplashesFromStorage(levelId: string): void {
    const gameState = GameStateManager.getInstance();
    const levelSplashes = gameState.getColorSplashes(levelId);
    const obstacleSplashes = levelSplashes.find(obs => obs.obstacleId === this.obstacleId);
    
    if (obstacleSplashes) {
      // Restore splashes from storage data
      obstacleSplashes.splashes.forEach(splashData => {
        // Create visual objects for this splash
        const visualObjects = this.createIrregularSplash(
          splashData.x, 
          splashData.y, 
          splashData.color, 
          splashData.size, 
          splashData.alpha
        );
        
        // Create splash object with visual components
        const restoredSplash: ColorSplash = {
          x: splashData.x,
          y: splashData.y,
          color: splashData.color,
          size: splashData.size,
          alpha: splashData.alpha,
          visualObjects: visualObjects
        };
        
        this.colorSplashes.push(restoredSplash);
        this.splashObjects.push(...visualObjects.map(v => v.obj));
      });
    }
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
    // Destroy all splash objects
    for (const splash of this.colorSplashes) {
      for (const visualData of splash.visualObjects) {
        if (visualData.obj) {
          visualData.obj.destroy();
        }
      }
    }
    this.splashObjects = [];
    this.colorSplashes = [];
    
    // Destroy splash container and mask
    if (this.splashContainer) {
      this.splashContainer.destroy();
    }
    if (this.maskGraphics) {
      this.maskGraphics.destroy();
    }
    
    // Destroy main shape
    this.shape.destroy();
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.shape.setPosition(x, y);
    
    // Update splash container and mask position
    this.splashContainer.setPosition(x, y);
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(x - this.width / 2, y - this.height / 2, this.width, this.height);
    
    // Update splash positions when obstacle moves
    this.updateSplashPositions();
  }

  public getSplashData(): ColorSplashData[] {
    // Return splash data without visual objects for serialization
    return this.colorSplashes.map(splash => ({
      x: splash.x,
      y: splash.y,
      color: splash.color,
      size: splash.size,
      alpha: splash.alpha
    }));
  }

  public restoreSplashes(splashes: ColorSplash[]): void {
    // Clear existing splashes
    for (const splash of this.colorSplashes) {
      for (const visualData of splash.visualObjects) {
        if (visualData.obj) {
          visualData.obj.destroy();
        }
      }
    }
    this.splashObjects = [];
    this.colorSplashes = [];
    
    // Restore each splash
    splashes.forEach(splashData => {
      // Create visual objects for this splash
      const visualObjects = this.createIrregularSplash(
        splashData.x, 
        splashData.y, 
        splashData.color, 
        splashData.size, 
        splashData.alpha
      );
      
      // Create complete splash object
      const restoredSplash: ColorSplash = {
        ...splashData,
        visualObjects: visualObjects
      };
      
      this.colorSplashes.push(restoredSplash);
      this.splashObjects.push(...visualObjects.map(v => v.obj));
    });
  }

  public getGameObject(): Phaser.GameObjects.Rectangle {
    return this.shape;
  }
}
