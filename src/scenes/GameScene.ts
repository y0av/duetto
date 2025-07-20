import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { ObstacleManager } from '../objects/ObstacleManager';
import type { GameConfig, LevelData } from '../types/GameTypes';
import { Scenes } from '../types/GameTypes';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacleManager!: ObstacleManager;
  private gameConfig!: GameConfig;
  private currentLevel: number = 1;
  private levelData!: LevelData;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private leftInputZone!: Phaser.GameObjects.Zone;
  private rightInputZone!: Phaser.GameObjects.Zone;

  constructor() {
    super({ key: Scenes.GAME });
  }

  init(data: { level: number }): void {
    this.currentLevel = data.level || 1;
  }

  create(): void {
    // Set up game configuration
    this.gameConfig = {
      width: this.cameras.main.width,
      height: this.cameras.main.height,
      centerX: this.cameras.main.width / 2,
      centerY: this.cameras.main.height - 100,
      orbRadius: 80,
      rotationSpeed: 0.003
    };

    // Background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Create player
    this.player = new Player(this, this.gameConfig);

    // Create obstacle manager
    this.obstacleManager = new ObstacleManager(
      this,
      this.gameConfig.width,
      this.gameConfig.height
    );

    // Load level data
    this.levelData = this.getLevelData(this.currentLevel);
    console.log('Loading level data:', this.levelData);
    this.obstacleManager.loadLevel(this.levelData);

    // Set up input
    this.setupInput();

    // Add level indicator
    this.add.text(20, 20, `Level ${this.currentLevel}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
  }

  private setupInput(): void {
    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Touch/Mouse input zones
    const halfWidth = this.cameras.main.width / 2;
    
    this.leftInputZone = this.add.zone(0, 0, halfWidth, this.cameras.main.height);
    this.leftInputZone.setOrigin(0, 0);
    this.leftInputZone.setInteractive();

    this.rightInputZone = this.add.zone(halfWidth, 0, halfWidth, this.cameras.main.height);
    this.rightInputZone.setOrigin(0, 0);
    this.rightInputZone.setInteractive();

    // Left zone events
    this.leftInputZone.on('pointerdown', () => {
      this.player.startRotation('left');
    });

    this.leftInputZone.on('pointerup', () => {
      this.player.stopRotation();
    });

    this.leftInputZone.on('pointerout', () => {
      this.player.stopRotation();
    });

    // Right zone events
    this.rightInputZone.on('pointerdown', () => {
      this.player.startRotation('right');
    });

    this.rightInputZone.on('pointerup', () => {
      this.player.stopRotation();
    });

    this.rightInputZone.on('pointerout', () => {
      this.player.stopRotation();
    });
  }

  update(_time: number, delta: number): void {
    // Handle keyboard input
    if (this.cursors.left.isDown) {
      this.player.startRotation('left');
    } else if (this.cursors.right.isDown) {
      this.player.startRotation('right');
    } else {
      this.player.stopRotation();
    }

    // Update player
    this.player.update(delta);

    // Update obstacles
    this.obstacleManager.update(delta);

    // Check collisions
    if (this.obstacleManager.checkCollisions(this.player)) {
      this.gameOver();
    }

    // Check level completion
    if (this.obstacleManager.isLevelComplete()) {
      this.levelComplete();
    }
  }

  private gameOver(): void {
    this.scene.start(Scenes.GAME_OVER, { level: this.currentLevel });
  }

  private levelComplete(): void {
    // For now, just show a completion message and return to menu
    // In a full game, this would transition to the next level
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      'LEVEL COMPLETE!', {
      fontSize: '32px',
      color: '#44ff44',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start(Scenes.MENU);
    });
  }

  private getLevelData(level: number): LevelData {
    if (level === 1) {
      return {
        id: 1,
        name: 'Beginner',
        obstacleSpeed: 120,
        duration: 30000,
        obstacles: [
          { type: 'single', x: this.gameConfig.centerX, width: 60, height: 100, delay: 500 },
          { type: 'double', x: this.gameConfig.centerX, width: 80, height: 120, delay: 2000 },
          { type: 'single', x: this.gameConfig.centerX - 100, width: 80, height: 100, delay: 3500 },
          { type: 'triple', x: this.gameConfig.centerX, width: 50, height: 100, delay: 5000 },
          { type: 'single', x: this.gameConfig.centerX + 80, width: 70, height: 120, delay: 6500 },
          { type: 'double', x: this.gameConfig.centerX - 50, width: 60, height: 100, delay: 8000 },
          { type: 'single', x: this.gameConfig.centerX, width: 50, height: 150, delay: 9500 }
        ]
      };
    } else {
      return {
        id: 2,
        name: 'Intermediate',
        obstacleSpeed: 150,
        duration: 45000,
        obstacles: [
          { type: 'single', x: this.gameConfig.centerX, width: 50, height: 80, delay: 500 },
          { type: 'single', x: this.gameConfig.centerX - 80, width: 50, height: 80, delay: 1500 },
          { type: 'single', x: this.gameConfig.centerX + 80, width: 50, height: 80, delay: 2500 },
          { type: 'double', x: this.gameConfig.centerX, width: 60, height: 100, delay: 4000 },
          { type: 'triple', x: this.gameConfig.centerX, width: 40, height: 120, delay: 5500 },
          { type: 'single', x: this.gameConfig.centerX - 60, width: 80, height: 100, delay: 7000 },
          { type: 'single', x: this.gameConfig.centerX + 60, width: 80, height: 100, delay: 8000 },
          { type: 'double', x: this.gameConfig.centerX + 80, width: 70, height: 120, delay: 9500 },
          { type: 'triple', x: this.gameConfig.centerX, width: 45, height: 100, delay: 11000 },
          { type: 'single', x: this.gameConfig.centerX, width: 40, height: 150, delay: 12500 }
        ]
      };
    }
  }
}
