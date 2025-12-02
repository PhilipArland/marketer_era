function initEmailPage() {
    console.log("email.js loaded and initialized!");

    const addBtn = document.getElementById("addEmailBtn");
    const reportBox = document.getElementById("emailReportOutput");
    const copyBtn = document.getElementById("copyEmailReportBtn");
    const undoBtn = document.getElementById("undoEmailReportBtn");
    const clearBtn = document.getElementById("clearEmailReportBtn");
    const toggleMinesweeperBtn = document.getElementById("toggleMinesweeperBtn");
    const minesweeperContainer = document.getElementById("minesweeper");
    const resetBtn = document.getElementById("resetMinesweeperBtn");
    const gameMessage = document.getElementById("gameMessage");

    const username = localStorage.getItem("username") || "User";

    // -------------------------------
    //        DAILY RESET SYSTEM
    // -------------------------------
    const today = new Date().toISOString().slice(0, 10);
    let savedData = JSON.parse(localStorage.getItem("emailDailyData") || "{}");

    if (!savedData.date || savedData.date !== today) {
        savedData = { date: today, count: 0, history: [] };
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
    }

    updateUI();

    // -------------------------------
    //          ADD 50 BUTTON
    // -------------------------------
    addBtn.addEventListener("click", () => {
        savedData.history.push(savedData.count); // save last state for undo
        savedData.count += 50;

        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateUI();
    });

    // -------------------------------
    //          UNDO BUTTON
    // -------------------------------
    undoBtn.addEventListener("click", () => {
        if (savedData.history.length === 0) return;

        savedData.count = savedData.history.pop(); // revert to last state

        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateUI();
    });

    // -------------------------------
    //          CLEAR BUTTON
    // -------------------------------
    clearBtn.addEventListener("click", () => {
        savedData = { date: today, count: 0, history: [] };
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateUI();
    });

    // -------------------------------
    //          COPY BUTTON
    // -------------------------------
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(reportBox.value);
        copyBtn.innerHTML = `<i class="bi bi-check-circle"></i> Copied!`;
        setTimeout(() => copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`, 1000);
    });

    // -------------------------------
    //          UPDATE UI FUNCTION
    // -------------------------------
    function updateUI() {
        reportBox.value = `Hi, I already sent ${savedData.count} emails.\n\n- ${username}`;
    }

    // -------------------------------
    //          TOGGLE MINESWEEPER GAME
    // -------------------------------
    let isMinesweeperVisible = JSON.parse(localStorage.getItem("minesweeperVisible") || "false");

    // Show or hide the Minesweeper game
    if (isMinesweeperVisible) {
        minesweeperContainer.style.display = "block";
        toggleMinesweeperBtn.innerHTML = '<i class="bi bi-dash"></i>';  // Dash icon to hide
    } else {
        minesweeperContainer.style.display = "none";
        toggleMinesweeperBtn.innerHTML = '<i class="bi bi-plus"></i>';  // Plus icon to show
    }

    toggleMinesweeperBtn.addEventListener("click", () => {
        isMinesweeperVisible = !isMinesweeperVisible;
        localStorage.setItem("minesweeperVisible", JSON.stringify(isMinesweeperVisible));

        if (isMinesweeperVisible) {
            minesweeperContainer.style.display = "block";
            toggleMinesweeperBtn.innerHTML = '<i class="bi bi-dash"></i>';
        } else {
            minesweeperContainer.style.display = "none";
            toggleMinesweeperBtn.innerHTML = '<i class="bi bi-plus"></i>';
        }
    });

    // -------------------------------
    //        MINESWEEPER GAME LOGIC
    // -------------------------------
    const boardSize = 8; // 8x8 grid (medium difficulty)
    const numBombs = 12;  // 10 bombs for medium difficulty
    let board = [];
    let revealedCells = 0;
    let gameOverFlag = false; // Flag to track game over state

    const gameBoard = document.getElementById('game-board');

    function createMinesweeperBoard() {
        // Create an empty board (with zero bombs)
        for (let row = 0; row < boardSize; row++) {
            let boardRow = [];
            for (let col = 0; col < boardSize; col++) {
                boardRow.push({ bomb: false, revealed: false, flagged: false, surroundingBombs: 0 });
            }
            board.push(boardRow);
        }

        // Randomly place bombs
        let bombsPlaced = 0;
        while (bombsPlaced < numBombs) {
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            if (!board[row][col].bomb) {
                board[row][col].bomb = true;
                bombsPlaced++;
            }
        }

        // Calculate surrounding bombs
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col].bomb) continue;
                let surroundingBombs = 0;
                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c].bomb) {
                            surroundingBombs++;
                        }
                    }
                }
                board[row][col].surroundingBombs = surroundingBombs;
            }
        }

        // Render the board
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);

                // Only allow clicks if the game is not over
                cell.addEventListener('click', () => {
                    if (!gameOverFlag) revealCell(row, col);
                });
                cell.addEventListener('contextmenu', (e) => {
                    if (!gameOverFlag) {
                        e.preventDefault();
                        toggleFlag(row, col);
                    }
                });
            }
        }
    }

    function revealCell(row, col) {
        if (board[row][col].revealed || board[row][col].flagged) return;

        board[row][col].revealed = true;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('revealed');

        if (board[row][col].bomb) {
            cell.textContent = '💣';
            gameOver(false); // Trigger game over when a bomb is revealed
        } else {
            cell.textContent = board[row][col].surroundingBombs || '';
            revealedCells++;
            if (revealedCells === boardSize * boardSize - numBombs) {
                gameOver(true); // Win condition
            }
            if (board[row][col].surroundingBombs === 0) {
                revealSurroundingCells(row, col);
            }
        }
    }

    function revealSurroundingCells(row, col) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && !board[r][c].revealed && !board[r][c].bomb) {
                    revealCell(r, c);
                }
            }
        }
    }

    function toggleFlag(row, col) {
        if (board[row][col].revealed) return;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (board[row][col].flagged) {
            board[row][col].flagged = false;
            cell.classList.remove('flag');
        } else {
            board[row][col].flagged = true;
            cell.classList.add('flag');
        }
    }

    function gameOver(won) {
        gameOverFlag = true; // Lock the game from further interactions
        if (won) {
            gameMessage.textContent = "You Win!";
            gameMessage.style.color = "#27ae60"; // Green for win
        } else {
            gameMessage.textContent = "Game Over!";
            gameMessage.style.color = "#e74c3c"; // Red for loss
        }
    }

    // -------------------------------
    // Reset Game Function
    //-------------------------------

    resetBtn.addEventListener("click", () => {
        board = [];
        revealedCells = 0;
        gameOverFlag = false; // Reset game state
        gameBoard.innerHTML = ''; // Clear previous board
        gameMessage.textContent = "Game Reset!"; // Inform player that the game was reset
        gameMessage.style.color = "#95a5a6"; // Neutral color
        createMinesweeperBoard(); // Create a new board
    });

    createMinesweeperBoard();
}
