# Settings Guide - English Typing Game

## New Features Added

### 1. Settings Button (⚙️)
A gear icon button has been added to the header that opens the settings modal for vocabulary management.

### 2. Lives/Mistakes System
The game now uses a lives system instead of negative scores:
- **Default Lives**: 5 mistakes allowed (configurable in [`game_setting.json`](game_setting.json:1))
- **Level Up Bonus**: +2 extra lives every time you level up
- **Game Over**: When lives reach 0
- **Visual Feedback**: Lives display changes color based on remaining lives:
  - 🟢 Green: More than half lives remaining
  - 🟠 Orange: Half or fewer lives remaining
  - 🔴 Red: 2 or fewer lives remaining

### 3. Vocabulary Management System

#### Features:
- **Add New Words**: Add custom words to any category
- **Add New Categories**: Create your own word categories
- **View Words**: Browse all words in each category
- **Delete Words**: Remove unwanted words from categories
- **Delete Categories**: Remove entire categories (except "all")

### 4. JSON-Based Vocabulary Storage

The game now reads vocabulary from [`vocabulary.json`](vocabulary.json:1) instead of hardcoded data in [`game.js`](game.js:1).

#### File Structure:
```json
{
  "category_name": ["word1", "word2", "word3"],
  "animals": ["cat", "dog", "bird"],
  "fruits": ["apple", "banana", "orange"]
}
```

### 5. Data Persistence

The system uses two methods to save vocabulary:

1. **LocalStorage** (Primary): Automatically saves to browser's localStorage
2. **PHP Backend** (Optional): If [`save-vocabulary.php`](save-vocabulary.php:1) is available on a server

### 6. Player Name System
- Enter your name when first launching the game
- Name is saved permanently in localStorage
- Displays in the header during gameplay

### 7. Sound Effects
Complete audio feedback system:
- ✅ Correct word typed
- ❌ Word missed (life lost)
- 🎮 Game over
- ⬆️ Level up

### 8. Pause/Resume Button
- Icon-only button (⏸/▶)
- Tooltip shows current action on hover
- Pauses all game activity

## Game Settings Configuration

### [`game_setting.json`](game_setting.json:1) Structure:
```json
{
  "playerName": "",
  "allowedMistakes": 5
}
```

### Settings Explained:

#### `playerName` (string)
- Player's display name
- Automatically saved when entered
- Managed through localStorage

#### `allowedMistakes` (number)
- **Default**: 5
- Number of mistakes allowed before game over
- Increases by +2 every level up
- Example progression:
  - Level 1: 5 lives
  - Level 2: 7 lives (5 + 2)
  - Level 3: 9 lives (7 + 2)
  - Level 4: 11 lives (9 + 2)

### Modifying Settings:

**To change default allowed mistakes:**
1. Open [`game_setting.json`](game_setting.json:1)
2. Change `"allowedMistakes": 5` to your desired number
3. Save the file
4. Reload the game

**Example - Start with 10 lives:**
```json
{
  "playerName": "",
  "allowedMistakes": 10
}
```

## How to Use Settings

### Adding a New Word:
1. Click the ⚙️ settings button
2. Stay on the "Manage Words" tab
3. Enter the word in the "Word" field
4. Select the category from the dropdown
5. Click "Add Word"

### Adding a New Category:
1. Click the ⚙️ settings button
2. Switch to the "Manage Categories" tab
3. Enter the category name
4. Click "Add Category"
5. The new category will appear in the game immediately

### Viewing Words:
1. Click the ⚙️ settings button
2. In the "Manage Words" tab
3. Select a category from "View Category" dropdown
4. All words in that category will be displayed

### Deleting Words/Categories:
1. Navigate to the appropriate tab
2. Click the "Delete" button next to the item you want to remove
3. Confirm the deletion

## Technical Details

### Files Modified:
- [`index.html`](index.html:1) - Added settings button and modal structure
- [`style.css`](style.css:1) - Added styles for settings modal and management interface
- [`game.js`](game.js:1) - Implemented vocabulary loading and management functions

### Files Created:
- [`vocabulary.json`](vocabulary.json:1) - Vocabulary data storage
- [`save-vocabulary.php`](save-vocabulary.php:1) - Optional PHP backend for saving

### Key Functions in game.js:
- `loadVocabulary()` - Loads vocabulary from JSON file
- `saveVocabulary()` - Saves vocabulary to localStorage/server
- `addWord()` - Adds a new word to a category
- `addCategory()` - Creates a new category
- `deleteWord()` - Removes a word from a category
- `deleteCategory()` - Removes an entire category
- `updateCategoryButtons()` - Updates category buttons dynamically

## Running with PHP Backend (Optional)

If you want to persist changes to the JSON file on the server:

1. Place all files on a PHP-enabled web server
2. Ensure [`vocabulary.json`](vocabulary.json:1) has write permissions
3. The game will automatically try to save to the server
4. If server save fails, it falls back to localStorage

## Running Without PHP Backend

The game works perfectly without PHP:
- Open [`index.html`](index.html:1) directly in a browser
- All changes are saved to localStorage
- Vocabulary persists between sessions in the same browser

## Browser Compatibility

- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Game Mechanics

### Scoring System:
- +1 point for each correct word typed
- No score deduction for mistakes
- Level up every 10 points

### Lives System:
- Start with 5 lives (configurable)
- Lose 1 life when a word reaches the bottom
- Gain +2 lives on level up
- Game over when lives reach 0

### Difficulty Progression:
- Words fall faster as level increases
- More words spawn simultaneously at higher levels
- Spawn rate increases with level

## Notes

- The "all" category cannot be deleted (it's the default category)
- Duplicate words in the same category are not allowed
- Category names are automatically converted to lowercase
- All changes are saved automatically
- Lives system prevents frustration from negative scores
- Level up rewards encourage continued play
