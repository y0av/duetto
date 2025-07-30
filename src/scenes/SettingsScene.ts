import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';
import { GameStateManager } from '../core/managers/GameStateManager';
import { StarField } from '../effects/StarField';
import { GameProperties } from '../config/GameProperties';

export class SettingsScene extends Phaser.Scene {
  private gameStateManager!: GameStateManager;
  private starField!: StarField;
  
  constructor() {
    super({ key: Scenes.SETTINGS });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 4;
    
    // Get responsive scaling factor
    const scale = Math.min(this.cameras.main.width / 1920, this.cameras.main.height / 1080);

    // Background with gradient effect
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Create starfield background
    this.starField = new StarField(this);

    // Get game state manager
    this.gameStateManager = GameStateManager.getInstance();
    // Settings title
    const title = this.add.text(centerX, centerY - (150 * scale), 'SETTINGS', {
      fontSize: Math.max(48 * scale, 32) + 'px',
      color: GameProperties.ui.colors.primary,
      fontFamily: GameProperties.ui.fonts.title,
      stroke: '#444444',
      strokeThickness: 4 * scale
    }).setOrigin(0.5);

    // Animated glow effect for title
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      scale: { from: 1, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });

    // Clear Color Splashes Button
    this.createClearSplashesButton(centerX, centerY + (20 * scale), scale);

    // Reset Progress Button
    this.createResetProgressButton(centerX, centerY + (290 * scale), scale);

    // Back Button
    this.createBackButton(centerX, centerY + (560 * scale), scale);
  }

  private createClearSplashesButton(x: number, y: number, scale: number): void {
    const buttonWidth = Math.max(320 * scale, 240);
    const buttonHeight = Math.max(60 * scale, 45);
    
    const container = this.add.container(x, y);
    
    // Button background
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    border.setStrokeStyle(Math.max(3 * scale, 2), 0xff8800);
    
    const buttonText = this.add.text(0, 0, 'CLEAR COLOR SPLASHES', {
      fontSize: Math.max(24 * scale, 16) + 'px',
      color: '#ff8800',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    container.add([bg, border, buttonText]);
    
    // Make button interactive
    this.setupButton(container, border, () => {
      this.clearColorSplashes();
    }, scale);
  }

  private createResetProgressButton(x: number, y: number, scale: number): void {
    const buttonWidth = Math.max(320 * scale, 240);
    const buttonHeight = Math.max(60 * scale, 45);
    
    const container = this.add.container(x, y);
    
    // Button background
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    border.setStrokeStyle(Math.max(3 * scale, 2), 0xff4444);
    
    const buttonText = this.add.text(0, 0, 'RESET PROGRESS', {
      fontSize: Math.max(24 * scale, 16) + 'px',
      color: '#ff4444',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    container.add([bg, border, buttonText]);
    
    // Make button interactive
    this.setupButton(container, border, () => {
      this.resetProgress();
    }, scale);
  }

  private createBackButton(x: number, y: number, scale: number): void {
    const buttonWidth = Math.max(200 * scale, 150);
    const buttonHeight = Math.max(50 * scale, 40);
    
    const container = this.add.container(x, y);
    
    // Button background
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    border.setStrokeStyle(Math.max(3 * scale, 2), 0x666666);
    
    const buttonText = this.add.text(0, 0, 'BACK', {
      fontSize: Math.max(20 * scale, 14) + 'px',
      color: '#cccccc',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    container.add([bg, border, buttonText]);
    
    // Make button interactive
    this.setupButton(container, border, () => {
      this.scene.start(Scenes.MENU);
    }, scale);
  }

  private setupButton(
    container: Phaser.GameObjects.Container, 
    border: Phaser.GameObjects.Rectangle, 
    onClick: () => void, 
    _scale: number
  ): void {
    const width = border.width;
    const height = border.height;
    
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), 
      Phaser.Geom.Rectangle.Contains
    );

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
        onComplete: onClick
      });
    });
  }

  private clearColorSplashes(): void {
    // Show confirmation dialog
    this.showConfirmationDialog(
      'Clear all color splashes?',
      'This will remove all paint splashes from all levels.',
      () => {
        this.gameStateManager.clearAllColorSplashes();
        this.showNotification('Color splashes cleared!', '#00ff44');
      }
    );
  }

  private resetProgress(): void {
    // Show confirmation dialog
    this.showConfirmationDialog(
      'Reset all progress?',
      'This will delete all completed levels and color splashes.',
      () => {
        this.gameStateManager.resetProgress();
        this.showNotification('Progress reset!', '#ff4444');
      }
    );
  }

  private showConfirmationDialog(title: string, message: string, onConfirm: () => void): void {
    const scale = Math.min(this.cameras.main.width / 1920, this.cameras.main.height / 1080);
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create overlay
    const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    overlay.setDepth(100);

    // Dialog background
    const dialogBg = this.add.rectangle(centerX, centerY, Math.max(400 * scale, 300), Math.max(250 * scale, 200), 0x222222);
    dialogBg.setStrokeStyle(Math.max(3 * scale, 2), 0x666666);
    dialogBg.setDepth(101);

    // Dialog title
    const dialogTitle = this.add.text(centerX, centerY - (60 * scale), title, {
      fontSize: Math.max(24 * scale, 18) + 'px',
      color: '#ffffff',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5).setDepth(102);

    // Dialog message
    const dialogMessage = this.add.text(centerX, centerY - (20 * scale), message, {
      fontSize: Math.max(16 * scale, 12) + 'px',
      color: '#cccccc',
      fontFamily: 'Exo 2, Arial, sans-serif',
      align: 'center',
      wordWrap: { width: Math.max(300 * scale, 250) }
    }).setOrigin(0.5).setDepth(102);

    // Confirm button
    const confirmContainer = this.add.container(centerX - (80 * scale), centerY + (60 * scale));
    const confirmBg = this.add.rectangle(0, 0, Math.max(120 * scale, 90), Math.max(40 * scale, 30), 0x333333);
    const confirmBorder = this.add.rectangle(0, 0, Math.max(120 * scale, 90), Math.max(40 * scale, 30));
    confirmBorder.setStrokeStyle(Math.max(2 * scale, 1), 0xff4444);
    const confirmText = this.add.text(0, 0, 'YES', {
      fontSize: Math.max(18 * scale, 14) + 'px',
      color: '#ff4444',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
    confirmContainer.add([confirmBg, confirmBorder, confirmText]);
    confirmContainer.setDepth(102);

    // Cancel button
    const cancelContainer = this.add.container(centerX + (80 * scale), centerY + (60 * scale));
    const cancelBg = this.add.rectangle(0, 0, Math.max(120 * scale, 90), Math.max(40 * scale, 30), 0x333333);
    const cancelBorder = this.add.rectangle(0, 0, Math.max(120 * scale, 90), Math.max(40 * scale, 30));
    cancelBorder.setStrokeStyle(Math.max(2 * scale, 1), 0x666666);
    const cancelText = this.add.text(0, 0, 'CANCEL', {
      fontSize: Math.max(18 * scale, 14) + 'px',
      color: '#cccccc',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
    cancelContainer.add([cancelBg, cancelBorder, cancelText]);
    cancelContainer.setDepth(102);

    const cleanup = () => {
      overlay.destroy();
      dialogBg.destroy();
      dialogTitle.destroy();
      dialogMessage.destroy();
      confirmContainer.destroy();
      cancelContainer.destroy();
    };

    // Setup button interactions
    this.setupDialogButton(confirmContainer, confirmBorder, () => {
      cleanup();
      onConfirm();
    });

    this.setupDialogButton(cancelContainer, cancelBorder, cleanup);
  }

  private setupDialogButton(
    container: Phaser.GameObjects.Container, 
    border: Phaser.GameObjects.Rectangle, 
    onClick: () => void
  ): void {
    const width = border.width;
    const height = border.height;
    
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), 
      Phaser.Geom.Rectangle.Contains
    );

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 150
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150
      });
    });

    container.on('pointerdown', onClick);
  }

  private showNotification(message: string, color: string): void {
    const scale = Math.min(this.cameras.main.width / 1920, this.cameras.main.height / 1080);
    const centerX = this.cameras.main.width / 2;
    
    const notification = this.add.text(centerX, 100 * scale, message, {
      fontSize: Math.max(20 * scale, 16) + 'px',
      color: color,
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5).setDepth(200);

    // Animate notification
    this.tweens.add({
      targets: notification,
      y: 150 * scale,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        notification.destroy();
      }
    });
  }

  update(_time: number, delta: number): void {
    // Update starfield
    if (this.starField) {
      this.starField.update(delta);
    }
  }
}
