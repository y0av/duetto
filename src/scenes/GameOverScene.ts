import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';

export class GameOverScene extends Phaser.Scene {
  private currentLevel: number = 1;

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
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Game Over text
    this.add.text(centerX, centerY - 80, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Level indicator
    this.add.text(centerX, centerY - 30, `Level ${this.currentLevel}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(centerX, centerY + 30, 'RETRY', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Menu button
    const menuButton = this.add.text(centerX, centerY + 80, 'MENU', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Setup button interactions
    this.setupButton(retryButton, () => {
      this.scene.start(Scenes.GAME, { level: this.currentLevel });
    });

    this.setupButton(menuButton, () => {
      this.scene.start(Scenes.MENU);
    });
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
