class GameUI {
    constructor(game) {
        this.game = game;
        this.setupAdditionalUI();
    }

    setupAdditionalUI() {
        console.log('🔧 Setting up additional UI...');
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add mobile touch support
        this.setupTouchSupport();
        
        // Add visual feedback
        this.setupVisualFeedback();
        
        // Add tooltip functionality
        console.log('🔧 Setting up tooltip...');
        this.setupTooltip();
        
        // Add drawer functionality
        console.log('🔧 Setting up drawer...');
        this.setupDrawer();
        
        console.log('✅ Additional UI setup complete!');
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
        
        console.log('🔧 Setting up tooltip...');
        console.log('Info button:', infoBtn);
        console.log('Instructions:', instructions);
        
        if (!infoBtn || !instructions) {
            console.error('❌ Info button or instructions not found!');
            return;
        }
        
        // Position instructions relative to info button
        const header = document.querySelector('.game-header');
        if (header) {
            header.style.position = 'relative';
            console.log('✅ Header positioned relatively');
        }
        
        // Toggle tooltip on click
        infoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Info button clicked!');
            instructions.classList.toggle('show');
            console.log('Tooltip visible:', instructions.classList.contains('show'));
        });
        
        // Close tooltip when clicking outside (but not on drawer elements)
        document.addEventListener('click', (e) => {
            const drawerToggle = document.getElementById('drawer-toggle');
            const drawer = document.getElementById('stats-drawer');
            
            // Don't close tooltip if clicking on drawer elements
            if (drawerToggle && drawerToggle.contains(e.target)) return;
            if (drawer && drawer.contains(e.target)) return;
            
            if (!infoBtn.contains(e.target) && !instructions.contains(e.target)) {
                instructions.classList.remove('show');
                console.log('🔒 Tooltip closed (click outside)');
            }
        });
        
        // Close tooltip on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                instructions.classList.remove('show');
                console.log('🔒 Tooltip closed (Escape key)');
            }
        });
        
        console.log('✅ Tooltip setup complete!');
    }
    
    setupDrawer() {
        const drawerToggle = document.getElementById('drawer-toggle');
        const drawer = document.getElementById('stats-drawer');
        const drawerClose = document.getElementById('drawer-close');
        
        console.log('🔧 Setting up drawer...');
        console.log('Drawer toggle:', drawerToggle);
        console.log('Drawer:', drawer);
        console.log('Drawer close:', drawerClose);
        
        if (!drawerToggle || !drawer || !drawerClose) {
            console.error('❌ Drawer elements not found!');
            return;
        }
        
        // Check if drawer is already initialized
        if (drawerToggle.dataset.initialized === 'true') {
            console.log('Drawer already initialized, skipping...');
            return;
        }
        
        // Mark as initialized
        drawerToggle.dataset.initialized = 'true';
        
        // Toggle drawer on button click
        drawerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Drawer toggle clicked!');
            
            const isOpen = drawer.classList.contains('open');
            console.log('Drawer currently open:', isOpen);
            
            if (isOpen) {
                console.log('Closing drawer...');
                drawer.classList.remove('open');
                this.removeDrawerOverlay();
            } else {
                console.log('Opening drawer...');
                drawer.classList.add('open');
                console.log('Drawer classes after adding open:', drawer.className);
                this.addDrawerOverlay();
            }
            
            // Force reflow to ensure CSS is applied
            drawer.offsetHeight;
        });
        
        // Close drawer on close button
        drawerClose.addEventListener('click', () => {
            console.log('🔒 Drawer close clicked!');
            drawer.classList.remove('open');
            this.removeDrawerOverlay();
        });
        
        // Close drawer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                console.log('🔒 Drawer closed (Escape key)');
                drawer.classList.remove('open');
                this.removeDrawerOverlay();
            }
        });
        
        // Close drawer when clicking outside (on overlay)
        document.addEventListener('click', (e) => {
            // Only close drawer if clicking on overlay, not on other elements
            if (e.target.classList.contains('drawer-overlay')) {
                console.log('🔒 Drawer closed (overlay click)');
                drawer.classList.remove('open');
                this.removeDrawerOverlay();
            }
        });
        
        console.log('✅ Drawer setup complete!');
    }
    
    addDrawerOverlay() {
        console.log('Adding drawer overlay...');
        
        // Remove existing overlay if any
        this.removeDrawerOverlay();
        
        const overlay = document.createElement('div');
        overlay.className = 'drawer-overlay';
        document.body.appendChild(overlay);
        
        console.log('Overlay created:', overlay);
        
        // Show overlay with animation
        setTimeout(() => {
            overlay.classList.add('show');
            console.log('Overlay shown with show class');
        }, 10);
    }
    
    removeDrawerOverlay() {
        console.log('Removing drawer overlay...');
        const overlay = document.querySelector('.drawer-overlay');
        if (overlay) {
            console.log('Found overlay, removing show class...');
            overlay.classList.remove('show');
            setTimeout(() => {
                console.log('Removing overlay element...');
                overlay.remove();
            }, 300);
        } else {
            console.log('No overlay found to remove');
        }
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
