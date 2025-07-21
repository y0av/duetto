import Phaser from 'phaser';
import { GameStateManager, type ColorSplashData } from './GameStateManager';

interface ColorSplash {
  x: number; // Relative position on obstacle (0-1)
  y: number; // Relative position on obstacle (0-1)
  color: number;
  size: number;
  alpha: number;
  visualObjects: { obj: Phaser.GameObjects.Arc; relativeX: number; relativeY: number }[]; // Store relative positions
}

export class Obstacle {
  private scene: Phaser.Scene;
  private shape: Phaser.GameObjects.Rectangle;
  private speed: number;
  private colorSplashes: ColorSplash[] = [];
  private splashObjects: Phaser.GameObjects.Arc[] = [];
  private obstacleId: string; // Unique identifier
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
  }

  public update(delta: number): void {
    // Convert delta from milliseconds to seconds and apply speed
    this.y += this.speed * (delta / 1000);
    this.shape.setPosition(this.x, this.y);
    
    // Update splash positions to move with obstacle
    this.updateSplashPositions();
  }

  private updateSplashPositions(): void {
    // Update positions for all splash visual objects using stored relative positions
    for (const splash of this.colorSplashes) {
      for (const visualData of splash.visualObjects) {
        if (visualData.obj && visualData.obj.active) {
          // Calculate world position from stored relative position
          const newWorldX = this.x - (this.width / 2) + (visualData.relativeX * this.width);
          const newWorldY = this.y - (this.height / 2) + (visualData.relativeY * this.height);
          
          visualData.obj.setPosition(newWorldX, newWorldY);
        }
      }
    }
  }

  public addColorSplash(hitX: number, hitY: number, color: number): void {
    // Convert world coordinates to relative position on obstacle
    const relativeX = (hitX - (this.x - this.width / 2)) / this.width;
    const relativeY = (hitY - (this.y - this.height / 2)) / this.height;
    
    // Clamp to obstacle bounds with some margin to ensure splashes stay inside
    const margin = 0.1; // 10% margin from edges
    const clampedX = Math.max(margin, Math.min(1 - margin, relativeX));
    const clampedY = Math.max(margin, Math.min(1 - margin, relativeY));
    
    // Create irregular splash objects
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
    
    // Calculate world position
    const worldX = this.x - (this.width / 2) + (relativeX * this.width);
    const worldY = this.y - (this.height / 2) + (relativeY * this.height);
    
    // Create main splash droplet
    const mainSplash = this.scene.add.circle(worldX, worldY, baseSize, color);
    mainSplash.setAlpha(baseAlpha);
    mainSplash.setDepth(7); // Just above obstacles but below orbs
    visualObjects.push({
      obj: mainSplash,
      relativeX: relativeX,
      relativeY: relativeY
    });
    
    // Add 2-4 smaller satellite droplets around the main splash
    const satelliteCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < satelliteCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = baseSize * 0.8 + Math.random() * baseSize * 0.4; // Distance from main splash
      const satelliteSize = baseSize * 0.3 + Math.random() * baseSize * 0.3; // 30-60% of main size
      
      const satelliteX = worldX + Math.cos(angle) * distance;
      const satelliteY = worldY + Math.sin(angle) * distance;
      
      // Calculate relative position for satellite
      const satRelativeX = (satelliteX - (this.x - this.width / 2)) / this.width;
      const satRelativeY = (satelliteY - (this.y - this.height / 2)) / this.height;
      
      if (satRelativeX >= 0.05 && satRelativeX <= 0.95 && satRelativeY >= 0.05 && satRelativeY <= 0.95) {
        const satellite = this.scene.add.circle(satelliteX, satelliteY, satelliteSize, color);
        satellite.setAlpha(baseAlpha * 0.6); // Slightly more transparent than main splash
        satellite.setDepth(7);
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
    
    // Destroy main shape
    this.shape.destroy();
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.shape.setPosition(x, y);
    
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
