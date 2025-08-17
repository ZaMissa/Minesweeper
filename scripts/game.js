class MinesweeperGame {
    constructor() {
        this.difficultyLevels = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 },
            // Magični nivoi - otključavaju se kroz achievement-e
            'ultra-beginner': { rows: 15, cols: 15, mines: 25 },
            'time-challenge': { rows: 20, cols: 20, mines: 60 },
            'aura-challenge': { rows: 25, cols: 25, mines: 100 },
            'perfection-challenge': { rows: 30, cols: 30, mines: 150 },
            'master-challenge': { rows: 35, cols: 35, mines: 200 },
            'streak-challenge': { rows: 40, cols: 40, mines: 300 }
        };
        
        this.currentDifficulty = 'beginner';
        this.board = null;
        this.timer = null;
        this.timerInterval = null;
        this.gameStartTime = null;
        this.isGameActive = false;
        this.currentTheme = 'light';
        this.soundEnabled = true;
        this.customCursorEnabled = true;
        this.statistics = {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            bestTime: null,
            gameTimes: []
        };
        
        this.achievements = {
            firstWin: false,
            speedDemon: false,
            veteran: false,
            perfectGame: false,
            mineMaster: false,
            streakMaster: false
        };
        
        // Achievement progress tracking
        this.achievementProgress = {
            firstWin: { current: 0, required: 1, type: 'pobeda' },
            speedDemon: { current: 0, required: 1, type: 'brza-pobeda' },
            veteran: { current: 0, required: 10, type: 'igra' },
            perfectGame: { current: 0, required: 1, type: 'savrsena-igra' },
            mineMaster: { current: 0, required: 50, type: 'pobeda' },
            streakMaster: { current: 0, required: 5, type: 'niz-pobeda', streak: 0 }
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeAudio();
        this.initializeStatistics();
        this.initializeAchievements();
        this.initializeCustomCursor();
        this.initializeWalnutGame();
    }

    initializeGame() {
        const config = this.difficultyLevels[this.currentDifficulty];
        this.board = new Board(config.rows, config.cols, config.mines);
        this.resetTimer();
        this.updateUI();
        this.isGameActive = false;
    }

    setupEventListeners() {
        // Difficulty selector
        const difficultySelect = document.getElementById('difficulty');
        difficultySelect.addEventListener('change', (e) => {
            if (e.target.value && !e.target.disabled) {
                this.currentDifficulty = e.target.value;
                this.newGame();
            }
        });

        // New game button
        const newGameBtn = document.getElementById('new-game-btn');
        newGameBtn.addEventListener('click', () => {
            this.newGame();
        });

        // Debug button
        const debugBtn = document.getElementById('debug-btn');
        debugBtn.addEventListener('click', () => {
            if (this.board) {
                this.board.debugBoard();
                this.board.validateBoard();
            }
        });

        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sound toggle button
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });

        // Cursor toggle button
        const cursorToggle = document.getElementById('cursor-toggle');
        cursorToggle.addEventListener('click', () => {
            this.toggleCustomCursor();
        });

        // Walnut game close button
        const walnutCloseBtn = document.getElementById('walnut-close-btn');
        if (walnutCloseBtn) {
            walnutCloseBtn.addEventListener('click', () => {
                this.hideWalnutGame();
            });
        }

        // Game board clicks
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });

        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                this.handleRightClick(e.target);
            }
        });
    }

    handleCellClick(cellElement) {
        console.log(`=== handleCellClick called ===`);
        
        if (this.board.gameOver) {
            console.log('Game already over, cannot handle click');
            return;
        }

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        console.log(`Handling click on cell [${row}, ${col}]`);

        // Check if cell is already revealed or flagged
        const cellData = this.board.getCell(row, col);
        if (cellData.isRevealed) {
            console.log(`Cell [${row}, ${col}] is already revealed, attempting chording...`);
            // Try chording if it's a revealed cell with a number
            if (cellData.neighborMines > 0) {
                const chordingSuccess = this.board.chordCell(row, col);
                if (chordingSuccess) {
                    this.updateUI();
                    this.checkGameEnd();
                } else {
                    // Chording failed - check if it's due to incorrect flags (game over)
                    console.log('Chording failed, checking if game is over...');
                    this.updateUI();
                    if (this.board.gameOver) {
                        console.log('Game over due to chording error, ending game');
                        this.playSound('mine');
                        this.endGame();
                    }
                }
            }
            return;
        }
        
        if (cellData.isFlagged) {
            console.log(`Cell [${row}, ${col}] is flagged, ignoring click`);
            return;
        }

        if (!this.isGameActive) {
            console.log('Starting new game...');
            this.startGame();
            // Validate board after first click
            setTimeout(() => {
                this.board.validateBoard();
            }, 100);
        }

        console.log(`Calling board.revealCell(${row}, ${col})`);
        const success = this.board.revealCell(row, col);
        console.log(`revealCell returned: ${success}`);
        
        if (success) {
            console.log('Cell revealed successfully, updating UI and checking game end');
            this.playSound('reveal');
            this.updateUI();
            this.checkGameEnd();
        } else {
            console.log('Cell reveal failed, checking if it was due to game over');
            this.updateUI();
            
            // Only end game if it's actually game over, not just a failed reveal
            if (this.board.gameOver) {
                console.log('Game is over, ending game');
                this.playSound('mine');
                this.endGame();
            } else {
                console.log('Cell reveal failed but game continues (probably already revealed cell)');
            }
        }
        
        console.log(`=== handleCellClick completed ===`);
    }

    handleRightClick(cellElement) {
        if (this.board.gameOver) return;

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);

        if (!this.isGameActive) {
            this.startGame();
        }

        this.board.toggleFlag(row, col);
        this.playSound('flag');
        this.updateUI();
    }

    startGame() {
        this.isGameActive = true;
        this.gameStartTime = Date.now();
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        if (!this.gameStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const timerElement = document.getElementById('timer');
        timerElement.textContent = elapsed.toString().padStart(3, '0');
    }

    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const timerElement = document.getElementById('timer');
        timerElement.textContent = '000';
        this.gameStartTime = null;
    }

    checkGameEnd() {
        const gameState = this.board.getGameState();
        
        if (gameState.gameWon) {
            this.endGame(true);
        } else if (gameState.gameOver) {
            this.endGame(false);
        }
    }

    endGame(won = false) {
        console.log(`=== endGame called with won=${won} ===`);
        console.log(`Board game state: gameOver=${this.board.gameOver}, gameWon=${this.board.gameWon}`);
        
        this.isGameActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Calculate game time
        const gameTime = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        
        // Record game result
        this.recordGameResult(won, gameTime);

        const statusMessage = document.getElementById('status-message');
        
        if (won) {
            console.log('Game won!');
            this.playSound('win');
            statusMessage.textContent = '🎉 Čestitamo! Pobedili ste! 🎉';
            statusMessage.style.display = 'block';
            statusMessage.className = 'status-message win';
            this.createConfetti();
        } else {
            console.log('Game lost!');
            this.playSound('gameOver');
            statusMessage.textContent = '💥 Game Over! Pokušajte ponovo! 💥';
            statusMessage.style.display = 'block';
            statusMessage.className = 'status-message lose';
        }
        
        console.log(`=== endGame completed ===`);
    }

    newGame() {
        // Hide status message
        const statusMessage = document.getElementById('status-message');
        statusMessage.style.display = 'none';
        
        // Reset game
        this.initializeGame();
        
        // Clear game board
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Create new board UI
        this.createBoardUI();
        
        // Reset wrongFlag states
        if (this.board) {
            for (let row = 0; row < this.board.rows; row++) {
                for (let col = 0; col < this.board.cols; col++) {
                    const cell = this.board.getCell(row, col);
                    if (cell) {
                        cell.wrongFlag = false;
                    }
                }
            }
        }
    }

    createBoardUI() {
        const gameBoard = document.getElementById('game-board');
        const config = this.difficultyLevels[this.currentDifficulty];
        
        gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                gameBoard.appendChild(cell);
            }
        }
    }

    updateUI() {
        if (!this.board) return;

        const gameState = this.board.getGameState();
        const boardData = this.board.getBoard();
        
        // Update mine counter
        const mineCountElement = document.getElementById('mine-count');
        const remainingMines = gameState.totalMines - gameState.flaggedCount;
        mineCountElement.textContent = remainingMines.toString().padStart(2, '0');
        
        // Update progress bar
        this.updateProgressBar(gameState);
        
        // Update board cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellData = boardData[row][col];
            
            this.updateCellUI(cell, cellData);
        });
    }

    updateCellUI(cellElement, cellData) {
        // Remove all existing classes
        cellElement.className = 'cell';
        
        if (cellData.isRevealed) {
            cellElement.classList.add('revealed');
            
            if (cellData.isMine) {
                cellElement.classList.add('mine');
            } else if (cellData.neighborMines > 0) {
                cellElement.textContent = cellData.neighborMines;
                cellElement.setAttribute('data-number', cellData.neighborMines);
                
                // Check if cell is chordable (all neighbors are flagged)
                if (this.isCellChordable(cellData.row, cellData.col)) {
                    cellElement.classList.add('chordable');
                }
            } else {
                cellElement.textContent = '';
            }
        } else if (cellData.isFlagged) {
            cellElement.classList.add('flagged');
            if (cellData.wrongFlag) {
                cellElement.classList.add('wrong-flag');
            }
            cellElement.textContent = '';
        } else {
            cellElement.textContent = '';
        }
    }

    getCurrentDifficulty() {
        return this.currentDifficulty;
    }

    getBoard() {
        return this.board;
    }

    isGameRunning() {
        return this.isGameActive && !this.board.gameOver;
    }

    // Check if a cell can be chorded (all neighbors are flagged)
    isCellChordable(row, col) {
        if (!this.board) return false;
        
        const cell = this.board.getCell(row, col);
        if (!cell.isRevealed || cell.neighborMines === 0) return false;
        
        let flaggedNeighbors = 0;
        
        for (let r = Math.max(0, row - 1); r <= Math.min(this.board.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.board.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                
                const neighbor = this.board.getCell(r, c);
                if (neighbor.isFlagged) {
                    flaggedNeighbors++;
                }
            }
        }
        
        return flaggedNeighbors === cell.neighborMines;
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('minesweeper-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        } else {
            // Auto-detect system theme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
                this.applyTheme('dark');
            }
        }

        // Initialize custom cursor preference
        const savedCursor = localStorage.getItem('minesweeper-custom-cursor');
        if (savedCursor !== null) {
            this.customCursorEnabled = savedCursor === 'true';
        }
        this.updateCursorIcon();
        this.applyCustomCursor();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('minesweeper-theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Audio Management
    initializeAudio() {
        const savedSound = localStorage.getItem('minesweeper-sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
        }
        this.updateSoundIcon();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('minesweeper-sound', this.soundEnabled.toString());
        this.updateSoundIcon();
    }

    updateSoundIcon() {
        const soundIcon = document.getElementById('sound-icon');
        if (soundIcon) {
            soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
    }

    playSound(soundType) {
        if (!this.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound based on type
        switch (soundType) {
            case 'reveal':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                break;
            case 'flag':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                break;
            case 'mine':
                // Dramatičan zvuk za bombu - nizak ton koji se spušta sa vibracijom
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(140, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(130, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(120, audioContext.currentTime + 0.3);
                oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);
                break;
            case 'win':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3);
                break;
            case 'gameOver':
                // Još dramatičniji zvuk za game over - nizak ton koji se spušta sa vibracijom
                oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(110, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(90, audioContext.currentTime + 0.3);
                oscillator.frequency.setValueAtTime(80, audioContext.currentTime + 0.4);
                oscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.6);
                break;
            case 'achievement':
                // Magičan zvuk za achievement - visok ton sa harmonijama
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
                break;
            case 'difficulty-unlock':
                // Specijalan zvuk za otključavanje nivoa - dramatičan crescendo
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.4);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.6);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.8);
                break;
        }

        // Povećana glasnoća za bombu i game over
        if (soundType === 'mine' || soundType === 'gameOver') {
            gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        } else {
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        }

        // Produženo trajanje za bombu i game over
        if (soundType === 'mine' || soundType === 'gameOver') {
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else {
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }

    // Statistics Management
    initializeStatistics() {
        const savedStats = localStorage.getItem('minesweeper-statistics');
        if (savedStats) {
            this.statistics = JSON.parse(savedStats);
        }
        this.updateStatisticsUI();
    }

    saveStatistics() {
        localStorage.setItem('minesweeper-statistics', JSON.stringify(this.statistics));
    }

    updateStatisticsUI() {
        const totalGames = document.getElementById('total-games');
        const totalWins = document.getElementById('total-wins');
        const totalLosses = document.getElementById('total-losses');
        const winRate = document.getElementById('win-rate');
        const bestTime = document.getElementById('best-time');
        const avgTime = document.getElementById('avg-time');
        const walnutStats = document.getElementById('walnut-stats');

        if (totalGames) totalGames.textContent = this.statistics.totalGames;
        if (totalWins) totalWins.textContent = this.statistics.totalWins;
        if (totalLosses) totalLosses.textContent = this.statistics.totalLosses;
        
        if (winRate) {
            const rate = this.statistics.totalGames > 0 
                ? Math.round((this.statistics.totalWins / this.statistics.totalGames) * 100)
                : 0;
            winRate.textContent = rate + '%';
        }

        if (bestTime) {
            bestTime.textContent = this.statistics.bestTime 
                ? this.formatTime(this.statistics.bestTime)
                : '--';
        }

        if (avgTime) {
            const avg = this.statistics.gameTimes.length > 0
                ? Math.round(this.statistics.gameTimes.reduce((a, b) => a + b, 0) / this.statistics.gameTimes.length)
                : 0;
            avgTime.textContent = avg > 0 ? this.formatTime(avg) : '--';
        }

        // Update walnut game stats
        if (walnutStats && this.walnutGameStats) {
            const stats = this.walnutGameStats;
            walnutStats.textContent = `${stats.correctAnswers}/${stats.totalPlayed}`;
        }
    }

    recordGameResult(won, gameTime) {
        this.statistics.totalGames++;
        
        if (won) {
            this.statistics.totalWins++;
            this.statistics.gameTimes.push(gameTime);
            
            if (!this.statistics.bestTime || gameTime < this.statistics.bestTime) {
                this.statistics.bestTime = gameTime;
            }
        } else {
            this.statistics.totalLosses++;
        }

        this.saveStatistics();
        this.updateStatisticsUI();
        
        // Check achievements
        this.checkAchievements(won, gameTime);
        
        // Check if walnut game should be shown (every 2nd game)
        this.checkWalnutGameTrigger();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Confetti Animation for Win
    createConfetti() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
    }

    // Update Progress Bar
    updateProgressBar(gameState) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (!progressFill || !progressText) return;
        
        // Calculate progress percentage
        const totalSafeCells = gameState.totalCells - gameState.totalMines;
        const progress = totalSafeCells > 0 ? (gameState.revealedCount / totalSafeCells) * 100 : 0;
        
        // Update progress bar
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // Change color based on progress
        if (progress >= 80) {
            progressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)'; // Green
        } else if (progress >= 50) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)'; // Orange
        } else if (progress >= 25) {
            progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)'; // Red
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)'; // Gray
        }
    }

    // Achievement System
    initializeAchievements() {
        const savedAchievements = localStorage.getItem('minesweeper-achievements');
        if (savedAchievements) {
            this.achievements = JSON.parse(savedAchievements);
        }
        
        const savedProgress = localStorage.getItem('minesweeper-achievement-progress');
        if (savedProgress) {
            this.achievementProgress = JSON.parse(savedProgress);
        }
        
        this.updateAchievementsUI();
    }

    saveAchievements() {
        localStorage.setItem('minesweeper-achievements', JSON.stringify(this.achievements));
    }

    saveAchievementProgress() {
        localStorage.setItem('minesweeper-achievement-progress', JSON.stringify(this.achievementProgress));
    }

    checkAchievements(won, gameTime) {
        if (won) {
            // Update progress for win-based achievements
            this.updateAchievementProgress('firstWin', 1);
            this.updateAchievementProgress('mineMaster', 1);
            
            // Update streak for streak master
            this.achievementProgress.streakMaster.streak++;
            this.updateAchievementProgress('streakMaster', this.achievementProgress.streakMaster.streak);
            
            // Vremenska Kontrola - Speed Demon Achievement (win under 60 seconds)
            if (gameTime < 60) {
                this.updateAchievementProgress('speedDemon', 1);
            }
            
            // Savršenstvo - Perfect Game Achievement (no wrong flags)
            if (this.checkPerfectGame()) {
                this.updateAchievementProgress('perfectGame', 1);
            }
        } else {
            // Reset streak on loss
            this.achievementProgress.streakMaster.streak = 0;
        }
        
        // Update veteran progress (total games)
        this.updateAchievementProgress('veteran', this.statistics.totalGames);
        
        // Check and unlock achievements
        this.checkAndUnlockAchievements();
        
        this.saveAchievements();
        this.updateAchievementsUI();
    }

    updateAchievementProgress(achievementId, value) {
        if (this.achievementProgress[achievementId]) {
            this.achievementProgress[achievementId].current = value;
            this.saveAchievementProgress();
        }
    }

    checkAndUnlockAchievements() {
        // Check each achievement
        Object.keys(this.achievementProgress).forEach(achievementId => {
            const progress = this.achievementProgress[achievementId];
            
            if (!this.achievements[achievementId] && progress.current >= progress.required) {
                this.achievements[achievementId] = true;
                
                // Get achievement details
                const achievementDetails = this.getAchievementDetails(achievementId);
                this.unlockAchievement(achievementId, achievementDetails.icon, achievementDetails.name);
            }
        });
    }

    getAchievementDetails(achievementId) {
        const details = {
            'first-win': { icon: '🔮', name: 'Magična Intuicija' },
            'speed-demon': { icon: '⏰', name: 'Vremenska Kontrola' },
            'veteran': { icon: '🌟', name: 'Magična Aura' },
            'perfect-game': { icon: '💎', name: 'Savršenstvo' },
            'mine-master': { icon: '👑', name: 'Gospodar Mina' },
            'streak-master': { icon: '🔥', name: 'Magični Niz' }
        };
        
        return details[achievementId] || { icon: '🏆', name: 'Achievement' };
    }

    checkPerfectGame() {
        // Check if no wrong flags were placed during the game
        if (!this.board) return false;
        
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                const cell = this.board.getCell(row, col);
                if (cell && cell.wrongFlag) {
                    return false;
                }
            }
        }
        return true;
    }

    unlockAchievement(achievementId, icon, text) {
        const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
        if (achievementElement) {
            achievementElement.classList.remove('locked');
            achievementElement.classList.add('unlocked');
            achievementElement.querySelector('.achievement-icon').textContent = icon;
            achievementElement.querySelector('.achievement-text').textContent = text;
            
            // Unlock corresponding difficulty level
            this.unlockDifficultyLevel(achievementId);
            
            // Show notification
            this.showAchievementNotification(text);
        }
    }

    unlockDifficultyLevel(achievementId) {
        const difficultyMapping = {
            'first-win': 'ultra-beginner',
            'speed-demon': 'time-challenge',
            'veteran': 'aura-challenge',
            'perfect-game': 'perfection-challenge',
            'mine-master': 'master-challenge',
            'streak-master': 'streak-challenge'
        };
        
        const difficultyToUnlock = difficultyMapping[achievementId];
        if (difficultyToUnlock) {
            // Enable the option in difficulty selector
            const difficultySelect = document.getElementById('difficulty');
            const optionToUnlock = difficultySelect.querySelector(`option[value="${difficultyToUnlock}"]`);
            
            if (optionToUnlock) {
                optionToUnlock.disabled = false;
                optionToUnlock.textContent = optionToUnlock.textContent.replace('🔒 ', '');
                
                // Show special notification for unlocked level
                this.showDifficultyUnlockNotification(difficultyToUnlock);
            }
        }
    }

    showDifficultyUnlockNotification(difficultyId) {
        const difficultyNames = {
            'ultra-beginner': 'Ultra Početnik',
            'time-challenge': 'Vremenski Izazov',
            'aura-challenge': 'Aura Izazov',
            'perfection-challenge': 'Savršenstvo Izazov',
            'master-challenge': 'Gospodar Izazov',
            'streak-challenge': 'Niz Izazov'
        };
        
        const notification = document.createElement('div');
        notification.className = 'difficulty-unlock-notification';
        notification.innerHTML = `
            <span class="difficulty-unlock-icon">🚀</span>
            <span class="difficulty-unlock-text">Novi Nivo Otključan: ${difficultyNames[difficultyId]}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Add special sound effect
        this.playSound('difficulty-unlock');
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    showAchievementNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <span class="achievement-notification-icon">✨</span>
            <span class="achievement-notification-text">Magična Moć Otključana: ${text}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Add magical sound effect
        this.playSound('achievement');
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    updateAchievementsUI() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;
        
        // Update all achievements with progress
        Object.keys(this.achievementProgress).forEach(achievementId => {
            const progress = this.achievementProgress[achievementId];
            const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
            
            if (achievementElement) {
                // Update progress stats
                const statsElement = achievementElement.querySelector('.achievement-stats');
                if (statsElement) {
                    statsElement.textContent = this.formatProgressText(achievementId, progress);
                }
                
                // Update achievement state
                if (this.achievements[achievementId]) {
                    const details = this.getAchievementDetails(achievementId);
                    this.unlockAchievement(achievementId, details.icon, details.name);
                }
            }
        });
    }

    formatProgressText(achievementId, progress) {
        const typeLabels = {
            'first-win': 'pobeda',
            'speed-demon': 'brza pobeda',
            'veteran': 'igra',
            'perfect-game': 'savršena igra',
            'mine-master': 'pobeda',
            'streak-master': 'pobeda u nizu'
        };
        
        const label = typeLabels[achievementId] || 'progress';
        return `${progress.current}/${progress.required} ${label}`;
    }

    // Custom Cursor Management
    initializeCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        // Praćenje kretanja miša
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Dodavanje efekata na hover
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('cell')) {
                this.addCursorEffect('hover');
            }
        });

        // Dodavanje efekata na klik
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('cell')) {
                this.addCursorEffect('click');
            }
        });

        // Reset efekata
        document.addEventListener('mouseup', () => {
            this.removeCursorEffect();
        });

        // Sakrivanje kursora kada je izvan prozora
        document.addEventListener('mouseleave', () => {
            cursor.style.display = 'none';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.display = 'block';
        });
    }

    addCursorEffect(type) {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        if (type === 'hover') {
            cursor.classList.add('cursor-hover');
        } else if (type === 'click') {
            cursor.classList.add('cursor-click');
        }
    }

    removeCursorEffect() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        cursor.classList.remove('cursor-hover', 'cursor-click');
    }

    toggleCustomCursor() {
        this.customCursorEnabled = !this.customCursorEnabled;
        localStorage.setItem('minesweeper-custom-cursor', this.customCursorEnabled.toString());
        this.updateCursorIcon();
        this.applyCustomCursor();
    }

    updateCursorIcon() {
        const cursorIcon = document.getElementById('cursor-icon');
        if (cursorIcon) {
            cursorIcon.textContent = this.customCursorEnabled ? '🔧' : '👆';
        }
    }

    applyCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        if (this.customCursorEnabled) {
            cursor.style.display = 'block';
            document.body.style.cursor = 'none';
        } else {
            cursor.style.display = 'none';
            document.body.style.cursor = 'auto';
        }
    }

    // Mini-Igra "Sa čim krcamo orase" Management
    initializeWalnutGame() {
        this.walnutGameCount = 0;
        this.walnutGameStats = {
            totalPlayed: 0,
            correctAnswers: 0,
            incorrectAnswers: 0
        };
        
        // Load saved stats
        const savedWalnutStats = localStorage.getItem('minesweeper-walnut-stats');
        if (savedWalnutStats) {
            this.walnutGameStats = JSON.parse(savedWalnutStats);
        }
        
        // Setup walnut game event listeners
        this.setupWalnutGameEvents();
    }

    setupWalnutGameEvents() {
        const walnutOptions = document.querySelectorAll('.walnut-option');
        walnutOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleWalnutAnswer(e.target);
            });
        });
    }

    checkWalnutGameTrigger() {
        this.walnutGameCount++;
        
        // Show walnut game every 2nd game
        if (this.walnutGameCount % 2 === 0) {
            setTimeout(() => {
                this.showWalnutGame();
            }, 2000); // 2 second delay after game ends
        }
    }

    showWalnutGame() {
        const modal = document.getElementById('walnut-game-modal');
        if (!modal) return;

        // Reset previous state
        this.resetWalnutGame();
        
        // Show modal
        modal.style.display = 'flex';
        
        // Play special sound
        this.playSound('achievement');
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }

    hideWalnutGame() {
        const modal = document.getElementById('walnut-game-modal');
        if (!modal) return;

        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    resetWalnutGame() {
        // Reset option buttons
        const options = document.querySelectorAll('.walnut-option');
        options.forEach(option => {
            option.classList.remove('correct', 'incorrect');
            option.disabled = false;
        });

        // Reset result
        const result = document.getElementById('walnut-result');
        if (result) {
            result.textContent = '';
            result.className = 'walnut-result';
        }
    }

    handleWalnutAnswer(selectedOption) {
        const isCorrect = selectedOption.dataset.correct === 'true';
        const options = document.querySelectorAll('.walnut-option');
        const result = document.getElementById('walnut-result');

        // Disable all options
        options.forEach(option => {
            option.disabled = false;
        });

        // Mark selected option
        if (isCorrect) {
            selectedOption.classList.add('correct');
            result.textContent = '🎉 Tačno! Orase krcamo sa sirom! 🧀';
            result.className = 'walnut-result success';
            this.playSound('win');
        } else {
            selectedOption.classList.add('incorrect');
            result.textContent = '❌ Pogrešno! Orase krcamo sa sirom! 🧀';
            result.className = 'walnut-result error';
            this.playSound('gameOver');
        }

        // Mark correct answer
        options.forEach(option => {
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
            }
        });

        // Update stats
        this.walnutGameStats.totalPlayed++;
        if (isCorrect) {
            this.walnutGameStats.correctAnswers++;
        } else {
            this.walnutGameStats.incorrectAnswers++;
        }
        this.saveWalnutGameStats();

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideWalnutGame();
        }, 3000);
    }

    saveWalnutGameStats() {
        localStorage.setItem('minesweeper-walnut-stats', JSON.stringify(this.walnutGameStats));
    }

    getWalnutGameStats() {
        return this.walnutGameStats;
    }
}
