export interface ColorSplashData {
  x: number; // Relative position on obstacle (0-1)
  y: number; // Relative position on obstacle (0-1)
  color: number;
  size: number;
  alpha: number;
}

export interface ObstacleSplashData {
  obstacleId: string; // Unique identifier for the obstacle
  splashes: ColorSplashData[];
}

export interface GameState {
  completedLevels: number[];
  currentLevel: number;
  totalLevels: number;
  colorSplashes: { [levelId: string]: ObstacleSplashData[] }; // Store splashes by level
}

export class GameStateManager {
  private static instance: GameStateManager;
  private gameState: GameState;
  private storageKey = 'duet-game-save';

  private constructor() {
    this.gameState = this.loadGameState();
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  private loadGameState(): GameState {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const loadedState = JSON.parse(saved);
        // Ensure backward compatibility - add colorSplashes if missing
        if (!loadedState.colorSplashes) {
          loadedState.colorSplashes = {};
        }
        return loadedState;
      }
    } catch (error) {
      console.warn('Failed to load game state:', error);
    }
    
    // Default state
    return {
      completedLevels: [],
      currentLevel: 1,
      totalLevels: 2,
      colorSplashes: {}
    };
  }

  private saveGameState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.gameState));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }

  public completeLevel(level: number): void {
    if (!this.gameState.completedLevels.includes(level)) {
      this.gameState.completedLevels.push(level);
      this.gameState.completedLevels.sort((a, b) => a - b);
      this.saveGameState();
    }
  }

  public isLevelCompleted(level: number): boolean {
    return this.gameState.completedLevels.includes(level);
  }

  public getCompletedLevels(): number[] {
    return [...this.gameState.completedLevels];
  }

  public getNextUncompletedLevel(): number {
    for (let i = 1; i <= this.gameState.totalLevels; i++) {
      if (!this.isLevelCompleted(i)) {
        return i;
      }
    }
    return 1; // All levels completed, return first level
  }

  public resetProgress(): void {
    this.gameState = {
      completedLevels: [],
      currentLevel: 1,
      totalLevels: 2,
      colorSplashes: {}
    };
    this.saveGameState();
  }

  public getProgress(): { completed: number; total: number } {
    return {
      completed: this.gameState.completedLevels.length,
      total: this.gameState.totalLevels
    };
  }

  public saveColorSplashes(levelId: string, obstacleId: string, splashes: ColorSplashData[]): void {
    if (!this.gameState.colorSplashes[levelId]) {
      this.gameState.colorSplashes[levelId] = [];
    }
    
    // Find existing obstacle data or create new
    const existingIndex = this.gameState.colorSplashes[levelId].findIndex(
      obs => obs.obstacleId === obstacleId
    );
    
    if (existingIndex >= 0) {
      // Update existing obstacle splashes
      this.gameState.colorSplashes[levelId][existingIndex].splashes = splashes;
    } else {
      // Add new obstacle splash data
      this.gameState.colorSplashes[levelId].push({
        obstacleId,
        splashes
      });
    }
    
    this.saveGameState();
  }

  public getColorSplashes(levelId: string): ObstacleSplashData[] {
    return this.gameState.colorSplashes[levelId] || [];
  }

  public clearLevelSplashes(levelId: string): void {
    if (this.gameState.colorSplashes[levelId]) {
      delete this.gameState.colorSplashes[levelId];
      this.saveGameState();
    }
  }

  public clearAllColorSplashes(): void {
    this.gameState.colorSplashes = {};
    this.saveGameState();
  }
}
