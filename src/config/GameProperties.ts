/**
 * Game Properties Configuration
 * 
 * This file contains all the customizable visual and gameplay properties
 * for easy tweaking without diving into the source code.
 */

export const GameProperties = {
  // Debug and Development
  debug: {
    // Touch zone visibility (set to 0 to hide completely)
    touchZoneOpacity: 0.05,
    // Enable console logging for touch events
    enableTouchLogging: true,
    // Show debug info in development mode
    showDebugInfo: process.env.NODE_ENV === 'development'
  },

  // Visual Effects
  visual: {
    // Background glow effects
    backgroundGlow: {
      alpha: 0.1,
      pulseIntensity: 0.2,
      pulseDuration: 3000
    },
    
    // Floating shapes/debris
    floatingShapes: {
      count: 8,
      minSize: 20,
      maxSize: 60,
      opacity: 0.1,
      animationDuration: {
        min: 3000,
        max: 6000
      }
    },

    // Starfield
    starfield: {
      starCount: 200,
      colors: [0xffffff, 0xffffaa, 0xaaaaff, 0xffaaaa],
      speed: 0.5,
      twinkleChance: 0.01
    },

    // Particle effects
    particles: {
      collision: {
        mainBurst: 80,
        screenWideBlast: 60,
        sparkles: 100,
        debris: 40,
        lightning: 12
      },
      celebration: {
        count: 50,
        colors: [0x00ff00, 0x00ff88, 0x44ff44, 0xffffff]
      }
    }
  },

  // Player Configuration
  player: {
    // Orb appearance
    orbSize: 15,
    glowIntensity: 0.8,
    pulseSpeed: 1000,
    pulseScale: 1.1,
    
    // Movement
    rotationSpeed: 0.004,
    
    // Colors
    redOrbColor: 0xff3333,
    redOrbGlow: 0xff6666,
    blueOrbColor: 0x3333ff,
    blueOrbGlow: 0x6666ff,
    
    // Trail Effects
    trail: {
      enabled: true,
      length: 20, // More segments for smoother trail
      fadeSpeed: 0.06, // Slower fade for longer trails
      minAlpha: 0.05, // Very low minimum for smooth fade-out
      maxAlpha: 0.8, // Good visibility
      scaleReduction: 0.92, // Gentler size reduction
      updateFrequency: 16, // 60fps updates for smoothness
      smoothing: 0.6 // Higher smoothing for fluid motion
    }
  },

  // UI Styling
  ui: {
    // Fonts
    fonts: {
      title: 'Orbitron, Arial, sans-serif',
      body: 'Exo 2, Arial, sans-serif',
      fallback: 'Arial, sans-serif'
    },

    // Colors
    colors: {
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#00ffff',
      success: '#00ff44',
      error: '#ff4444',
      warning: '#ffaa00',
      background: '#0a0a0a',
      border: '#333333'
    },

    // Animations
    animations: {
      buttonHoverScale: 1.05,
      buttonPressScale: 0.95,
      transitionDuration: 200,
      titlePulseDuration: 2000,
      progressBarPulseDuration: 1500
    },

    // Spacing (mobile-friendly)
    spacing: {
      buttonSpacing: 70, // pixels at 1920x1080, scales down
      minButtonSpacing: 50, // minimum spacing on mobile
      menuElementSpacing: 30,
      minMenuElementSpacing: 20
    }
  },

  // Gameplay
  gameplay: {
    // Collision
    collisionRadius: 15,
    
    // Level progression
    maxLevels: 2,
    
    // Timing
    gameOverDelay: 1000, // ms to show particles before game over
    levelCompleteDelay: 3000, // ms to show celebration before menu
    
    // Obstacles
    obstacles: {
      baseGap: 250, // pixels at 1920x1080
      minGap: 180, // minimum gap on mobile
      fallSpeed: 2,
      spawnDelay: {
        level1: 2000, // ms
        level2: 1500
      }
    }
  },

  // Mobile Optimization
  mobile: {
    // Minimum sizes to ensure usability
    minOrbRadius: 80,
    minButtonHeight: 40,
    minButtonWidth: 150,
    minFontSize: {
      title: 32,
      button: 16,
      body: 12,
      small: 8
    },
    
    // Touch zones
    touchZonePadding: 0, // Extra padding around touch zones
    
    // Responsive scaling
    breakpoints: {
      mobile: 768, // width in pixels
      tablet: 1024
    }
  }
};

// Type definitions for better IDE support
export type GamePropertiesType = typeof GameProperties;
