// Game state
let score = 0;
let level = 1;
let fallingWords = [];
let gameInterval;
let spawnInterval;
let baseSpeed = 2000; // Base time for word to fall (milliseconds)
let currentCategory = 'all';
let isGameOver = false;
let isPaused = false;

// Categorized vocabulary
const vocabularyByCategory = {
    abc: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    animals: ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'rabbit', 'horse', 'cow', 'pig', 'sheep', 'duck', 'frog'],
    fruits: ['apple', 'banana', 'orange', 'grape', 'mango', 'peach', 'pear', 'cherry', 'lemon', 'melon', 'berry', 'plum'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'brown', 'gray', 'orange'],
    shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'oval', 'diamond', 'rectangle'],
    all: ['cat', 'dog', 'bird', 'fish', 'tree', 'sun', 'moon', 'star',
          'book', 'pen', 'ball', 'car', 'bus', 'home', 'door', 'window',
          'apple', 'banana', 'orange', 'grape', 'water', 'milk', 'bread',
          'chair', 'table', 'bed', 'lamp', 'clock', 'phone', 'computer',
          'happy', 'sad', 'big', 'small', 'hot', 'cold', 'fast', 'slow',
        'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple'],
};

// DOM elements
const gameArea = document.getElementById('game-area');
const wordInput = document.getElementById('word-input');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

// Word class
class FallingWord {
    constructor(word) {
        this.word = word;
        this.element = document.createElement('div');
        this.element.className = 'falling-word';
        this.element.textContent = word;
        this.element.style.left = Math.random() * (gameArea.offsetWidth - 150) + 'px';
        this.element.style.top = '-50px';
        gameArea.appendChild(this.element);
        
        this.position = -50;
        this.speed = this.calculateSpeed();
    }
    
    calculateSpeed() {
        // Speed increases with level
        return 1 + (level * 0.3);
    }
    
    fall() {
        this.position += this.speed;
        this.element.style.top = this.position + 'px';
        
        // Check if word reached bottom
        if (this.position > gameArea.offsetHeight) {
            return true; // Word reached bottom
        }
        return false;
    }
    
    remove() {
        this.element.classList.add('word-disappear');
        setTimeout(() => {
            if (this.element.parentNode) {
                gameArea.removeChild(this.element);
            }
        }, 300);
    }
}

// Initialize game
function initGame() {
    score = 0;
    level = 1;
    fallingWords = [];
    isGameOver = false;
    updateDisplay();
    startGame();
}

// Game Over
function gameOver() {
    isGameOver = true;
    
    // Stop all intervals
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);
    
    // Clear all falling words
    fallingWords.forEach(wordObj => wordObj.remove());
    fallingWords = [];
    
    // Show game over message
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-message';
    gameOverDiv.innerHTML = `
        <h1>GAME OVER!</h1>
        <p>Final Score: ${score}</p>
        <p>Level Reached: ${level}</p>
        <button onclick="restartGame()" class="restart-btn">Play Again</button>
    `;
    gameArea.appendChild(gameOverDiv);
    
    // Disable input
    wordInput.disabled = true;
}

// Restart game
function restartGame() {
    // Remove game over message
    const gameOverMsg = document.querySelector('.game-over-message');
    if (gameOverMsg) {
        gameOverMsg.remove();
    }
    
    // Enable input
    wordInput.disabled = false;
    wordInput.value = '';
    wordInput.focus();
    
    // Restart game
    initGame();
}

// Start game loop
function startGame() {
    // Clear any existing intervals
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);
    
    // Game loop - move words
    gameInterval = setInterval(() => {
        if (isGameOver || isPaused) return;
        
        fallingWords = fallingWords.filter(wordObj => {
            const reachedBottom = wordObj.fall();
            if (reachedBottom) {
                wordObj.remove();
                
                // Deduct points equal to current level when word reaches bottom
                score -= level;
                updateDisplay();
                
                // Check for game over
                if (score < 0) {
                    gameOver();
                }
                
                return false;
            }
            return true;
        });
    }, 30);
    
    // Spawn new words
    spawnWord();
    spawnInterval = setInterval(() => {
        if (!isGameOver && !isPaused) {
            spawnWord();
        }
    }, 2000 - (level * 100)); // Spawn faster as level increases
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    const wordInput = document.getElementById('word-input');
    
    if (isPaused) {
        pauseBtn.textContent = '▶ Resume';
        pauseBtn.classList.add('paused');
        wordInput.disabled = true;
    } else {
        pauseBtn.textContent = '⏸ Pause';
        pauseBtn.classList.remove('paused');
        wordInput.disabled = false;
        wordInput.focus();
    }
}

// Spawn a new word
function spawnWord() {
    const currentVocabulary = vocabularyByCategory[currentCategory];
    const randomWord = currentVocabulary[Math.floor(Math.random() * currentVocabulary.length)];
    const newWord = new FallingWord(randomWord);
    fallingWords.push(newWord);
}

// Change category
function changeCategory(category) {
    currentCategory = category;
    
    // Clear all falling words
    fallingWords.forEach(wordObj => wordObj.remove());
    fallingWords = [];
    
    // Reset score and level
    score = 0;
    level = 1;
    updateDisplay();
    
    // Restart game with new category
    startGame();
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
}

// Check typed word
function checkWord() {
    const typedWord = wordInput.value.trim().toLowerCase();
    
    if (typedWord === '') return;
    
    // Find matching word
    const matchIndex = fallingWords.findIndex(wordObj => wordObj.word === typedWord);
    
    if (matchIndex !== -1) {
        // Correct word typed
        const matchedWord = fallingWords[matchIndex];
        matchedWord.remove();
        fallingWords.splice(matchIndex, 1);
        
        // Update score
        score++;
        updateDisplay();
        
        // Check for level up (every 10 points)
        if (score % 10 === 0) {
            levelUp();
        }
        
        // Visual feedback
        wordInput.classList.add('correct-animation');
        setTimeout(() => {
            wordInput.classList.remove('correct-animation');
        }, 300);
        
        // Clear input
        wordInput.value = '';
    }
}

// Level up
function levelUp() {
    level++;
    updateDisplay();
    
    // Restart game with new speed
    startGame();
}

// Update display
function updateDisplay() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
}

// Event listeners
wordInput.addEventListener('input', checkWord);

// Prevent form submission on Enter
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Start game when page loads
window.addEventListener('load', () => {
    initGame();
    
    // Add event listeners to category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            changeCategory(category);
        });
    });
    
    // Add event listener to pause button
    document.getElementById('pause-btn').addEventListener('click', togglePause);
});
