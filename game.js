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

// Vocabulary storage (loaded from JSON)
let vocabularyByCategory = {};

// Sound effects
const correctSound = new Audio('effects/typing_true.wav');
const gameOverSound = new Audio('effects/game_over.wav');
const scoreDownSound = new Audio('effects/score_down.wav');
const levelUpSound = new Audio('effects/level_up.wav');

// Load vocabulary from JSON file
async function loadVocabulary() {
    try {
        const response = await fetch('vocabulary.json');
        vocabularyByCategory = await response.json();
        console.log('Vocabulary loaded successfully');
        updateCategoryButtons();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        // Fallback to default vocabulary
        vocabularyByCategory = {
            abc: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            animals: ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'rabbit', 'horse', 'cow', 'pig', 'sheep', 'duck', 'frog'],
            fruits: ['apple', 'banana', 'orange', 'grape', 'mango', 'peach', 'pear', 'cherry', 'lemon', 'melon', 'berry', 'plum'],
            colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'brown', 'gray', 'orange'],
            shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'oval', 'diamond', 'rectangle'],
            all: ['cat', 'dog', 'bird', 'fish', 'tree', 'sun', 'moon', 'star', 'book', 'pen', 'ball', 'car', 'bus', 'home', 'door', 'window', 'apple', 'banana', 'orange', 'grape', 'water', 'milk', 'bread', 'chair', 'table', 'bed', 'lamp', 'clock', 'phone', 'computer', 'happy', 'sad', 'big', 'small', 'hot', 'cold', 'fast', 'slow', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple']
        };
    }
}

// Save vocabulary to JSON file
async function saveVocabulary() {
    try {
        const response = await fetch('save-vocabulary.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vocabularyByCategory)
        });
        
        if (response.ok) {
            console.log('Vocabulary saved successfully');
            return true;
        } else {
            console.error('Failed to save vocabulary');
            // Save to localStorage as fallback
            localStorage.setItem('vocabulary', JSON.stringify(vocabularyByCategory));
            console.log('Vocabulary saved to localStorage');
            return true;
        }
    } catch (error) {
        console.error('Error saving vocabulary:', error);
        // Save to localStorage as fallback
        localStorage.setItem('vocabulary', JSON.stringify(vocabularyByCategory));
        console.log('Vocabulary saved to localStorage');
        return true;
    }
}

// Load vocabulary from localStorage if available
function loadFromLocalStorage() {
    const saved = localStorage.getItem('vocabulary');
    if (saved) {
        vocabularyByCategory = JSON.parse(saved);
        console.log('Vocabulary loaded from localStorage');
        return true;
    }
    return false;
}

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
    
    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(err => console.log('Sound play failed:', err));
    
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
                
                // Play score down sound
                scoreDownSound.currentTime = 0;
                scoreDownSound.play().catch(err => console.log('Sound play failed:', err));
                
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
    if (!currentVocabulary || currentVocabulary.length === 0) {
        console.warn('No words available in current category');
        return;
    }
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
    const categoryBtn = document.querySelector(`[data-category="${category}"]`);
    if (categoryBtn) {
        categoryBtn.classList.add('active');
    }
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
        
        // Play correct sound effect
        correctSound.currentTime = 0; // Reset sound to start
        correctSound.play().catch(err => console.log('Sound play failed:', err));
        
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
    
    // Play level up sound
    levelUpSound.currentTime = 0;
    levelUpSound.play().catch(err => console.log('Sound play failed:', err));
    
    // Restart game with new speed
    startGame();
}

// Update display
function updateDisplay() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
}

// Settings Modal Functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('show');
    displayWords();
    displayCategories();
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('show');
}

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Add new word
function addWord() {
    const wordInput = document.getElementById('new-word');
    const categorySelect = document.getElementById('word-category');
    
    const word = wordInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    
    if (!word) {
        alert('Please enter a word');
        return;
    }
    
    // Add word to category
    if (!vocabularyByCategory[category]) {
        vocabularyByCategory[category] = [];
    }
    
    if (vocabularyByCategory[category].includes(word)) {
        alert('This word already exists in the category');
        return;
    }
    
    vocabularyByCategory[category].push(word);
    
    // Save to storage
    saveVocabulary();
    
    // Clear input
    wordInput.value = '';
    
    // Refresh display
    displayWords();
    
    alert('Word added successfully!');
}

// Delete word
function deleteWord(category, word) {
    if (confirm(`Are you sure you want to delete "${word}"?`)) {
        const index = vocabularyByCategory[category].indexOf(word);
        if (index > -1) {
            vocabularyByCategory[category].splice(index, 1);
            saveVocabulary();
            displayWords();
        }
    }
}

// Display words
function displayWords() {
    const viewCategory = document.getElementById('view-category').value;
    const wordsList = document.getElementById('words-list');
    
    wordsList.innerHTML = '';
    
    if (!vocabularyByCategory[viewCategory] || vocabularyByCategory[viewCategory].length === 0) {
        wordsList.innerHTML = '<div class="empty-message">No words in this category</div>';
        return;
    }
    
    vocabularyByCategory[viewCategory].forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <span>${word}</span>
            <button class="delete-btn" onclick="deleteWord('${viewCategory}', '${word}')">Delete</button>
        `;
        wordsList.appendChild(wordItem);
    });
}

// Add new category
function addCategory() {
    const categoryInput = document.getElementById('new-category');
    const categoryName = categoryInput.value.trim().toLowerCase();
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    if (vocabularyByCategory[categoryName]) {
        alert('This category already exists');
        return;
    }
    
    // Add new category
    vocabularyByCategory[categoryName] = [];
    
    // Save to storage
    saveVocabulary();
    
    // Clear input
    categoryInput.value = '';
    
    // Update displays
    displayCategories();
    updateCategorySelects();
    updateCategoryButtons();
    
    alert('Category added successfully!');
}

// Delete category
function deleteCategory(category) {
    if (category === 'all') {
        alert('Cannot delete the "all" category');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the "${category}" category?`)) {
        delete vocabularyByCategory[category];
        saveVocabulary();
        displayCategories();
        updateCategorySelects();
        updateCategoryButtons();
    }
}

// Display categories
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    
    Object.keys(vocabularyByCategory).forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        const wordCount = vocabularyByCategory[category].length;
        categoryItem.innerHTML = `
            <span><strong>${category}</strong> (${wordCount} words)</span>
            ${category !== 'all' ? `<button class="delete-btn" onclick="deleteCategory('${category}')">Delete</button>` : ''}
        `;
        categoriesList.appendChild(categoryItem);
    });
}

// Update category selects in settings
function updateCategorySelects() {
    const wordCategorySelect = document.getElementById('word-category');
    const viewCategorySelect = document.getElementById('view-category');
    
    const categories = Object.keys(vocabularyByCategory);
    
    // Update word category select
    wordCategorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        wordCategorySelect.appendChild(option);
    });
    
    // Update view category select
    viewCategorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        viewCategorySelect.appendChild(option);
    });
}

// Update category buttons in main game
function updateCategoryButtons() {
    const categoryButtons = document.querySelector('.category-buttons');
    categoryButtons.innerHTML = '';
    
    Object.keys(vocabularyByCategory).forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        if (category === currentCategory) {
            button.classList.add('active');
        }
        button.setAttribute('data-category', category);
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.addEventListener('click', () => {
            changeCategory(category);
        });
        categoryButtons.appendChild(button);
    });
}

// Event listeners
wordInput.addEventListener('input', checkWord);

// Prevent form submission on Enter and clear input on Space
wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
    // Clear input when spacebar is pressed
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        wordInput.value = '';
    }
});

// Start game when page loads
window.addEventListener('load', async () => {
    // Try to load from localStorage first, then from JSON
    if (!loadFromLocalStorage()) {
        await loadVocabulary();
    }
    
    initGame();
    
    // Add event listener to pause button
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // Settings modal event listeners
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    
    // Close modal when clicking outside
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            closeSettings();
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Add word button
    document.getElementById('add-word-btn').addEventListener('click', addWord);
    
    // Add category button
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
    
    // View category change
    document.getElementById('view-category').addEventListener('change', displayWords);
});
