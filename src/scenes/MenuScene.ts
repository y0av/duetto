import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';
import { GameStateManager } from '../objects/GameStateManager';
import { StarField } from '../objects/StarField';

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private level1Button!: Phaser.GameObjects.Text;
  private level2Button!: Phaser.GameObjects.Text;
  private starField!: StarField;
  private gameStateManager!: GameStateManager;

  constructor() {
    super({ key: Scenes.MENU });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Create starfield background
    this.starField = new StarField(this);

    // Get game state manager
    this.gameStateManager = GameStateManager.getInstance();

    // Title with glow effect
    this.titleText = this.add.text(centerX, centerY - 150, 'DUET', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#444444',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Add subtle glow animation to title
    this.tweens.add({
      targets: this.titleText,
      alpha: 0.7,
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });

    // Level 1 Button with completion indicator
    const level1Completed = this.gameStateManager.isLevelCompleted(1);
    const level1Text = level1Completed ? 'LEVEL 1 ✓' : 'LEVEL 1';
    const level1Color = level1Completed ? '#00ff44' : '#ff4444';
    
    this.level1Button = this.add.text(centerX, centerY - 20, level1Text, {
      fontSize: '32px',
      color: level1Color,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#333333',
      padding: { x: 30, y: 15 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Level 2 Button with completion indicator
    const level2Completed = this.gameStateManager.isLevelCompleted(2);
    const level2Text = level2Completed ? 'LEVEL 2 ✓' : 'LEVEL 2';
    const level2Color = level2Completed ? '#00ff44' : '#4444ff';
    
    this.level2Button = this.add.text(centerX, centerY + 40, level2Text, {
      fontSize: '32px',
      color: level2Color,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#333333',
      padding: { x: 30, y: 15 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Make buttons interactive
    this.setupButton(this.level1Button, 1);
    this.setupButton(this.level2Button, 2);

    // Progress indicator
    const progress = this.gameStateManager.getProgress();
    this.add.text(centerX, centerY + 120, 
      `Progress: ${progress.completed}/${progress.total} levels completed`, {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(centerX, this.cameras.main.height - 80, 
      'Use LEFT/RIGHT arrows or click screen sides to rotate', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Reset button (for testing)
    const resetButton = this.add.text(centerX, this.cameras.main.height - 40, 
      'Reset Progress', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.gameStateManager.resetProgress();
      this.scene.restart();
    });
  }

  update(_time: number, delta: number): void {
    // Update starfield
    if (this.starField) {
      this.starField.update(delta);
    }
  }

  private setupButton(button: Phaser.GameObjects.Text, level: number): void {
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.setScale(1);
    });

    button.on('pointerdown', () => {
      this.startLevel(level);
    });
  }

  private startLevel(level: number): void {
    this.scene.start(Scenes.GAME, { level });
  }
}
