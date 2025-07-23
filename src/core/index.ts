// Obstacle classes
export { BaseObstacle } from './obstacles/BaseObstacle';
export { StaticObstacle } from './obstacles/StaticObstacle';
export { MovingObstacle } from './obstacles/MovingObstacle';
export { Obstacle } from './obstacles/Obstacle';

// Managers
export { ObstacleManager } from './managers/ObstacleManager';
export { GameStateManager } from './managers/GameStateManager';

// Types
export type { ColorSplash } from './obstacles/BaseObstacle';
export type { ColorSplashData, ObstacleSplashData, GameState } from './managers/GameStateManager';
