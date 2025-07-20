import './style.css';
import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  parent: 'app',
  backgroundColor: '#0a0a0a',
  antialias: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
    roundPixels: true
  },
  input: {
    activePointers: 3 // Support multi-touch
  }
};

// Create and start the game
const game = new Phaser.Game(config);

// Make sure the game canvas is responsive
window.addEventListener('resize', () => {
  game.scale.refresh();
});
