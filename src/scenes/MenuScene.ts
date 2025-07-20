import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private level1Button!: Phaser.GameObjects.Text;
  private level2Button!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: Scenes.MENU });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Title
    this.titleText = this.add.text(centerX, centerY - 100, 'DUET', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Level 1 Button
    this.level1Button = this.add.text(centerX, centerY, 'LEVEL 1', {
      fontSize: '24px',
      color: '#ff4444',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Level 2 Button
    this.level2Button = this.add.text(centerX, centerY + 60, 'LEVEL 2', {
      fontSize: '24px',
      color: '#4444ff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Make buttons interactive
    this.setupButton(this.level1Button, 1);
    this.setupButton(this.level2Button, 2);

    // Instructions
    this.add.text(centerX, this.cameras.main.height - 60, 
      'Use LEFT/RIGHT arrows or click screen sides to rotate', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
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
