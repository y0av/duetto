import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { ObstacleManager } from '../objects/ObstacleManager';
import { StarField } from '../objects/StarField';
import { ParticleEffect } from '../objects/ParticleEffect';
import { GameStateManager } from '../objects/GameStateManager';
import type { GameConfig, LevelData } from '../types/GameTypes';
import { Scenes } from '../types/GameTypes';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacleManager!: ObstacleManager;
  private starField!: StarField;
  private particleEffect!: ParticleEffect;
  private gameStateManager!: GameStateManager;
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
      centerY: this.cameras.main.height - 150,
      orbRadius: 120,
      rotationSpeed: 0.004
    };

    // Background - dark space
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Create starfield background
    this.starField = new StarField(this);

    // Create particle effect system
    this.particleEffect = new ParticleEffect(this);

    // Get game state manager
    this.gameStateManager = GameStateManager.getInstance();

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

    // Add level indicator with better styling
    this.add.text(40, 40, `Level ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
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

    // Update starfield
    this.starField.update(delta);

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
    // Stop all input processing
    this.input.enabled = false;
    
    // Add a delay to show the particle effects before transitioning
    this.time.delayedCall(1000, () => {
      this.scene.start(Scenes.GAME_OVER, { level: this.currentLevel });
    });
  }

  private levelComplete(): void {
    // Mark level as completed
    this.gameStateManager.completeLevel(this.currentLevel);
    
    // Create celebration effect
    this.particleEffect.createLevelCompleteEffect(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );

    // Show completion message with better styling
    const completeText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      'LEVEL COMPLETE!', {
      fontSize: '48px',
      color: '#00ff44',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Animate the text
    this.tweens.add({
      targets: completeText,
      scale: 1.2,
      yoyo: true,
      repeat: 2,
      duration: 300,
      ease: 'Power2'
    });

    this.time.delayedCall(3000, () => {
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
          { type: 'single', x: this.gameConfig.centerX, width: 80, height: 120, delay: 2000 },
          { type: 'double', x: this.gameConfig.centerX, width: 100, height: 140, delay: 6000 },
          { type: 'single', x: this.gameConfig.centerX - 200, width: 100, height: 120, delay: 10000 },
          { type: 'triple', x: this.gameConfig.centerX, width: 70, height: 120, delay: 14500 },
          { type: 'single', x: this.gameConfig.centerX + 150, width: 90, height: 140, delay: 19000 },
          { type: 'double', x: this.gameConfig.centerX - 100, width: 80, height: 120, delay: 23500 },
          { type: 'single', x: this.gameConfig.centerX, width: 70, height: 180, delay: 28000 }
        ]
      };
    } else {
      return {
        id: 2,
        name: 'Intermediate',
        obstacleSpeed: 150,
        duration: 45000,
        obstacles: [
          { type: 'single', x: this.gameConfig.centerX, width: 70, height: 100, delay: 1500 },
          { type: 'single', x: this.gameConfig.centerX - 150, width: 70, height: 100, delay: 4000 },
          { type: 'single', x: this.gameConfig.centerX + 150, width: 70, height: 100, delay: 6500 },
          { type: 'double', x: this.gameConfig.centerX, width: 80, height: 120, delay: 9500 },
          { type: 'triple', x: this.gameConfig.centerX, width: 60, height: 140, delay: 13000 },
          { type: 'single', x: this.gameConfig.centerX - 120, width: 100, height: 120, delay: 16500 },
          { type: 'single', x: this.gameConfig.centerX + 120, width: 100, height: 120, delay: 19000 },
          { type: 'double', x: this.gameConfig.centerX + 150, width: 90, height: 140, delay: 22500 },
          { type: 'triple', x: this.gameConfig.centerX, width: 65, height: 120, delay: 26500 },
          { type: 'single', x: this.gameConfig.centerX, width: 60, height: 200, delay: 30500 }
        ]
      };
    }
  }
}
