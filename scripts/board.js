class Board {
    constructor(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = [];
        this.minePositions = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.revealedCount = 0;
        this.flaggedCount = 0;
        
        this.initializeBoard();
    }

    initializeBoard() {
        // Create empty board
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    wrongFlag: false,
                    neighborMines: 0,
                    row: row,
                    col: col
                };
            }
        }
        
        console.log(`Board initialized: ${this.rows}x${this.cols}, ${this.mines} mines`);
        console.log(`Total cells: ${this.rows * this.cols}`);
    }

    placeMines(firstRow, firstCol) {
        // Don't place mines on first click position or its neighbors
        const safePositions = this.getSafePositions(firstRow, firstCol);
        
        console.log(`Placing ${this.mines} mines. Safe positions: ${safePositions.size}`);
        console.log(`First click safe area: [${Math.max(0, firstRow - 1)}-${Math.min(this.rows - 1, firstRow + 1)}], [${Math.max(0, firstCol - 1)}-${Math.min(this.cols - 1, firstCol + 1)}]`);
        
        // Place mines randomly
        let minesPlaced = 0;
        let attempts = 0;
        const maxAttempts = this.rows * this.cols * 2; // Prevent infinite loop
        
        while (minesPlaced < this.mines && attempts < maxAttempts) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Check if position is safe and not already a mine
            if (!this.board[row][col].isMine && safePositions.has(`${row},${col}`)) {
                this.board[row][col].isMine = true;
                this.minePositions.push({row, col});
                minesPlaced++;
                console.log(`Mine placed at [${row}, ${col}]`);
            }
            attempts++;
        }
        
        // Ensure all mines are placed
        if (minesPlaced < this.mines) {
            console.warn(`Could only place ${minesPlaced} out of ${this.mines} mines`);
        }
        
        // Verify all mines are properly set
        let verifiedMines = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) {
                    verifiedMines++;
                }
            }
        }
        console.log(`Verified mines on board: ${verifiedMines}`);
        
        // Calculate neighbor mine counts AFTER all mines are placed
        this.calculateNeighborMines();
        
        // Debug: log mine positions and neighbor counts
        console.log('Mine positions:', this.minePositions);
        this.debugBoard();
    }

    getSafePositions(firstRow, firstCol) {
        const safePositions = new Set();
        
        // Add all positions
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                safePositions.add(`${row},${col}`);
            }
        }
        
        // Remove first click position and its neighbors
        for (let row = Math.max(0, firstRow - 1); row <= Math.min(this.rows - 1, firstRow + 1); row++) {
            for (let col = Math.max(0, firstCol - 1); col <= Math.min(this.cols - 1, firstCol + 1); col++) {
                safePositions.delete(`${row},${col}`);
            }
        }
        
        console.log(`Safe positions for first click [${firstRow}, ${firstCol}]: ${safePositions.size} out of ${this.rows * this.cols}`);
        
        return safePositions;
    }

    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        
        // Check all 8 neighboring cells
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue; // Skip the cell itself
                
                if (this.board[r][c] && this.board[r][c].isMine) {
                    count++;
                }
            }
        }
        
        return count;
    }

    revealCell(row, col) {
        console.log(`=== revealCell called for [${row}, ${col}] ===`);
        console.log(`Current game state: gameOver=${this.gameOver}, gameWon=${this.gameWon}, firstClick=${this.firstClick}`);
        
        if (this.gameOver) {
            console.log(`Game already over, cannot reveal cell [${row}, ${col}]`);
            return false;
        }
        
        if (this.board[row][col].isRevealed) {
            console.log(`Cell [${row}, ${col}] already revealed, returning false`);
            return false;
        }
        
        if (this.board[row][col].isFlagged) {
            console.log(`Cell [${row}, ${col}] is flagged, cannot reveal, returning false`);
            return false;
        }

        // First click - place mines
        if (this.firstClick) {
            console.log(`First click at [${row}, ${col}] - placing mines...`);
            this.placeMines(row, col);
            this.firstClick = false;
        }

        const cell = this.board[row][col];
        
        console.log(`Revealing cell [${row}, ${col}], isMine: ${cell.isMine}, isRevealed: ${cell.isRevealed}, isFlagged: ${cell.isFlagged}`);
        
        // Double-check that this cell is not a mine before revealing
        if (cell.isMine) {
            console.log(`Game Over! Mine clicked at [${row}, ${col}]`);
            this.gameOver = true;
            this.revealAllMines();
            return false;
        }

        // Now reveal the cell
        cell.isRevealed = true;
        this.revealedCount++;
        console.log(`Cell [${row}, ${col}] revealed. Revealed count: ${this.revealedCount}`);

        // If no neighbor mines, reveal neighbors
        if (cell.neighborMines === 0) {
            console.log(`Cell [${row}, ${col}] has no neighbor mines, revealing neighbors...`);
            this.revealNeighbors(row, col);
        }

        // Check win condition
        if (this.revealedCount === this.rows * this.cols - this.mines) {
            console.log('Game Won! All safe cells revealed!');
            this.gameWon = true;
            this.gameOver = true;
            this.flagAllMines();
        }

        console.log(`=== revealCell completed for [${row}, ${col}] ===`);
        return true;
    }

    revealNeighbors(row, col) {
        console.log(`Revealing neighbors for cell [${row}, ${col}]`);
        
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                
                const neighbor = this.board[r][c];
                console.log(`Checking neighbor [${r}, ${c}]: isRevealed=${neighbor.isRevealed}, isFlagged=${neighbor.isFlagged}, isMine=${neighbor.isMine}`);
                
                if (!neighbor.isRevealed && !neighbor.isFlagged) {
                    console.log(`Revealing neighbor [${r}, ${c}]`);
                    this.revealCell(r, c);
                }
            }
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) {
            return false;
        }

        const cell = this.board[row][col];
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedCount--;
        } else {
            cell.isFlagged = true;
            this.flaggedCount++;
        }

        return true;
    }

    revealAllMines() {
        console.log('=== revealAllMines called ===');
        console.log(`Game state: gameOver=${this.gameOver}, gameWon=${this.gameWon}`);
        console.log(`Mine positions:`, this.minePositions);
        
        // When game is lost, flag all mines and reveal them
        this.flagAllMinesOnLoss();
        
        console.log('=== revealAllMines completed ===');
    }

    flagAllMines() {
        this.minePositions.forEach(pos => {
            if (!this.board[pos.row][pos.col].isFlagged) {
                this.board[pos.row][pos.col].isFlagged = true;
                this.flaggedCount++;
            }
        });
    }

    // Flag all mines when game is lost (even if they weren't flagged during play)
    flagAllMinesOnLoss() {
        console.log('=== flagAllMinesOnLoss called ===');
        console.log(`Flagging ${this.minePositions.length} mines`);
        
        this.minePositions.forEach(pos => {
            const cell = this.board[pos.row][pos.col];
            console.log(`Processing mine at [${pos.row}, ${pos.col}]: isFlagged=${cell.isFlagged}, isRevealed=${cell.isRevealed}`);
            
            if (!cell.isFlagged) {
                cell.isFlagged = true;
                this.flaggedCount++;
                console.log(`Flagged mine at [${pos.row}, ${pos.col}]`);
            }
            // Also reveal the mine to show it was there
            cell.isRevealed = true;
            console.log(`Revealed mine at [${pos.row}, ${pos.col}]`);
        });
        
        console.log(`Final flagged count: ${this.flaggedCount}`);
        console.log('=== flagAllMinesOnLoss completed ===');
    }

    // Chording: Click on revealed cell with number to reveal unflagged neighbors
    chordCell(row, col) {
        console.log(`=== chordCell called for [${row}, ${col}] ===`);
        
        const cell = this.board[row][col];
        
        // Check if cell is revealed and has a number
        if (!cell.isRevealed || cell.neighborMines === 0) {
            console.log(`Cell [${row}, ${col}] cannot be chorded: not revealed or no neighbor mines`);
            return false;
        }
        
        // Count flagged neighbors and check if they're actually mines
        let flaggedNeighbors = 0;
        let flaggedMines = 0;
        let neighbors = [];
        
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue; // Skip the cell itself
                
                const neighbor = this.board[r][c];
                if (neighbor.isFlagged) {
                    flaggedNeighbors++;
                    if (neighbor.isMine) {
                        flaggedMines++;
                    } else {
                        console.log(`Found incorrectly flagged cell at [${r}, ${c}] - not a mine!`);
                    }
                } else if (!neighbor.isRevealed) {
                    neighbors.push({row: r, col: c});
                }
            }
        }
        
        console.log(`Cell [${row}, ${col}] has ${flaggedNeighbors} flagged neighbors, ${flaggedMines} are actual mines out of ${cell.neighborMines} required mines`);
        
        // If all required mines are flagged, reveal all unflagged neighbors
        if (flaggedNeighbors === cell.neighborMines) {
            console.log(`Chording attempted! Revealing ${neighbors.length} unflagged neighbors`);
            
            let revealedCount = 0;
            let hitMine = false;
            
                    // First, check if any flagged cells are not actually mines
        if (flaggedMines < flaggedNeighbors) {
            console.log(`Chording failed - ${flaggedNeighbors - flaggedMines} cells are incorrectly flagged!`);
            console.log(`Flagged neighbors: ${flaggedNeighbors}, Actual mines: ${flaggedMines}`);
            
            // Mark incorrectly flagged cells
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    
                    const neighbor = this.board[r][c];
                    if (neighbor.isFlagged && !neighbor.isMine) {
                        neighbor.wrongFlag = true;
                        console.log(`Marked cell [${r}, ${c}] as incorrectly flagged - wrongFlag set to true`);
                    }
                }
            }
            
            // Reveal all mines to show the mistake
            console.log('Calling revealAllMines due to incorrect flags');
            this.revealAllMines();
            this.gameOver = true;
            console.log('Game over set to true due to incorrect flags');
            return false;
        }
            
            // All flagged cells are actually mines, proceed with chording
            neighbors.forEach(neighbor => {
                if (this.board[neighbor.row][neighbor.col].isMine) {
                    console.log(`Chording hit mine at [${neighbor.row}, ${neighbor.col}]!`);
                    hitMine = true;
                    this.gameOver = true;
                } else {
                    this.revealCell(neighbor.row, neighbor.col);
                    revealedCount++;
                }
            });
            
            if (hitMine) {
                console.log('Chording failed - mine hit!');
                this.revealAllMines();
                return false;
            }
            
            console.log(`Chording completed successfully. Revealed ${revealedCount} cells`);
            return true;
        } else {
            console.log(`Chording failed: ${flaggedNeighbors} flags vs ${cell.neighborMines} mines`);
            return false;
        }
    }

    getCell(row, col) {
        return this.board[row][col];
    }

    getBoard() {
        return this.board;
    }

    getGameState() {
        return {
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            revealedCount: this.revealedCount,
            flaggedCount: this.flaggedCount,
            totalCells: this.rows * this.cols,
            totalMines: this.mines
        };
    }

    reset() {
        console.log('Resetting board...');
        this.board = [];
        this.minePositions = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.initializeBoard();
        console.log('Board reset complete');
    }

    // Debug function to check board state
    debugBoard() {
        console.log('=== BOARD DEBUG ===');
        console.log(`Board size: ${this.rows}x${this.cols}`);
        console.log(`Total mines: ${this.mines}`);
        console.log(`Mines placed: ${this.minePositions.length}`);
        
        for (let row = 0; row < this.rows; row++) {
            let rowStr = '';
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine) {
                    rowStr += '💣';
                } else if (cell.neighborMines > 0) {
                    rowStr += cell.neighborMines;
                } else {
                    rowStr += '·';
                }
                rowStr += ' ';
            }
            console.log(`Row ${row}: ${rowStr}`);
        }
        console.log('=== END DEBUG ===');
    }

    // Validate board consistency
    validateBoard() {
        let errors = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (!cell.isMine) {
                    const actualCount = this.countNeighborMines(row, col);
                    if (actualCount !== cell.neighborMines) {
                        errors.push(`Cell [${row},${col}] has wrong neighbor count: expected ${cell.neighborMines}, got ${actualCount}`);
                    }
                }
            }
        }
        
        if (errors.length > 0) {
            console.error('Board validation errors:', errors);
            return false;
        }
        
        console.log('Board validation passed!');
        return true;
    }
}
