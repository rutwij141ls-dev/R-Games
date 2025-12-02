const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const playerSelectDiv = document.getElementById('playerSelect');
const gameControlsDiv = document.getElementById('gameControls');
const startGameBtn = document.getElementById('startGameBtn');
const rollBtn = document.getElementById('rollBtn');
const newGameBtn = document.getElementById('newGameBtn');
const dice = document.getElementById('dice');
const diceFace = dice.querySelector('.dice-face');
const currentPlayerName = document.getElementById('currentPlayerName');
const currentPlayerPosition = document.getElementById('currentPlayerPosition');
const currentPlayerAvatar = document.getElementById('currentPlayerAvatar');
const playersListDiv = document.getElementById('playersList');
const winOverlay = document.getElementById('winOverlay');
const winnerText = document.getElementById('winnerText');
const playAgainBtn = document.getElementById('playAgainBtn');

const BOARD_SIZE = 10;
const CELL_SIZE = canvas.width / BOARD_SIZE;

const PLAYER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];

// Snakes and Ladders configuration
const SNAKES = {
    98: 28, 95: 24, 92: 51, 83: 19, 73: 1,
    69: 33, 64: 36, 59: 17, 52: 11, 48: 9
};

const LADDERS = {
    3: 21, 8: 30, 20: 41, 28: 53, 36: 57,
    43: 77, 54: 88, 62: 96, 66: 87, 74: 92
};

let numPlayers = 2;
let players = [];
let currentPlayerIndex = 0;
let gameActive = false;
let isAnimating = false;

// Audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playDiceSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playMoveSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

function playWinSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    [300, 400, 500, 600].forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
    });

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.6);
}

// Position conversion
function getPositionCoords(position) {
    if (position === 0) return { x: -1, y: BOARD_SIZE };

    const adjustedPos = position - 1;
    const row = BOARD_SIZE - 1 - Math.floor(adjustedPos / BOARD_SIZE);
    let col = adjustedPos % BOARD_SIZE;

    // Snake pattern
    if ((BOARD_SIZE - 1 - row) % 2 === 1) {
        col = BOARD_SIZE - 1 - col;
    }

    return { x: col, y: row };
}

function drawBoard() {
    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const numRow = BOARD_SIZE - 1 - row;
            const numCol = numRow % 2 === 0 ? col : BOARD_SIZE - 1 - col;
            const number = numRow * BOARD_SIZE + numCol + 1;

            // Cell background
            const gradient = ctx.createLinearGradient(
                col * CELL_SIZE, row * CELL_SIZE,
                (col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE
            );

            if ((row + col) % 2 === 0) {
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
            } else {
                gradient.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
                gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            // Cell border
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            // Number
            ctx.fillStyle = number === 100 ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)';
            ctx.font = number === 100 ? 'bold 16px Orbitron' : '14px Inter';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(number, col * CELL_SIZE + 5, row * CELL_SIZE + 5);
        }
    }

    // Draw snakes
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    Object.keys(SNAKES).forEach(head => {
        const tail = SNAKES[head];
        const headCoords = getPositionCoords(parseInt(head));
        const tailCoords = getPositionCoords(tail);

        const headX = headCoords.x * CELL_SIZE + CELL_SIZE / 2;
        const headY = headCoords.y * CELL_SIZE + CELL_SIZE / 2;
        const tailX = tailCoords.x * CELL_SIZE + CELL_SIZE / 2;
        const tailY = tailCoords.y * CELL_SIZE + CELL_SIZE / 2;

        // Snake body (wavy line)
        const gradient = ctx.createLinearGradient(headX, headY, tailX, tailY);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');

        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';

        ctx.beginPath();
        ctx.moveTo(headX, headY);

        // Create wavy path
        const dx = tailX - headX;
        const dy = tailY - headY;
        const steps = 20;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = headX + dx * t + Math.sin(t * Math.PI * 3) * 10;
            const y = headY + dy * t + Math.cos(t * Math.PI * 3) * 10;
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Snake head
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(headX, headY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX - 3, headY - 2, 2, 0, Math.PI * 2);
        ctx.arc(headX + 3, headY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw ladders
    Object.keys(LADDERS).forEach(bottom => {
        const top = LADDERS[bottom];
        const bottomCoords = getPositionCoords(parseInt(bottom));
        const topCoords = getPositionCoords(top);

        const bottomX = bottomCoords.x * CELL_SIZE + CELL_SIZE / 2;
        const bottomY = bottomCoords.y * CELL_SIZE + CELL_SIZE / 2;
        const topX = topCoords.x * CELL_SIZE + CELL_SIZE / 2;
        const topY = topCoords.y * CELL_SIZE + CELL_SIZE / 2;

        const offset = 8;

        // Ladder sides
        const gradient = ctx.createLinearGradient(bottomX, bottomY, topX, topY);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';

        ctx.beginPath();
        ctx.moveTo(bottomX - offset, bottomY);
        ctx.lineTo(topX - offset, topY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bottomX + offset, bottomY);
        ctx.lineTo(topX + offset, topY);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Rungs
        ctx.lineWidth = 3;
        const rungs = 5;
        for (let i = 0; i < rungs; i++) {
            const t = i / (rungs - 1);
            const rungY1 = bottomY + (topY - bottomY) * t;
            const rungY2 = rungY1;
            const rungX1 = bottomX - offset + (topX - bottomX) * t;
            const rungX2 = bottomX + offset + (topX - bottomX) * t;

            ctx.beginPath();
            ctx.moveTo(rungX1, rungY1);
            ctx.lineTo(rungX2, rungY2);
            ctx.stroke();
        }
    });

    // Draw players
    players.forEach((player, index) => {
        const coords = getPositionCoords(player.position);

        // Offset for multiple players on same cell
        const playersOnCell = players.filter(p => p.position === player.position);
        const playerIndexOnCell = playersOnCell.indexOf(player);
        const totalOnCell = playersOnCell.length;

        let offsetX = 0;
        let offsetY = 0;

        if (totalOnCell > 1) {
            const angle = (playerIndexOnCell / totalOnCell) * Math.PI * 2;
            offsetX = Math.cos(angle) * 12;
            offsetY = Math.sin(angle) * 12;
        }

        const x = coords.x * CELL_SIZE + CELL_SIZE / 2 + offsetX;
        const y = coords.y * CELL_SIZE + CELL_SIZE / 2 + offsetY;

        // Player circle
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.color;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, x, y);

        // Highlight current player
        if (index === currentPlayerIndex && gameActive) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function startGame() {
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            name: `Player ${i + 1}`,
            position: 0,
            color: PLAYER_COLORS[i]
        });
    }

    currentPlayerIndex = 0;
    gameActive = true;

    playerSelectDiv.classList.add('hidden');
    gameControlsDiv.classList.remove('hidden');

    updateUI();
    drawBoard();
}

function rollDice() {
    if (isAnimating) return;

    rollBtn.disabled = true;
    dice.classList.add('rolling');

    playDiceSound();

    // Animate dice
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        diceFace.textContent = Math.floor(Math.random() * 6) + 1;
        rollCount++;

        if (rollCount >= 10) {
            clearInterval(rollInterval);
            const diceValue = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = diceValue;
            dice.classList.remove('rolling');

            setTimeout(() => {
                movePlayer(diceValue);
            }, 300);
        }
    }, 50);
}

async function movePlayer(steps) {
    isAnimating = true;
    const player = players[currentPlayerIndex];
    let newPosition = player.position + steps;

    // Can't go beyond 100
    if (newPosition > 100) {
        isAnimating = false;
        rollBtn.disabled = false;
        nextPlayer();
        return;
    }

    // Animate movement
    for (let i = player.position + 1; i <= newPosition; i++) {
        player.position = i;
        drawBoard();
        updateUI();
        playMoveSound();
        await sleep(200);
    }

    // Check for snake or ladder
    if (SNAKES[newPosition]) {
        await sleep(500);
        const tail = SNAKES[newPosition];

        // Animate sliding down snake
        const steps = 20;
        const startCoords = getPositionCoords(newPosition);
        const endCoords = getPositionCoords(tail);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Don't update position during animation, just redraw
            drawBoard();

            // Draw sliding player
            const x = (startCoords.x + (endCoords.x - startCoords.x) * t) * CELL_SIZE + CELL_SIZE / 2;
            const y = (startCoords.y + (endCoords.y - startCoords.y) * t) * CELL_SIZE + CELL_SIZE / 2;

            ctx.fillStyle = player.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = player.color;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            await sleep(30);
        }

        player.position = tail;
        playMoveSound();
    } else if (LADDERS[newPosition]) {
        await sleep(500);
        const top = LADDERS[newPosition];

        // Animate climbing ladder
        const steps = 20;
        const startCoords = getPositionCoords(newPosition);
        const endCoords = getPositionCoords(top);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            drawBoard();

            const x = (startCoords.x + (endCoords.x - startCoords.x) * t) * CELL_SIZE + CELL_SIZE / 2;
            const y = (startCoords.y + (endCoords.y - startCoords.y) * t) * CELL_SIZE + CELL_SIZE / 2;

            ctx.fillStyle = player.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = player.color;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            await sleep(30);
        }

        player.position = top;
        playMoveSound();
    }

    drawBoard();
    updateUI();

    // Check win
    if (player.position === 100) {
        gameWon();
        return;
    }

    isAnimating = false;
    rollBtn.disabled = false;

    await sleep(500);
    nextPlayer();
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    updateUI();
}

function updateUI() {
    const currentPlayer = players[currentPlayerIndex];

    currentPlayerName.textContent = currentPlayer.name;
    currentPlayerPosition.textContent = `Position: ${currentPlayer.position}`;
    currentPlayerAvatar.style.backgroundColor = currentPlayer.color;

    // Update players list
    playersListDiv.innerHTML = '';
    players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `player-item ${index === currentPlayerIndex ? 'active' : ''}`;
        div.innerHTML = `
            <div class="player-item-avatar" style="background: ${player.color};"></div>
            <div class="player-item-info">
                <div class="player-item-name">${player.name}</div>
                <div class="player-item-position">Position: ${player.position}</div>
            </div>
        `;
        playersListDiv.appendChild(div);
    });
}

function gameWon() {
    gameActive = false;
    playWinSound();

    const winner = players[currentPlayerIndex];
    winnerText.textContent = `${winner.name} Wins!`;

    createFireworks();

    setTimeout(() => {
        winOverlay.classList.remove('hidden');
    }, 500);
}

function createFireworks() {
    const fireworksDiv = document.querySelector('.fireworks');

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
            particle.style.left = '50%';
            particle.style.top = '50%';

            fireworksDiv.appendChild(particle);

            const angle = (Math.random() * 360) * Math.PI / 180;
            const velocity = 100 + Math.random() * 150;

            particle.animate([
                {
                    transform: 'translate(0, 0)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }, i * 50);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetGame() {
    winOverlay.classList.add('hidden');
    playerSelectDiv.classList.remove('hidden');
    gameControlsDiv.classList.add('hidden');
    gameActive = false;
    isAnimating = false;
    rollBtn.disabled = false;
    drawBoard();
}

// Event listeners
document.querySelectorAll('.player-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        numPlayers = parseInt(btn.dataset.players);
    });
});

startGameBtn.addEventListener('click', startGame);
rollBtn.addEventListener('click', rollDice);
newGameBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// Initial draw
drawBoard();
