import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';
import { StarField } from '../effects/StarField';

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
    
    // Get responsive scaling factor
    const scale = Math.min(this.cameras.main.width / 1920, this.cameras.main.height / 1080);

    // Background with gradient effect
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Create starfield background
    this.starField = new StarField(this);

    // Add dramatic background glow effect
    const bgGlow = this.add.circle(centerX, centerY, 500 * scale, 0x330000, 0.1);
    this.tweens.add({
      targets: bgGlow,
      alpha: 0.3,
      scale: 1.5,
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });

    // Create floating debris for atmosphere
    this.createFloatingDebris(scale);

    // Game Over title with multiple layers
    this.createGameOverTitle(centerX, centerY, scale);

    // Level indicator with style
    const levelContainer = this.add.container(centerX, centerY - Math.max(40 * scale, 30));
    
    const levelBg = this.add.rectangle(0, 0, Math.max(200 * scale, 120), Math.max(40 * scale, 30), 0x333333, 0.8);
    levelBg.setStrokeStyle(2, 0xff4444, 0.8);
    
    const levelText = this.add.text(0, 0, `LEVEL ${this.currentLevel}`, {
      fontSize: Math.max(20 * scale, 14) + 'px',
      color: '#ffffff',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
    
    levelContainer.add([levelBg, levelText]);

    // Modern button design with better mobile spacing
    this.createModernButtons(centerX, centerY, scale);

    // Dramatic failure message
    const failureMessages = [
      "Synchronization Failed",
      "Harmony Disrupted", 
      "Balance Lost",
      "Unity Broken"
    ];
    
    const randomMessage = failureMessages[Math.floor(Math.random() * failureMessages.length)];
    const failureText = this.add.text(centerX, this.cameras.main.height - Math.max(60 * scale, 40), randomMessage, {
      fontSize: Math.max(16 * scale, 12) + 'px',
      color: '#888888',
      fontFamily: 'Exo 2, Arial, sans-serif',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: failureText,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 3000,
      ease: 'Sine.easeInOut'
    });
  }

  private createFloatingDebris(scale: number): void {
    // Create floating debris particles for atmosphere
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(2, 8) * scale;
      
      const debris = this.add.rectangle(x, y, size, size, 0x444444, 0.3);
      debris.setRotation(Phaser.Math.Between(0, Math.PI * 2));
      
      // Floating animation
      this.tweens.add({
        targets: debris,
        y: y + Phaser.Math.Between(-100, 100),
        x: x + Phaser.Math.Between(-50, 50),
        rotation: debris.rotation + Phaser.Math.Between(-Math.PI, Math.PI),
        alpha: Phaser.Math.FloatBetween(0.1, 0.4),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createGameOverTitle(centerX: number, centerY: number, scale: number): void {
    // Shadow layer
    const titleShadow = this.add.text(centerX + 4, centerY - Math.max(100 * scale, 70) + 4, 'YOU DIED', {
      fontSize: Math.max(64 * scale, 32) + 'px',
      color: '#000000',
      fontFamily: 'Orbitron, Arial, sans-serif'
    }).setOrigin(0.5);

    // Main title
    const gameOverText = this.add.text(centerX, centerY - Math.max(100 * scale, 70), 'YOU DIED', {
      fontSize: Math.max(64 * scale, 32) + 'px',
      color: '#ff4444',
      fontFamily: 'Orbitron, Arial, sans-serif',
      stroke: '#660000',
      strokeThickness: Math.max(4 * scale, 2)
    }).setOrigin(0.5);

    // Glitch overlay effect
    const glitchOverlay = this.add.text(centerX, centerY - Math.max(100 * scale, 70), 'YOU DIED', {
      fontSize: Math.max(64 * scale, 32) + 'px',
      color: '#ff0000',
      fontFamily: 'Orbitron, Arial, sans-serif'
    }).setOrigin(0.5).setAlpha(0.3);

    // Dramatic pulsing animation
    this.tweens.add({
      targets: [gameOverText, glitchOverlay],
      alpha: { from: 1, to: 0.6 },
      scale: { from: 1, to: 1.1 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    // Shadow pulse
    this.tweens.add({
      targets: titleShadow,
      alpha: { from: 0.7, to: 0.2 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    // Glitch effect
    this.tweens.add({
      targets: glitchOverlay,
      x: centerX + Phaser.Math.Between(-2, 2),
      duration: 100,
      repeat: -1,
      yoyo: true
    });
  }

  private createModernButtons(centerX: number, centerY: number, scale: number): void {
    const buttonWidth = Math.max(200 * scale, 150);
    const buttonHeight = Math.max(50 * scale, 40);
    const buttonSpacing = Math.max(70 * scale, 50);

    // Retry button container
    const retryContainer = this.add.container(centerX, centerY + Math.max(40 * scale, 30));
    
    const retryBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x444444);
    const retryBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    retryBorder.setStrokeStyle(Math.max(3 * scale, 2), 0x00ff44);
    
    const retryText = this.add.text(0, 0, 'RETRY', {
      fontSize: Math.max(24 * scale, 16) + 'px',
      color: '#00ff44',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    retryContainer.add([retryBg, retryBorder, retryText]);

    // Menu button container
    const menuContainer = this.add.container(centerX, centerY + Math.max(40 * scale, 30) + buttonSpacing);
    
    const menuBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x444444);
    const menuBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    menuBorder.setStrokeStyle(Math.max(3 * scale, 2), 0x4444ff);
    
    const menuText = this.add.text(0, 0, 'MENU', {
      fontSize: Math.max(24 * scale, 16) + 'px',
      color: '#4444ff',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    menuContainer.add([menuBg, menuBorder, menuText]);

    // Setup button interactions
    this.setupModernButton(retryContainer, retryBorder, () => {
      this.scene.start(Scenes.GAME, { level: this.currentLevel });
    }, scale);

    this.setupModernButton(menuContainer, menuBorder, () => {
      this.scene.start(Scenes.MENU);
    }, scale);
  }

  private setupModernButton(container: Phaser.GameObjects.Container, border: Phaser.GameObjects.Rectangle, callback: () => void, scale: number): void {
    const buttonWidth = Math.max(200 * scale, 150);
    const buttonHeight = Math.max(50 * scale, 40);
    
    container.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 200,
        ease: 'Power2'
      });
      
      this.tweens.add({
        targets: border,
        alpha: 1,
        duration: 200
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
      
      this.tweens.add({
        targets: border,
        alpha: 0.8,
        duration: 200
      });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        onComplete: callback
      });
    });
  }

  update(_time: number, delta: number): void {
    // Update starfield
    if (this.starField) {
      this.starField.update(delta);
    }
  }
}
