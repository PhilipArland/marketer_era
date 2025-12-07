function initMinesweeper() {
    const boardSize = 8; // 8x8 grid
    const numBombs = 12;
    let board = [];
    let revealedCells = 0;
    let gameOverFlag = false;

    const gameBoard = document.getElementById("game-board");
    const gameMessage = document.getElementById("gameMessage");
    const resetBtn = document.getElementById("resetMinesweeperBtn");

    gameBoard.innerHTML = "";
    gameMessage.textContent = "Welcome to Minesweeper!";
    gameMessage.style.color = "#e74c3c";

    // --- Create board ---
    for (let row = 0; row < boardSize; row++) {
        let boardRow = [];
        for (let col = 0; col < boardSize; col++) {
            boardRow.push({ bomb: false, revealed: false, flagged: false, surroundingBombs: 0 });
        }
        board.push(boardRow);
    }

    // --- Place bombs ---
    let bombsPlaced = 0;
    while (bombsPlaced < numBombs) {
        const r = Math.floor(Math.random() * boardSize);
        const c = Math.floor(Math.random() * boardSize);
        if (!board[r][c].bomb) {
            board[r][c].bomb = true;
            bombsPlaced++;
        }
    }

    // --- Calculate surrounding bombs ---
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].bomb) continue;
            let count = 0;
            for (let rr = r - 1; rr <= r + 1; rr++) {
                for (let cc = c - 1; cc <= c + 1; cc++) {
                    if (rr >= 0 && rr < boardSize && cc >= 0 && cc < boardSize && board[rr][cc].bomb) count++;
                }
            }
            board[r][c].surroundingBombs = count;
        }
    }

    // --- Render board ---
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            gameBoard.appendChild(cell);

            cell.addEventListener("click", () => { if (!gameOverFlag) revealCell(r, c); });
            cell.addEventListener("contextmenu", (e) => { 
                e.preventDefault(); 
                if (!gameOverFlag) toggleFlag(r, c); 
            });
        }
    }

    // --- Reveal logic ---
    function revealCell(row, col) {
        if (board[row][col].revealed || board[row][col].flagged) return;

        board[row][col].revealed = true;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add("revealed");

        if (board[row][col].bomb) {
            cell.textContent = "💣";
            gameOver(false);
        } else {
            cell.textContent = board[row][col].surroundingBombs || "";
            revealedCells++;
            if (revealedCells === boardSize * boardSize - numBombs) gameOver(true);
            if (board[row][col].surroundingBombs === 0) revealSurrounding(row, col);
        }
    }

    function revealSurrounding(row, col) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && !board[r][c].revealed && !board[r][c].bomb) {
                    revealCell(r, c);
                }
            }
        }
    }

    function toggleFlag(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (board[row][col].revealed) return;
        board[row][col].flagged = !board[row][col].flagged;
        cell.classList.toggle("flag");
    }

    function gameOver(win) {
        gameOverFlag = true;
        gameMessage.textContent = win ? "You Win!" : "Game Over!";
        gameMessage.style.color = win ? "#27ae60" : "#e74c3c";
    }

    resetBtn.addEventListener("click", () => {
        board = [];
        revealedCells = 0;
        gameOverFlag = false;
        gameBoard.innerHTML = "";
        gameMessage.textContent = "Game Reset!";
        gameMessage.style.color = "#95a5a6";
        initMinesweeper();
    });
}
