# Retro Games Collection

A stunning collection of classic retro games built with modern web technologies. Experience Snake, Tic-Tac-Toe, and Snake & Ladder like never before with premium graphics, smooth animations, and responsive design.

## 🎮 Games Included

### 1. Snake
- Classic snake gameplay with modern visuals
- Gradient snake with glowing effects
- Particle effects when eating food
- Progressive difficulty (speed increases)
- High score tracking with local storage
- Smooth animations and sound effects

### 2. Tic-Tac-Toe
- Beautiful animated X and O symbols
- Hover preview system
- Winner detection with celebration effects
- Confetti animation on win
- Sound effects for moves and wins
- Smooth transitions and glow effects

### 3. Snake & Ladder
- Full 10x10 game board (1-100)
- 1-4 player support
- 10 snakes and 10 ladders
- Animated dice rolling
- Smooth player movement animations
- Visual representation of snakes and ladders on board
- Fireworks celebration on win
- Player tracking panel

## 🎨 Features

- **Premium Design**: Modern UI with glassmorphism, gradients, and glow effects
- **Smooth Animations**: Every interaction is animated for a premium feel
- **Sound Effects**: Audio feedback for all game actions
- **Responsive**: Works on desktop and mobile devices
- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Animated Background**: Starfield effect with twinkling stars

## 🚀 How to Play

1. Open `index.html` in a modern web browser
2. Select a game from the main menu
3. Follow on-screen instructions for each game

### Controls

**Snake:**
- Arrow keys or WASD to move
- Avoid walls and your own tail
- Eat food to grow and score points

**Tic-Tac-Toe:**
- Click on empty cells to place your mark
- Get 3 in a row to win
- Press "New Game" to restart

**Snake & Ladder:**
- Select number of players (1-4)
- Click "Roll Dice" on your turn
- First to reach 100 wins!

## 🎯 Technology Stack

- **HTML5**: Semantic structure with Canvas API for Snake & Ladder
- **CSS3**: Modern features including:
  - CSS Grid & Flexbox for layout
  - Custom properties (CSS variables)
  - Animations and transitions
  - Backdrop filters for glassmorphism
  - Gradients and box shadows
- **JavaScript (ES6+)**: 
  - Canvas API for game rendering
  - Web Audio API for sound effects
  - Async/await for animations
  - Local Storage for high scores

## 🌟 Design Highlights

- **Color Scheme**: Rich, vibrant colors with purpose
  - Snake: Green gradient theme
  - Tic-Tac-Toe: Blue & Pink dual theme
  - Snake & Ladder: Purple & Gold royal theme
- **Typography**: Orbitron for headings, Inter for body text
- **Effects**: Glow, particle systems, confetti, fireworks
- **Accessibility**: High contrast, clear feedback

## 📱 Browser Support

Works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎓 Code Structure

```
retro_games_web/
├── index.html          # Main menu
├── styles.css          # Main menu styles
├── script.js           # Main menu interactions
├── snake.html          # Snake game
├── snake.css           # Snake styles
├── snake.js            # Snake game logic
├── tictactoe.html      # Tic-Tac-Toe game
├── tictactoe.css       # Tic-Tac-Toe styles
├── tictactoe.js        # Tic-Tac-Toe logic
├── snakeladder.html    # Snake & Ladder game
├── snakeladder.css     # Snake & Ladder styles
├── snakeladder.js      # Snake & Ladder logic
└── README.md           # This file
```

## 🏆 Game Rules

### Snake
- Start with a snake of length 3
- Use arrow keys to move
- Eat red food to grow by 1 segment
- Don't hit walls or yourself
- Game speeds up every 50 points

### Tic-Tac-Toe
- Two players alternate placing X and O
- Get 3 marks in a row (horizontal, vertical, or diagonal) to win
- If all 9 cells are filled with no winner, it's a draw

### Snake & Ladder
- Players start at position 0
- Roll dice (1-6) to move forward
- Landing on ladder bottom: climb to the top
- Landing on snake head: slide down to tail
- Exact roll needed to reach 100
- First to reach 100 wins

## 🎨 Customization

You can customize colors by editing CSS variables in each CSS file:

```css
:root {
    --primary: #yourcolor;
    --secondary: #yourcolor;
    /* ... */
}
```

## 📄 License

Free to use for personal and educational purposes.

## 🤝 Credits

Built with ❤️ using modern web technologies.
Fonts: Google Fonts (Orbitron, Inter)

---

**Enjoy the games!** 🎮✨
