import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { ObstacleManager } from '../core/managers/ObstacleManager';
import { StarField } from '../effects/StarField';
import { ParticleEffect } from '../effects/ParticleEffect';
import { GameStateManager } from '../core/managers/GameStateManager';
import { GameProperties } from '../config/GameProperties';
import { LevelConfigurations } from '../config/levels/LevelConfigurations';
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
  private gameActive: boolean = true;
  private isTouchActive: boolean = false;

  constructor() {
    super({ key: Scenes.GAME });
  }

  init(data: { level: number }): void {
    this.currentLevel = data.level || 1;
  }

  create(): void {
    // Set up game configuration with responsive scaling
    const baseWidth = 1920;
    const baseHeight = 1080;
    const actualWidth = this.cameras.main.width;
    const actualHeight = this.cameras.main.height;
    const scaleX = actualWidth / baseWidth;
    const scaleY = actualHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);

    this.gameConfig = {
      width: actualWidth,
      height: actualHeight,
      centerX: actualWidth / 2,
      centerY: actualHeight - Math.max(200 * scale, 120), // Better mobile positioning
      orbRadius: Math.max(150 * scale, 80), // Increased minimum radius for mobile
      rotationSpeed: 0.004
    };

    // Initialize game state
    this.gameActive = true;

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
    
    // Debug: Clear splash data if enabled
    if (GameProperties.debug.clearSplashesOnStartup) {
      const gameState = GameStateManager.getInstance();
      gameState.clearLevelSplashes(`level_${this.currentLevel}`);
      console.log(`Cleared splash data for level ${this.currentLevel}`);
    }
    
    this.obstacleManager.loadLevel(this.levelData, this.currentLevel);

    // Set up input
    this.setupInput();

    // Add level indicator with better styling
    this.add.text(40, 40, `Level ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Exo 2, Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });
  }

  private setupInput(): void {
    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Touch/Mouse input zones with better reliability
    const halfWidth = this.cameras.main.width / 2;
    
    // Create invisible touch zones that cover the entire screen halves
    this.leftInputZone = this.add.zone(0, 0, halfWidth, this.cameras.main.height);
    this.leftInputZone.setOrigin(0, 0);
    this.leftInputZone.setInteractive({ useHandCursor: false });

    this.rightInputZone = this.add.zone(halfWidth, 0, halfWidth, this.cameras.main.height);
    this.rightInputZone.setOrigin(0, 0);
    this.rightInputZone.setInteractive({ useHandCursor: false });

    // Add visual debug indicators (optional - can be removed for production)
    if (GameProperties.debug.showDebugInfo) {
      const leftDebug = this.add.rectangle(halfWidth / 2, this.cameras.main.height / 2, halfWidth, this.cameras.main.height, 0xff0000, GameProperties.debug.touchZoneOpacity);
      const rightDebug = this.add.rectangle(halfWidth + halfWidth / 2, this.cameras.main.height / 2, halfWidth, this.cameras.main.height, 0x0000ff, GameProperties.debug.touchZoneOpacity);
      
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Touch zones created - Left:', leftDebug.getBounds(), 'Right:', rightDebug.getBounds());
      }
    }

    // Left zone events with better touch handling
    this.leftInputZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Left zone touched at:', pointer.x, pointer.y);
      }
      this.isTouchActive = true;
      this.player.startRotation('left');
    });

    this.leftInputZone.on('pointerup', () => {
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Left zone released');
      }
      this.isTouchActive = false;
      this.player.stopRotation();
    });

    this.leftInputZone.on('pointerout', () => {
      this.isTouchActive = false;
      this.player.stopRotation();
    });

    // Right zone events with better touch handling
    this.rightInputZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Right zone touched at:', pointer.x, pointer.y);
      }
      this.isTouchActive = true;
      this.player.startRotation('right');
    });

    this.rightInputZone.on('pointerup', () => {
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Right zone released');
      }
      this.isTouchActive = false;
      this.player.stopRotation();
    });

    this.rightInputZone.on('pointerout', () => {
      this.isTouchActive = false;
      this.player.stopRotation();
    });

    // Global touch handling as backup
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameActive) return;
      
      const isLeftSide = pointer.x < this.cameras.main.width / 2;
      if (GameProperties.debug.enableTouchLogging) {
        console.log('Global touch:', pointer.x, pointer.y, 'Left side:', isLeftSide);
      }
      
      this.isTouchActive = true;
      if (isLeftSide) {
        this.player.startRotation('left');
      } else {
        this.player.startRotation('right');
      }
    });

    this.input.on('pointerup', () => {
      if (!this.gameActive) return;
      this.isTouchActive = false;
      this.player.stopRotation();
    });
  }

  update(_time: number, delta: number): void {
    // Only update if game is active
    if (!this.gameActive) return;

    // Handle keyboard input only if no touch input is active
    if (!this.isTouchActive) {
      if (this.cursors.left.isDown) {
        this.player.startRotation('left');
      } else if (this.cursors.right.isDown) {
        this.player.startRotation('right');
      } else {
        this.player.stopRotation();
      }
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
    // Stop game immediately to prevent multiple particle effects
    this.gameActive = false;
    
    // Stop all input processing
    this.input.enabled = false;
    
    // Clear all obstacles to prevent more collisions
    this.obstacleManager.clearAllObstacles();
    
    // Add a delay to show the particle effects before transitioning
    this.time.delayedCall(1000, () => {
      this.scene.start(Scenes.GAME_OVER, { level: this.currentLevel });
    });
  }

  private levelComplete(): void {
    // Stop game to prevent multiple completion effects
    this.gameActive = false;
    
    // Mark level as completed
    this.gameStateManager.completeLevel(this.currentLevel);
    
    // Create celebration effect (only once)
    this.particleEffect.createLevelCompleteEffect(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );

    // Show completion message with better styling
    const completeText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      'LEVEL COMPLETE!', {
      fontSize: Math.min(48 * (this.cameras.main.width / 1920), 48) + 'px',
      color: '#00ff44',
      fontFamily: 'Orbitron, Arial, sans-serif',
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
    return LevelConfigurations.getLevelData(level, this.gameConfig);
  }
}
