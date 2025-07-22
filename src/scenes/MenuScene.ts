import Phaser from 'phaser';
import { Scenes } from '../types/GameTypes';
import { GameStateManager } from '../objects/GameStateManager';
import { StarField } from '../objects/StarField';
import { GameProperties } from '../config/GameProperties';

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private level1Button!: Phaser.GameObjects.Text;
  private level2Button!: Phaser.GameObjects.Text;
  private level3Button!: Phaser.GameObjects.Text;
  private starField!: StarField;
  private gameStateManager!: GameStateManager;

  constructor() {
    super({ key: Scenes.MENU });
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

    // Add subtle background glow effect
    const bgGlow = this.add.circle(centerX, centerY - (100 * scale), 400 * scale, 0x1a1a3a, 0.1);
    this.tweens.add({
      targets: bgGlow,
      alpha: 0.2,
      scale: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 3000,
      ease: 'Sine.easeInOut'
    });

    // Get game state manager
    this.gameStateManager = GameStateManager.getInstance();

    // Create floating geometric shapes for decoration
    this.createFloatingShapes(scale);

    // Main title with multiple effects
    this.createTitle(centerX, centerY, scale);

    // Subtitle with better mobile spacing
    const subtitle = this.add.text(centerX, centerY - (Math.max(80 * scale, 60)), 'A Minimalist Challenge', {
      fontSize: Math.max(20 * scale, 14) + 'px',
      color: '#888888',
      fontFamily: 'Exo 2, Arial, sans-serif',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: subtitle,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 2500,
      ease: 'Sine.easeInOut'
    });

    // Level buttons with modern design and mobile spacing
    this.createLevelButtons(centerX, centerY, scale);

    // Progress section with visual flair
    this.createProgressSection(centerX, centerY, scale);

    // Settings Button - positioned below progress section
    this.createSettingsButton(centerX, centerY + Math.max(300 * scale, 250), scale);

    // Instructions with animated icons
    this.createInstructions(centerX, scale);

    // Developer info
    this.add.text(centerX, this.cameras.main.height - (20 * scale), 
      'YoavZ', {
      fontSize: Math.max(12 * scale, 8) + 'px',
      color: '#444444',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
  }

  private createFloatingShapes(scale: number): void {
    // Create floating geometric shapes for visual interest
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(20, 60) * scale;
      
      const shape = this.add.circle(x, y, size, 0x333333, 0.1);
      
      // Floating animation
      this.tweens.add({
        targets: shape,
        y: y + Phaser.Math.Between(-50, 50),
        x: x + Phaser.Math.Between(-30, 30),
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createTitle(centerX: number, centerY: number, scale: number): void {
    // Main title with multiple layers for depth
    const titleShadow = this.add.text(centerX + 4, centerY - (150 * scale) + 4, 'DUETTO', {
      fontSize: Math.max(84 * scale, 42) + 'px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.titleText = this.add.text(centerX, centerY - (150 * scale), 'DUETTO', {
      fontSize: Math.max(84 * scale, 42) + 'px',
      color: GameProperties.ui.colors.primary,
      fontFamily: GameProperties.ui.fonts.title,
      stroke: '#444444',
      strokeThickness: 6 * scale
    }).setOrigin(0.5);

    // Gradient overlay effect
    const titleOverlay = this.add.text(centerX, centerY - (150 * scale), 'DUETTO', {
      fontSize: Math.max(84 * scale, 42) + 'px',
      color: GameProperties.ui.colors.accent,
      fontFamily: GameProperties.ui.fonts.title
    }).setOrigin(0.5);
    titleOverlay.setAlpha(0.3);

    // Animated glow effect
    this.tweens.add({
      targets: [this.titleText, titleOverlay],
      alpha: { from: 1, to: 0.7 },
      scale: { from: 1, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });

    // Pulsing shadow
    this.tweens.add({
      targets: titleShadow,
      alpha: { from: 0.5, to: 0.1 },
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });
  }

  private createLevelButtons(centerX: number, centerY: number, scale: number): void {
    const buttonWidth = Math.max(280 * scale, 200);
    const buttonHeight = Math.max(60 * scale, 45);
    const buttonSpacing = Math.max(90 * scale, 70); // Increased spacing for mobile

    // Level 1 Button
    const level1Completed = this.gameStateManager.isLevelCompleted(1);
    const level1Container = this.add.container(centerX, centerY + (Math.max(30 * scale, 20)));
    
    // Button background with gradient effect
    const level1Bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const level1Border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    level1Border.setStrokeStyle(Math.max(3 * scale, 2), level1Completed ? 0x00ff44 : 0xff4444);
    
    const level1Text = level1Completed ? 'LEVEL 1 ✓' : 'LEVEL 1';
    const level1Color = level1Completed ? '#00ff44' : '#ff4444';
    
    this.level1Button = this.add.text(0, 0, level1Text, {
      fontSize: Math.max(28 * scale, 18) + 'px',
      color: level1Color,
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    level1Container.add([level1Bg, level1Border, this.level1Button]);
    
    // Level 2 Button with better spacing
    const level2Completed = this.gameStateManager.isLevelCompleted(2);
    const level2Container = this.add.container(centerX, centerY + (Math.max(30 * scale, 20)) + buttonSpacing);
    
    const level2Bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const level2Border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    level2Border.setStrokeStyle(Math.max(3 * scale, 2), level2Completed ? 0x00ff44 : 0x4444ff);
    
    const level2Text = level2Completed ? 'LEVEL 2 ✓' : 'LEVEL 2';
    const level2Color = level2Completed ? '#00ff44' : '#4444ff';
    
    this.level2Button = this.add.text(0, 0, level2Text, {
      fontSize: Math.max(28 * scale, 18) + 'px',
      color: level2Color,
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    level2Container.add([level2Bg, level2Border, this.level2Button]);

    // Level 3 Button
    const level3Completed = this.gameStateManager.isLevelCompleted(3);
    const level3Container = this.add.container(centerX, centerY + (Math.max(30 * scale, 20)) + buttonSpacing * 2);
    
    const level3Bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const level3Border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    level3Border.setStrokeStyle(Math.max(3 * scale, 2), level3Completed ? 0x00ff44 : 0xff8800);
    
    const level3Text = level3Completed ? 'LEVEL 3 ✓' : 'LEVEL 3';
    const level3Color = level3Completed ? '#00ff44' : '#ff8800';
    
    this.level3Button = this.add.text(0, 0, level3Text, {
      fontSize: Math.max(28 * scale, 18) + 'px',
      color: level3Color,
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    level3Container.add([level3Bg, level3Border, this.level3Button]);

    // Make buttons interactive with hover effects
    this.setupModernButton(level1Container, level1Border, 1, scale);
    this.setupModernButton(level2Container, level2Border, 2, scale);
    this.setupModernButton(level3Container, level3Border, 3, scale);
  }

  private createSettingsButton(centerX: number, centerY: number, scale: number): void {
    const buttonWidth = Math.max(200 * scale, 150);
    const buttonHeight = Math.max(50 * scale, 40);

    const settingsContainer = this.add.container(centerX, centerY);
    
    // Button background
    const settingsBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    const settingsBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
    settingsBorder.setStrokeStyle(Math.max(2 * scale, 1), 0x888888);
    
    const settingsText = this.add.text(0, 0, 'SETTINGS', {
      fontSize: Math.max(20 * scale, 14) + 'px',
      color: '#888888',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    settingsContainer.add([settingsBg, settingsBorder, settingsText]);

    // Make button interactive
    this.setupSettingsButton(settingsContainer, settingsBorder, scale);
  }

  private createProgressSection(centerX: number, centerY: number, scale: number): void {
    const progress = this.gameStateManager.getProgress();
    
    // Progress container with better mobile spacing
    const progressY = centerY + Math.max(220 * scale, 180);
    const progressBarWidth = Math.max(200 * scale, 150);
    const progressBarHeight = Math.max(8 * scale, 6);
    
    // Progress bar background
    this.add.rectangle(centerX, progressY, progressBarWidth, progressBarHeight, 0x333333);
    
    // Progress bar fill - properly aligned
    if (progress.completed > 0) {
      const fillWidth = (progress.completed / progress.total) * progressBarWidth;
      const progressFill = this.add.rectangle(
        centerX - (progressBarWidth / 2) + (fillWidth / 2), // Properly positioned from left edge
        progressY,
        fillWidth,
        progressBarHeight,
        0x00ff44
      );
      
      // Animate progress bar
      this.tweens.add({
        targets: progressFill,
        alpha: { from: 0.7, to: 1 },
        yoyo: true,
        repeat: -1,
        duration: 1500,
        ease: 'Sine.easeInOut'
      });
    }

    // Progress text with better mobile spacing
    this.add.text(centerX, progressY + Math.max(30 * scale, 25), 
      `${progress.completed}/${progress.total} LEVELS COMPLETED`, {
      fontSize: Math.max(16 * scale, 12) + 'px',
      color: '#aaaaaa',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
  }

  private createInstructions(centerX: number, scale: number): void {
    const instructionsY = this.cameras.main.height - (80 * scale);
    
    // Control icons
    const leftIcon = this.add.circle(centerX - (60 * scale), instructionsY - (20 * scale), 15 * scale, 0xff4444, 0.7);
    const rightIcon = this.add.circle(centerX + (60 * scale), instructionsY - (20 * scale), 15 * scale, 0x4444ff, 0.7);
    
    this.add.text(centerX - (60 * scale), instructionsY - (20 * scale), 'L', {
      fontSize: Math.max(12 * scale, 8) + 'px',
      color: '#ffffff',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    this.add.text(centerX + (60 * scale), instructionsY - (20 * scale), 'R', {
      fontSize: Math.max(12 * scale, 8) + 'px',
      color: '#ffffff',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);

    // Pulse animation for icons
    this.tweens.add({
      targets: [leftIcon, rightIcon],
      scale: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    // Instructions text
    this.add.text(centerX, instructionsY+10, 
      'Tap screen sides or use arrow keys to rotate', {
      fontSize: Math.max(14 * scale, 10) + 'px',
      color: '#888888',
      fontFamily: 'Exo 2, Arial, sans-serif'
    }).setOrigin(0.5);
  }

  private setupModernButton(container: Phaser.GameObjects.Container, border: Phaser.GameObjects.Rectangle, level: number, scale: number): void {
    container.setInteractive(new Phaser.Geom.Rectangle(-140 * scale, -30 * scale, 280 * scale, 60 * scale), Phaser.Geom.Rectangle.Contains);
    container.setData('originalScale', 1);

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
        onComplete: () => {
          this.startLevel(level);
        }
      });
    });
  }

  private setupSettingsButton(container: Phaser.GameObjects.Container, border: Phaser.GameObjects.Rectangle, scale: number): void {
    container.setInteractive(new Phaser.Geom.Rectangle(-100 * scale, -25 * scale, 200 * scale, 50 * scale), Phaser.Geom.Rectangle.Contains);

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
        onComplete: () => {
          this.scene.start(Scenes.SETTINGS);
        }
      });
    });
  }

  update(_time: number, delta: number): void {
    // Update starfield
    if (this.starField) {
      this.starField.update(delta);
    }
  }

  private startLevel(level: number): void {
    this.scene.start(Scenes.GAME, { level });
  }
}
