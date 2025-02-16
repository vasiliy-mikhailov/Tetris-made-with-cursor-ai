# Tetris Game Development

This repository contains a Tetris game implementation with visual effects and scoring system. The development process was iterative, with various features added step by step.

## Development Dialog

### Initial Development
**User:** Let's start from scratch. Make plain tetris game.

**Assistant:** Created a basic Tetris implementation with:
- Standard game mechanics
- Basic controls
- Line clearing
- Game over detection

**User:** Problem: there is first block, but it does not fall

**Assistant:** Fixed the falling mechanism by:
- Initializing lastTime in constructor
- Adding fallback for first frame deltaTime
- Adding line clearing functionality

**User:** Add score counter

**Assistant:** Added scoring system:
- Score display in HTML
- Points for clearing lines
- Time-based scoring (1 point per second)

**User:** Problem: game does not delete full lines and does not add score on full lines

**Assistant:** Fixed line clearing and scoring:
- Removed animation delay
- Implemented immediate line clearing
- Fixed scoring calculation for cleared lines

**User:** Add stunning visual blast with smoke when line or lines are deleted

**Assistant:** Added particle effects system:
- Colorful particles explosion
- Smoke effects
- Dynamic visual feedback for line clears
- Smooth animations

**User:** Make readme.md file and put there our dialog.

**Assistant:** Created initial README.md with development history.

**User:** Put to readme.md all my commands starting Make plain tetris game.

**Assistant:** Updated README.md with complete command history.

## Final Features

### Game Mechanics
- Classic Tetris gameplay
- Line clearing
- Piece rotation
- Collision detection
- Game over detection

### Visual Effects
- Particle explosions
- Smoke effects
- Grid background
- Ghost piece preview
- Gradient-colored blocks
- Glow effects

### Scoring System
- Points for line clears:
  - 1 line = 100 points
  - 2 lines = 300 points
  - 3 lines = 500 points
  - 4 lines = 800 points
- Time-based scoring (1 point per second)

### Controls
- Left Arrow: Move piece left
- Right Arrow: Move piece right
- Down Arrow: Drop piece faster
- Up Arrow: Rotate piece

## Files
- `index.html`: Game layout and styling
- `tetris.js`: Game logic and visual effects
- `README.md`: Documentation

## How to Run
1. Save all files in the same directory
2. Open index.html in a web browser
3. Use arrow keys to play 