export interface ObstacleData {
  type: 'single' | 'double' | 'triple';
  x: number;
  width: number;
  height: number;
  delay: number;
}

export interface LevelData {
  id: number;
  name: string;
  obstacles: ObstacleData[];
  obstacleSpeed: number;
  duration: number;
}

export interface GameConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  orbRadius: number;
  rotationSpeed: number;
}

export enum GameEvents {
  LEVEL_COMPLETE = 'level_complete',
  PLAYER_COLLISION = 'player_collision',
  GAME_OVER = 'game_over',
  RESTART_LEVEL = 'restart_level',
  RETURN_TO_MENU = 'return_to_menu'
}

export enum Scenes {
  MENU = 'MenuScene',
  GAME = 'GameScene',
  GAME_OVER = 'GameOverScene',
  SETTINGS = 'SettingsScene'
}
