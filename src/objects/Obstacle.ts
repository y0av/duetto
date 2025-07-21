import Phaser from 'phaser';
import { GameStateManager, type ColorSplashData } from './GameStateManager';

interface ColorSplash {
  x: number; // Relative position on obstacle (0-1)
  y: number; // Relative position on obstacle (0-1)
  color: number;
  size: number;
  alpha: number;
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
    for (let i = 0; i < this.splashObjects.length; i++) {
      const splash = this.splashObjects[i];
      const splashData = this.colorSplashes[i];
      
      if (splash && splashData) {
        // Calculate world position from relative position
        const worldX = this.x - (this.width / 2) + (splashData.x * this.width);
        const worldY = this.y - (this.height / 2) + (splashData.y * this.height);
        splash.setPosition(worldX, worldY);
      }
    }
  }

  public addColorSplash(hitX: number, hitY: number, color: number): void {
    // Convert world coordinates to relative position on obstacle
    const relativeX = (hitX - (this.x - this.width / 2)) / this.width;
    const relativeY = (hitY - (this.y - this.height / 2)) / this.height;
    
    // Clamp to obstacle bounds
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));
    
    // Create splash data
    const splash: ColorSplash = {
      x: clampedX,
      y: clampedY,
      color: color,
      size: 8 + Math.random() * 4, // Random size between 8-12
      alpha: 0.8 + Math.random() * 0.2 // Random alpha between 0.8-1.0
    };
    
    this.colorSplashes.push(splash);
    
    // Create visual splash object
    const worldX = this.x - (this.width / 2) + (clampedX * this.width);
    const worldY = this.y - (this.height / 2) + (clampedY * this.height);
    
    const splashObj = this.scene.add.circle(worldX, worldY, splash.size, color);
    splashObj.setAlpha(splash.alpha);
    splashObj.setDepth(8); // Above obstacles but below orbs
    
    // Add a subtle stroke for better visibility
    splashObj.setStrokeStyle(1, color, 0.6);
    
    this.splashObjects.push(splashObj);
    
    // Save to persistent storage
    this.saveSplashesToStorage();
    
    console.log(`Color splash added to obstacle ${this.obstacleId} at relative pos (${clampedX.toFixed(2)}, ${clampedY.toFixed(2)}) with color ${color.toString(16)}`);
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
      this.restoreSplashes(obstacleSplashes.splashes.map(splash => ({
        x: splash.x,
        y: splash.y,
        color: splash.color,
        size: splash.size,
        alpha: splash.alpha
      })));
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
    this.splashObjects.forEach(splash => splash.destroy());
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

  public getSplashData(): ColorSplash[] {
    return [...this.colorSplashes]; // Return copy of splash data
  }

  public restoreSplashes(splashes: ColorSplash[]): void {
    // Clear existing splashes
    this.splashObjects.forEach(splash => splash.destroy());
    this.splashObjects = [];
    this.colorSplashes = [];
    
    // Restore each splash
    splashes.forEach(splashData => {
      this.colorSplashes.push(splashData);
      
      // Create visual splash object
      const worldX = this.x - (this.width / 2) + (splashData.x * this.width);
      const worldY = this.y - (this.height / 2) + (splashData.y * this.height);
      
      const splashObj = this.scene.add.circle(worldX, worldY, splashData.size, splashData.color);
      splashObj.setAlpha(splashData.alpha);
      splashObj.setDepth(8); // Above obstacles but below orbs
      splashObj.setStrokeStyle(1, splashData.color, 0.6);
      
      this.splashObjects.push(splashObj);
    });
  }

  public getGameObject(): Phaser.GameObjects.Rectangle {
    return this.shape;
  }
}
