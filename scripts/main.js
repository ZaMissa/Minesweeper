// Main initialization script for Minesweeper game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    window.game = new MinesweeperGame();
    
    // Create initial board UI
    window.game.createBoardUI();
    
    // Initialize UI enhancements
    window.gameUI = new GameUI(window.game);
    
    console.log('🎮 Blagoje Minesweeper initialized successfully!');
    console.log('💡 Tips:');
    console.log('   - Left click to reveal cells');
    console.log('   - Right click to place/remove flags');
    console.log('   - Press Escape for game menu');
    console.log('   - Ctrl+R for new game');
});

// Add some helpful console messages
console.log('🚀 Loading Blagoje Minesweeper...');
console.log('📱 Game supports both desktop and mobile devices');
console.log('🎯 Three difficulty levels available');
console.log('⏱️  Timer and mine counter included');
