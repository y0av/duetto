import type { LevelData } from '../../types/GameTypes';

export class LevelConfigurations {
  public static getLevelData(level: number, gameConfig: { centerX: number; width: number; height: number }): LevelData {
    // Get responsive scaling factor
    const scale = Math.min(gameConfig.width / 1920, gameConfig.height / 1080);
    
    switch (level) {
      case 1:
        return {
          id: 1,
          name: 'Beginner',
          obstacleSpeed: 120,
          duration: 30000,
          obstacles: [
            { type: 'single', x: gameConfig.centerX, width: 80 * scale, height: 120 * scale, delay: 2000 },
            { type: 'double', x: gameConfig.centerX, width: 100 * scale, height: 140 * scale, delay: 6000 },
            { type: 'single', x: gameConfig.centerX - (200 * scale), width: 100 * scale, height: 120 * scale, delay: 10000 },
            { type: 'triple', x: gameConfig.centerX, width: 70 * scale, height: 120 * scale, delay: 14500 },
            { type: 'single', x: gameConfig.centerX + (150 * scale), width: 90 * scale, height: 140 * scale, delay: 19000 },
            { type: 'double', x: gameConfig.centerX - (100 * scale), width: 80 * scale, height: 120 * scale, delay: 23500 },
            { type: 'single', x: gameConfig.centerX, width: 70 * scale, height: 180 * scale, delay: 28000 }
          ]
        };

      case 2:
        return {
          id: 2,
          name: 'Intermediate',
          obstacleSpeed: 150,
          duration: 45000,
          obstacles: [
            { type: 'single', x: gameConfig.centerX, width: 70 * scale, height: 100 * scale, delay: 1500 },
            { type: 'single', x: gameConfig.centerX - (150 * scale), width: 70 * scale, height: 100 * scale, delay: 4000 },
            { type: 'single', x: gameConfig.centerX + (150 * scale), width: 70 * scale, height: 100 * scale, delay: 6500 },
            { type: 'double', x: gameConfig.centerX, width: 80 * scale, height: 120 * scale, delay: 9500 },
            { type: 'triple', x: gameConfig.centerX, width: 60 * scale, height: 140 * scale, delay: 13000 },
            { type: 'single', x: gameConfig.centerX - (120 * scale), width: 100 * scale, height: 120 * scale, delay: 16500 },
            { type: 'single', x: gameConfig.centerX + (120 * scale), width: 100 * scale, height: 120 * scale, delay: 19000 },
            { type: 'double', x: gameConfig.centerX + (150 * scale), width: 90 * scale, height: 140 * scale, delay: 22500 },
            { type: 'triple', x: gameConfig.centerX, width: 65 * scale, height: 120 * scale, delay: 26500 },
            { type: 'single', x: gameConfig.centerX, width: 60 * scale, height: 200 * scale, delay: 30500 }
          ]
        };

      case 3:
        return {
          id: 3,
          name: 'Advanced - Moving Obstacles',
          obstacleSpeed: 160,
          duration: 50000,
          obstacles: [
            // Start with static obstacles to ease into the level
            { type: 'single', x: gameConfig.centerX, width: 70 * scale, height: 90 * scale, delay: 2000 },
            { type: 'double', x: gameConfig.centerX, width: 60 * scale, height: 100 * scale, delay: 5000 },
            
            // Introduce moving obstacles - smaller and slower
            { type: 'moving-single', x: gameConfig.centerX - (100 * scale), width: 70 * scale, height: 90 * scale, delay: 8500, horizontalSpeed: 60 },
            { type: 'single', x: gameConfig.centerX + (120 * scale), width: 80 * scale, height: 100 * scale, delay: 11500 },
            
            // Mix static and moving
            { type: 'moving-single', x: gameConfig.centerX + (80 * scale), width: 75 * scale, height: 95 * scale, delay: 15000, horizontalSpeed: 70 },
            { type: 'double', x: gameConfig.centerX - (50 * scale), width: 65 * scale, height: 110 * scale, delay: 18500 },
            
            // Gradually increase difficulty
            { type: 'triple', x: gameConfig.centerX, width: 55 * scale, height: 120 * scale, delay: 22000 },
            { type: 'moving-double', x: gameConfig.centerX, width: 70 * scale, height: 100 * scale, delay: 26000, horizontalSpeed: 80 },
            
            // More challenging patterns
            { type: 'moving-single', x: gameConfig.centerX, width: 80 * scale, height: 110 * scale, delay: 30000, horizontalSpeed: 75 },
            { type: 'single', x: gameConfig.centerX - (140 * scale), width: 70 * scale, height: 90 * scale, delay: 33500 },
            { type: 'moving-single', x: gameConfig.centerX + (140 * scale), width: 70 * scale, height: 90 * scale, delay: 36000, horizontalSpeed: 85 },
            
            // Final challenges - still reasonable
            { type: 'moving-double', x: gameConfig.centerX, width: 65 * scale, height: 120 * scale, delay: 40000, horizontalSpeed: 70 },
            { type: 'triple', x: gameConfig.centerX, width: 60 * scale, height: 110 * scale, delay: 44000 },
            { type: 'moving-single', x: gameConfig.centerX, width: 75 * scale, height: 140 * scale, delay: 47500, horizontalSpeed: 65 }
          ]
        };

      default:
        // Default fallback (level 1 for any unhandled level)
        return LevelConfigurations.getLevelData(1, gameConfig);
    }
  }
}
