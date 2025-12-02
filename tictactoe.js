const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const currentPlayerElement = document.getElementById('currentPlayer');
const playerIcon = document.getElementById('playerIcon');
const resetBtn = document.getElementById('resetBtn');
const winOverlay = document.getElementById('winOverlay');
const winText = document.getElementById('winText');
const playAgainBtn = document.getElementById('playAgainBtn');

let isXTurn = true;
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Audio context for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playMoveSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playWinSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.2);
    oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.4);
    oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.6);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.6);
}

function handleClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (boardState[index] !== '') return;

    // Place mark
    const currentClass = isXTurn ? 'x' : 'o';
    boardState[index] = currentClass;
    cell.classList.add(currentClass);

    // Add SVG icon
    const svg = createSVG(currentClass);
    cell.appendChild(svg);

    playMoveSound();

    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
    }
}

function createSVG(type) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');

    if (type === 'x') {
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '20');
        line1.setAttribute('y1', '20');
        line1.setAttribute('x2', '80');
        line1.setAttribute('y2', '80');
        line1.setAttribute('stroke', 'currentColor');
        line1.setAttribute('stroke-width', '8');
        line1.setAttribute('stroke-linecap', 'round');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '80');
        line2.setAttribute('y1', '20');
        line2.setAttribute('x2', '20');
        line2.setAttribute('y2', '80');
        line2.setAttribute('stroke', 'currentColor');
        line2.setAttribute('stroke-width', '8');
        line2.setAttribute('stroke-linecap', 'round');

        svg.appendChild(line1);
        svg.appendChild(line2);
    } else {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '50');
        circle.setAttribute('cy', '50');
        circle.setAttribute('r', '30');
        circle.setAttribute('stroke', 'currentColor');
        circle.setAttribute('stroke-width', '8');
        circle.setAttribute('fill', 'none');

        svg.appendChild(circle);
    }

    return svg;
}

function swapTurns() {
    isXTurn = !isXTurn;
    updatePlayerIndicator();
}

function updatePlayerIndicator() {
    currentPlayerElement.textContent = `Player ${isXTurn ? 'X' : 'O'}`;

    const xIcon = playerIcon.querySelector('.x-icon');
    const oIcon = playerIcon.querySelector('.o-icon');

    if (isXTurn) {
        xIcon.classList.add('active');
        oIcon.classList.remove('active');
    } else {
        xIcon.classList.remove('active');
        oIcon.classList.add('active');
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        const isWin = combination.every(index => {
            return boardState[index] === currentClass;
        });

        if (isWin) {
            // Highlight winning cells
            combination.forEach(index => {
                cells[index].classList.add('winner');
            });
        }

        return isWin;
    });
}

function isDraw() {
    return boardState.every(cell => cell !== '');
}

function endGame(draw) {
    gameActive = false;

    setTimeout(() => {
        if (draw) {
            winText.textContent = "It's a Draw!";
        } else {
            winText.textContent = `Player ${isXTurn ? 'X' : 'O'} Wins!`;
            playWinSound();
        }
        winOverlay.classList.remove('hidden');
    }, 500);
}

function resetGame() {
    gameActive = true;
    isXTurn = true;
    boardState = ['', '', '', '', '', '', '', '', ''];

    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'winner');
        cell.innerHTML = '';
    });

    winOverlay.classList.add('hidden');
    updatePlayerIndicator();
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleClick);

    // Hover effect
    cell.addEventListener('mouseenter', () => {
        if (gameActive && !cell.classList.contains('x') && !cell.classList.contains('o')) {
            const preview = createSVG(isXTurn ? 'x' : 'o');
            preview.style.opacity = '0.3';
            preview.style.pointerEvents = 'none';
            preview.classList.add('preview');
            cell.appendChild(preview);
        }
    });

    cell.addEventListener('mouseleave', () => {
        const preview = cell.querySelector('.preview');
        if (preview) {
            preview.remove();
        }
    });
});

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// Initialize
updatePlayerIndicator();

// Confetti effect for win
function createConfetti() {
    const confettiCount = 50;
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';

        document.body.appendChild(confetti);

        const fall = confetti.animate([
            {
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        fall.onfinish = () => confetti.remove();
    }
}

// Override endGame to add confetti
const originalEndGame = endGame;
endGame = function (draw) {
    originalEndGame(draw);
    if (!draw) {
        setTimeout(createConfetti, 300);
    }
};
