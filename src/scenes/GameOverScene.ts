import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';
import { StarField } from '../objects/StarField';

export class GameOverScene extends Phaser.Scene {
  private currentLevel: number = 1;
  private starField!: StarField;

  constructor() {
    super({ key: Scenes.GAME_OVER });
  }

  init(data: { level: number }): void {
    this.currentLevel = data.level || 1;
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Create starfield background
    this.starField = new StarField(this);

    // Game Over text with dramatic effect
    const gameOverText = this.add.text(centerX, centerY - 100, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff4444',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Animate game over text
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });

    // Level indicator
    this.add.text(centerX, centerY - 40, `Level ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(centerX, centerY + 40, 'RETRY', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#444444',
      padding: { x: 30, y: 15 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Menu button
    const menuButton = this.add.text(centerX, centerY + 100, 'MENU', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#444444',
      padding: { x: 30, y: 15 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Setup button interactions
    this.setupButton(retryButton, () => {
      this.scene.start(Scenes.GAME, { level: this.currentLevel });
    });

    this.setupButton(menuButton, () => {
      this.scene.start(Scenes.MENU);
    });
  }

  update(_time: number, delta: number): void {
    // Update starfield
    if (this.starField) {
      this.starField.update(delta);
    }
  }

  private setupButton(button: Phaser.GameObjects.Text, callback: () => void): void {
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.setScale(1);
    });

    button.on('pointerdown', callback);
  }
}
