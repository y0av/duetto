export interface GameState {
  completedLevels: number[];
  currentLevel: number;
  totalLevels: number;
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
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load game state:', error);
    }
    
    // Default state
    return {
      completedLevels: [],
      currentLevel: 1,
      totalLevels: 2
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
      totalLevels: 2
    };
    this.saveGameState();
  }

  public getProgress(): { completed: number; total: number } {
    return {
      completed: this.gameState.completedLevels.length,
      total: this.gameState.totalLevels
    };
  }
}
