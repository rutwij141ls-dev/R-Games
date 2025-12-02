// Welcome music
let welcomeMusicPlayed = false;

function playWelcomeMusic() {
    if (welcomeMusicPlayed) return;
    welcomeMusicPlayed = true;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Musical notes for a pleasant welcome melody
    const notes = [
        { freq: 523.25, time: 0 },      // C5
        { freq: 659.25, time: 0.3 },    // E5
        { freq: 783.99, time: 0.6 },    // G5
        { freq: 1046.50, time: 0.9 },   // C6
        { freq: 987.77, time: 1.2 },    // B5
        { freq: 783.99, time: 1.5 },    // G5
        { freq: 659.25, time: 1.8 },    // E5
        { freq: 523.25, time: 2.1 }     // C5
    ];

    notes.forEach(note => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.time);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + note.time);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + note.time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + note.time + 0.25);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime + note.time);
        oscillator.stop(audioCtx.currentTime + note.time + 0.3);
    });

    // Add harmony
    const harmonyNotes = [
        { freq: 392.00, time: 0 },      // G4
        { freq: 493.88, time: 0.3 },    // B4
        { freq: 587.33, time: 0.6 },    // D5
        { freq: 783.99, time: 0.9 }     // G5
    ];

    harmonyNotes.forEach(note => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.time);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + note.time);
        gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + note.time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + note.time + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime + note.time);
        oscillator.stop(audioCtx.currentTime + note.time + 0.5);
    });
}

// Play welcome music on user interaction (browsers require user gesture)
document.addEventListener('DOMContentLoaded', () => {
    // Show a subtle hint to click anywhere
    const welcomeHint = document.createElement('div');
    welcomeHint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        padding: 2rem 3rem;
        border-radius: 20px;
        border: 2px solid rgba(99, 102, 241, 0.5);
        text-align: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease;
        cursor: pointer;
    `;

    welcomeHint.innerHTML = `
        <div style="font-family: 'Orbitron', sans-serif; font-size: 2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Welcome to R-Games!
        </div>
        <div style="color: #a5b4fc; font-size: 1rem;">
            Click anywhere to enter
        </div>
    `;

    document.body.appendChild(welcomeHint);

    const handleClick = () => {
        playWelcomeMusic();
        welcomeHint.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            welcomeHint.remove();
        }, 500);
        document.removeEventListener('click', handleClick);
    };

    document.addEventListener('click', handleClick);
});

// Add fade animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
`;
document.head.appendChild(style);

// Enhanced interactions for the main menu

document.addEventListener('DOMContentLoaded', () => {
    // Add particle effect on hover
    const cards = document.querySelectorAll('.game-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, var(--glow-primary) 0%, transparent 50%)`;
            }
        });

        // Add click ripple effect
        card.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');

            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: ripple-animation 0.6s ease-out;
            `;

            card.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add keyframe animation for ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            from {
                transform: scale(0);
                opacity: 1;
            }
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Parallax effect for cards
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.game-card');
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;

        cards.forEach((card, index) => {
            const intensity = (index + 1) * 2;
            card.style.transform = `
                translateX(${x * intensity}px) 
                translateY(${y * intensity}px)
            `;
        });
    });
});
