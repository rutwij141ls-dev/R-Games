const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverlay = document.getElementById('gameOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let gameInterval;
let isGameRunning = false;
let gameSpeed = 150;

highScoreElement.textContent = highScore;

// Audio context for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playEatSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playGameOverSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    dx = 1;
    dy = 0;
    gameSpeed = 150;
    scoreElement.textContent = score;
    placeFood();
    gameOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    isGameRunning = true;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);

    draw();
}

function gameLoop() {
    if (!isGameRunning) return;
    update();
    draw();
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check collision with self
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        playEatSound();
        placeFood();

        // Speed up game slightly
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        // Particle effect
        createParticles(head.x * gridSize + gridSize / 2, head.y * gridSize + gridSize / 2);
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food with glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw food highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2 - 2,
        food.y * gridSize + gridSize / 2 - 2,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
        const isHead = index === 0;

        if (isHead) {
            // Draw head with gradient
            const headGradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2,
                0,
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2,
                gridSize
            );
            headGradient.addColorStop(0, '#34d399');
            headGradient.addColorStop(1, '#10b981');

            ctx.shadowBlur = 15;
            ctx.shadowColor = '#10b981';
            ctx.fillStyle = headGradient;
        } else {
            // Body segments
            const alpha = 1 - (index / snake.length) * 0.3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(16, 185, 129, ${alpha})`;
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        }

        // Draw rounded rectangle
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        const size = gridSize - 2;
        const radius = 4;

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();

        // Eyes for head
        if (isHead) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            const eyeOffset = 6;

            if (dx !== 0) {
                // Looking left or right
                const eyeX = segment.x * gridSize + (dx > 0 ? gridSize - eyeOffset : eyeOffset);
                ctx.fillRect(eyeX, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(eyeX, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else {
                // Looking up or down
                const eyeY = segment.y * gridSize + (dy > 0 ? gridSize - eyeOffset : eyeOffset);
                ctx.fillRect(segment.x * gridSize + eyeOffset, eyeY, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, eyeY, eyeSize, eyeSize);
            }
        }
    });

    ctx.shadowBlur = 0;
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    playGameOverSound();

    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }

    finalScoreElement.textContent = score;
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 500);
}

function handleInput(e) {
    if (!isGameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
    e.preventDefault();
}

// Particle system
function createParticles(x, y) {
    const particleCount = 10;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1
        });
    }

    function animateParticles() {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.restore();

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });

        if (particles[0].life > 0) {
            requestAnimationFrame(animateParticles);
        }
    }

    animateParticles();
}

// Event listeners
document.addEventListener('keydown', handleInput);
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

// Initial draw
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#0a0a1a');
gradient.addColorStop(1, '#0f0f23');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#10b981';
ctx.font = '20px Orbitron';
ctx.textAlign = 'center';
ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2);
