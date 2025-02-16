const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const PARTICLE_COUNT = 50;
const SMOKE_COUNT = 20;

const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.96;
    }
}

class Smoke {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 10;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = -Math.random() * 2 - 1;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 1.02;
    }
}

class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = BLOCK_SIZE * BOARD_WIDTH;
        this.canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
        
        this.ctx.scale(1, 1);
        
        this.scoreElement = document.getElementById('score');
        this.score = 0;
        this.timeCounter = 0;
        
        // Add glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        
        // Add line clear animation properties
        this.clearingLines = [];
        this.clearAnimationFrame = 0;
        
        // Add particle system
        this.particles = [];
        this.smokes = [];
        
        this.reset();
    }

    reset() {
        this.board = this.createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
        this.piece = this.createPiece(Math.floor(Math.random() * 7) + 1);
        this.pos = {x: 3, y: 0};
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.gameOver = false;
        this.timeCounter = 0;
        this.score = 0;
        this.updateScore();
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    createPiece(type) {
        return SHAPES[type];
    }

    rotatePiece(matrix, dir = 1) {
        // Transpose the matrix
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < y; x++) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        
        // Reverse each row for clockwise, columns for counter-clockwise
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    createBlastEffect(y) {
        // Create particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = Math.random() * this.canvas.width;
            const color = COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1];
            this.particles.push(new Particle(x, y * BLOCK_SIZE + BLOCK_SIZE / 2, color));
        }
        
        // Create smoke
        for (let i = 0; i < SMOKE_COUNT; i++) {
            const x = Math.random() * this.canvas.width;
            this.smokes.push(new Smoke(x, y * BLOCK_SIZE + BLOCK_SIZE / 2));
        }
    }

    drawEffects() {
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Draw smoke
        this.smokes.forEach(smoke => {
            this.ctx.save();
            this.ctx.globalAlpha = smoke.life * 0.3;
            const gradient = this.ctx.createRadialGradient(
                smoke.x, smoke.y, 0,
                smoke.x, smoke.y, smoke.size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw ghost piece
        this.drawGhostPiece();

        // Draw board
        this.drawMatrix(this.board, {x: 0, y: 0});
        
        // Draw current piece
        this.drawMatrix(this.piece, this.pos, true);

        // Draw effects
        this.drawEffects();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 0.5;

        // Vertical lines
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawGhostPiece() {
        const ghostPos = {...this.pos};
        
        // Find the lowest possible position
        while (!this.collide(this.piece, ghostPos)) {
            ghostPos.y++;
        }
        ghostPos.y--;

        // Draw ghost piece
        this.ctx.globalAlpha = 0.2;
        this.drawMatrix(this.piece, ghostPos);
        this.ctx.globalAlpha = 1;
    }

    drawMatrix(matrix, offset, isActive = false) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // Save context for glow effect
                    this.ctx.save();
                    
                    if (isActive) {
                        // Add stronger glow for active piece
                        this.ctx.shadowBlur = 15;
                        this.ctx.shadowColor = COLORS[value];
                    }

                    // Draw block with gradient
                    const gradient = this.ctx.createLinearGradient(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        (x + offset.x + 1) * BLOCK_SIZE,
                        (y + offset.y + 1) * BLOCK_SIZE
                    );
                    gradient.addColorStop(0, COLORS[value]);
                    gradient.addColorStop(1, this.darkenColor(COLORS[value], 30));
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );

                    // Draw block border
                    this.ctx.strokeStyle = this.darkenColor(COLORS[value], 50);
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );

                    // Restore context
                    this.ctx.restore();
                }
            });
        });
    }

    drawClearAnimation() {
        this.clearAnimationFrame++;
        const animationWidth = (this.clearAnimationFrame * this.canvas.width / 10);
        
        this.ctx.fillStyle = '#fff';
        this.clearingLines.forEach(y => {
            this.ctx.globalAlpha = 1 - (this.clearAnimationFrame / 10);
            this.ctx.fillRect(
                this.canvas.width / 2 - animationWidth / 2,
                y * BLOCK_SIZE,
                animationWidth,
                BLOCK_SIZE
            );
        });
        this.ctx.globalAlpha = 1;

        if (this.clearAnimationFrame >= 10) {
            this.clearingLines = [];
            this.clearAnimationFrame = 0;
        }
    }

    merge() {
        this.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[y + this.pos.y][x + this.pos.x] = value;
                }
            });
        });
    }

    collide(piece = this.piece, pos = this.pos) {
        const [m, o] = [piece, pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (this.board[y + o.y] &&
                    this.board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    clearLines() {
        let linesCleared = 0;
        
        // Check from bottom to top
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            let isLineFull = true;
            
            // Check if line is full
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x] === 0) {
                    isLineFull = false;
                    break;
                }
            }
            
            // If line is full, remove it
            if (isLineFull) {
                // Create blast effect before removing line
                this.createBlastEffect(y);
                
                // Remove the line
                this.board.splice(y, 1);
                // Add new empty line at top
                this.board.unshift(new Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                // Stay on same line since we removed one
                y++;
            }
        }
        
        // Update score if lines were cleared
        if (linesCleared > 0) {
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared];
            this.updateScore();
        }
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // Update smoke
        this.smokes = this.smokes.filter(smoke => {
            smoke.update();
            return smoke.life > 0;
        });

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }

        this.timeCounter += deltaTime;
        if (this.timeCounter >= 1000) {
            this.score += 1;
            this.timeCounter -= 1000;
            this.updateScore();
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    drop() {
        this.pos.y++;
        if (this.collide()) {
            this.pos.y--;
            this.merge();
            this.clearLines();
            this.piece = this.createPiece(Math.floor(Math.random() * 7) + 1);
            this.pos.y = 0;
            this.pos.x = 3;
            
            if (this.collide()) {
                this.gameOver = true;
                this.reset();
            }
        }
        this.dropCounter = 0;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (1 << 24 | (R < 255 ? R < 1 ? 0 : R : 255) << 16 
                              | (G < 255 ? G < 1 ? 0 : G : 255) << 8 
                              | (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Initialize game
const canvas = document.getElementById('gameCanvas');
const game = new Tetris(canvas);

// Start the game
game.update();

// Handle controls
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // Left arrow
        game.pos.x--;
        if (game.collide()) {
            game.pos.x++;
        }
    } else if (event.keyCode === 39) { // Right arrow
        game.pos.x++;
        if (game.collide()) {
            game.pos.x--;
        }
    } else if (event.keyCode === 40) { // Down arrow
        game.drop();
    } else if (event.keyCode === 38) { // Up arrow
        const piece = game.piece;
        game.rotatePiece(piece);
        if (game.collide()) {
            game.rotatePiece(piece, -1);
        }
    }
}); 