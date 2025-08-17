class GameUI {
    constructor(game) {
        this.game = game;
        this.setupAdditionalUI();
    }

    setupAdditionalUI() {
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add mobile touch support
        this.setupTouchSupport();
        
        // Add visual feedback
        this.setupVisualFeedback();
        
        // Add tooltip functionality
        this.setupTooltip();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.game.newGame();
                }
            }
            
            if (e.key === 'Escape') {
                this.showGameMenu();
            }
        });
    }

    setupTouchSupport() {
        let touchStartTime = 0;
        let touchStartCell = null;
        
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('touchstart', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                touchStartTime = Date.now();
                touchStartCell = cell;
            }
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            const cell = e.target.closest('.cell');
            if (cell && cell === touchStartCell) {
                const touchDuration = Date.now() - touchStartTime;
                
                if (touchDuration > 500) {
                    // Long press - flag
                    e.preventDefault();
                    this.game.handleRightClick(cell);
                } else {
                    // Short press - reveal
                    this.game.handleCellClick(cell);
                }
            }
            
            touchStartTime = 0;
            touchStartCell = null;
        });
    }

    setupVisualFeedback() {
        // Add hover effects for cells
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('revealed')) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
        });
        
        gameBoard.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('cell')) {
                e.target.style.transform = '';
                e.target.style.boxShadow = '';
            }
        });
    }

    showGameMenu() {
        const menu = document.createElement('div');
        menu.className = 'game-menu-overlay';
        menu.innerHTML = `
            <div class="game-menu">
                <h3>Minesweeper Menu</h3>
                <div class="menu-options">
                    <button class="btn btn-primary" id="resume-game">Nastavi Igru</button>
                    <button class="btn btn-secondary" id="new-game-menu">Nova Igra</button>
                    <button class="btn btn-secondary" id="change-difficulty">Promeni Težinu</button>
                    <button class="btn btn-secondary" id="close-menu">Zatvori</button>
                </div>
            </div>
        `;
        
        // Add event listeners for menu buttons
        this.setupMenuEventListeners(menu);
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelector('#resume-game').addEventListener('click', () => {
            this.hideGameMenu();
        });
        
        menu.querySelector('#new-game-menu').addEventListener('click', () => {
            this.game.newGame();
            this.hideGameMenu();
        });
        
        menu.querySelector('#change-difficulty').addEventListener('click', () => {
            this.showDifficultySelector();
        });
        
        menu.querySelector('#close-menu').addEventListener('click', () => {
            this.hideGameMenu();
        });
        
        // Close on overlay click
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                this.hideGameMenu();
            }
        });
    }

    hideGameMenu() {
        const menu = document.querySelector('.game-menu-overlay');
        if (menu) {
            menu.remove();
        }
    }

    showDifficultySelector() {
        const selector = document.createElement('div');
        selector.className = 'difficulty-selector-modal';
        selector.innerHTML = `
            <div class="difficulty-modal">
                <h3>Izaberi Težinu</h3>
                <div class="difficulty-options">
                    <div class="difficulty-option" data-difficulty="beginner">
                        <h4>Početnik</h4>
                        <p>9x9 polja, 10 mina</p>
                    </div>
                    <div class="difficulty-option" data-difficulty="intermediate">
                        <h4>Srednji</h4>
                        <p>16x16 polja, 40 mina</p>
                    </div>
                    <div class="difficulty-option" data-difficulty="expert">
                        <h4>Ekspert</h4>
                        <p>16x30 polja, 99 mina</p>
                    </div>
                </div>
                <button class="btn btn-secondary" id="cancel-difficulty">Otkaži</button>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        // Add event listeners
        selector.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', () => {
                const difficulty = option.dataset.difficulty;
                document.getElementById('difficulty').value = difficulty;
                this.game.currentDifficulty = difficulty;
                this.game.newGame();
                this.hideDifficultySelector();
                this.hideGameMenu();
            });
        });
        
        selector.querySelector('#cancel-difficulty').addEventListener('click', () => {
            this.hideDifficultySelector();
        });
        
        // Close on overlay click
        selector.addEventListener('click', (e) => {
            if (e.target === selector) {
                this.hideDifficultySelector();
            }
        });
    }

    hideDifficultySelector() {
        const selector = document.querySelector('.difficulty-selector-modal');
        if (selector) {
            selector.remove();
        }
    }

    showCongratulations() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-container';
        confetti.innerHTML = `
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }

    updateProgressBar() {
        if (!this.game.board) return;
        
        const gameState = this.game.board.getGameState();
        const progress = (gameState.revealedCount / (gameState.totalCells - gameState.totalMines)) * 100;
        
        // Create progress bar if it doesn't exist
        let progressBar = document.querySelector('.game-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'game-progress';
            progressBar.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">${Math.round(progress)}%</div>
            `;
            
            const gameInfo = document.querySelector('.game-info');
            gameInfo.appendChild(progressBar);
        }
        
        // Update progress
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressText = progressBar.querySelector('.progress-text');
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    setupTooltip() {
        const infoBtn = document.getElementById('info-btn');
        const instructions = document.getElementById('game-instructions');
        
        if (!infoBtn || !instructions) return;
        
        // Position instructions relative to info button
        const header = document.querySelector('.game-header');
        header.style.position = 'relative';
        
        // Toggle tooltip on click
        infoBtn.addEventListener('click', () => {
            instructions.classList.toggle('show');
        });
        
        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!infoBtn.contains(e.target) && !instructions.contains(e.target)) {
                instructions.classList.remove('show');
            }
        });
        
        // Close tooltip on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                instructions.classList.remove('show');
            }
        });
    }
}

// Initialize UI when game is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game to be initialized
    setTimeout(() => {
        if (window.game) {
            window.gameUI = new GameUI(window.game);
        }
    }, 100);
});
