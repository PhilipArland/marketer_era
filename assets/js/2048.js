function init2048() {
    console.log("2048.js loaded and initialized!");
    
    const boardSize = 4;
    let board = [];
    let score = 0;
    let highScore = parseInt(localStorage.getItem('2048HighScore')) || 0;
    let gameOverFlag = false;

    const gameBoard = document.getElementById("game2048Board");
    const gameMessage = document.getElementById("game2048Message");
    const resetBtn = document.getElementById("reset2048Btn");
    const highScoreDisplay = document.getElementById("highScore2048");

    gameBoard.innerHTML = "";
    gameMessage.textContent = "Use Arrow Keys or W/A/S/D";
    gameMessage.style.color = "#3498db";
    updateHighScoreDisplay();

    // --- Create board ---
    for (let row = 0; row < boardSize; row++) {
        let boardRow = [];
        for (let col = 0; col < boardSize; col++) {
            boardRow.push(0);
        }
        board.push(boardRow);
    }

    // --- Add initial tiles ---
    addRandomTile();
    addRandomTile();
    renderBoard();

    // --- Add random tile ---
    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // --- Render board ---
    function renderBoard() {
        gameBoard.innerHTML = "";
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell-2048");
                const value = board[r][c];
                
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add(`tile-${value}`);
                }
                
                gameBoard.appendChild(cell);
            }
        }
        updateMessage();
    }

    // --- Move logic ---
    function move(direction) {
        if (gameOverFlag) return;

        let moved = false;
        const oldBoard = JSON.stringify(board);

        if (direction === 'left') {
            for (let r = 0; r < boardSize; r++) {
                const row = board[r].filter(val => val !== 0);
                for (let i = 0; i < row.length - 1; i++) {
                    if (row[i] === row[i + 1]) {
                        row[i] *= 2;
                        score += row[i];
                        row.splice(i + 1, 1);
                    }
                }
                while (row.length < boardSize) row.push(0);
                board[r] = row;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < boardSize; r++) {
                const row = board[r].filter(val => val !== 0);
                for (let i = row.length - 1; i > 0; i--) {
                    if (row[i] === row[i - 1]) {
                        row[i] *= 2;
                        score += row[i];
                        row.splice(i - 1, 1);
                        i--;
                    }
                }
                while (row.length < boardSize) row.unshift(0);
                board[r] = row;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < boardSize; c++) {
                const col = [];
                for (let r = 0; r < boardSize; r++) {
                    if (board[r][c] !== 0) col.push(board[r][c]);
                }
                for (let i = 0; i < col.length - 1; i++) {
                    if (col[i] === col[i + 1]) {
                        col[i] *= 2;
                        score += col[i];
                        col.splice(i + 1, 1);
                    }
                }
                while (col.length < boardSize) col.push(0);
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = col[r];
                }
            }
        } else if (direction === 'down') {
            for (let c = 0; c < boardSize; c++) {
                const col = [];
                for (let r = 0; r < boardSize; r++) {
                    if (board[r][c] !== 0) col.push(board[r][c]);
                }
                for (let i = col.length - 1; i > 0; i--) {
                    if (col[i] === col[i - 1]) {
                        col[i] *= 2;
                        score += col[i];
                        col.splice(i - 1, 1);
                        i--;
                    }
                }
                while (col.length < boardSize) col.unshift(0);
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = col[r];
                }
            }
        }

        moved = oldBoard !== JSON.stringify(board);

        if (moved) {
            addRandomTile();
            updateHighScore();
            renderBoard();
            
            if (checkGameOver()) {
                gameOver(false);
            } else if (checkWin()) {
                gameOver(true);
            }
        }
    }

    // --- Check game over ---
    function checkGameOver() {
        // Check for empty cells
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 0) return false;
            }
        }

        // Check for possible merges
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const current = board[r][c];
                if (c < boardSize - 1 && current === board[r][c + 1]) return false;
                if (r < boardSize - 1 && current === board[r + 1][c]) return false;
            }
        }

        return true;
    }

    // --- Check win ---
    function checkWin() {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 2048) return true;
            }
        }
        return false;
    }

    // --- Update high score ---
    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('2048HighScore', highScore);
            updateHighScoreDisplay();
        }
    }

    // --- Update high score display ---
    function updateHighScoreDisplay() {
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        if (score > 0 && score === highScore) {
            highScoreDisplay.style.color = "#f39c12"; // Gold color for new high score
        } else {
            highScoreDisplay.style.color = "#ecf0f1"; // Normal color
        }
    }

    // --- Update message ---
    function updateMessage() {
        if (!gameOverFlag) {
            gameMessage.textContent = `Score: ${score} | Use Arrow Keys or W/A/S/D`;
            gameMessage.style.color = "#3498db";
        }
    }

    // --- Game over ---
    function gameOver(win) {
        gameOverFlag = true;
        updateHighScore(); // Save high score one last time
        gameMessage.textContent = win ? `You Win! Score: ${score}` : `Game Over! Score: ${score}`;
        gameMessage.style.color = win ? "#27ae60" : "#e74c3c";
    }

    // --- Keyboard controls ---
    function handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        if (['arrowup', 'w'].includes(key)) {
            e.preventDefault();
            move('up');
        } else if (['arrowdown', 's'].includes(key)) {
            e.preventDefault();
            move('down');
        } else if (['arrowleft', 'a'].includes(key)) {
            e.preventDefault();
            move('left');
        } else if (['arrowright', 'd'].includes(key)) {
            e.preventDefault();
            move('right');
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    // --- Reset button ---
    resetBtn.addEventListener("click", () => {
        board = [];
        score = 0;
        gameOverFlag = false;
        gameBoard.innerHTML = "";
        gameMessage.textContent = "Game Reset!";
        gameMessage.style.color = "#95a5a6";
        
        // Remove old event listener to prevent duplicates
        document.removeEventListener('keydown', handleKeyPress);
        
        // Reinitialize
        init2048();
    });
}