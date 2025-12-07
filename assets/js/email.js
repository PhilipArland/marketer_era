function initEmailPage() {
    console.log("email.js loaded and initialized!");

    // -------------------------------
    // DOM ELEMENTS
    // -------------------------------
    const addBtn = document.getElementById("addEmailBtn");
    const reportBox = document.getElementById("emailReportOutput");
    const copyBtn = document.getElementById("copyEmailReportBtn");
    const undoBtn = document.getElementById("undoEmailReportBtn");
    const clearBtn = document.getElementById("clearEmailReportBtn");

    const toggleMiniGamesBtn = document.getElementById("toggleMiniGamesBtn"); // the dash/plus button
    const miniGamesMenu = document.getElementById("miniGamesMenu"); // container with the 3 mini-game buttons
    const openMinesweeperBtn = document.getElementById("openMinesweeperBtn");
    const open2048Btn = document.getElementById("open2048Btn");
    const minesweeperContainer = document.getElementById("minesweeper");

    const username = localStorage.getItem("username") || "User";

    // -------------------------------
    // DAILY DATA SYSTEM
    // -------------------------------
    const today = new Date().toISOString().slice(0, 10);
    let savedData = JSON.parse(localStorage.getItem("emailDailyData") || "{}");
    if (!savedData.date || savedData.date !== today) {
        savedData = { date: today, count: 0, history: [] };
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
    }

    updateEmailUI();

    // -------------------------------
    // EMAIL BUTTONS
    // -------------------------------
    addBtn.addEventListener("click", () => {
        savedData.history.push(savedData.count);
        savedData.count += 50;
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateEmailUI();
    });

    undoBtn.addEventListener("click", () => {
        if (!savedData.history.length) return;
        savedData.count = savedData.history.pop();
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateEmailUI();
    });

    clearBtn.addEventListener("click", () => {
        savedData = { date: today, count: 0, history: [] };
        localStorage.setItem("emailDailyData", JSON.stringify(savedData));
        updateEmailUI();
    });

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(reportBox.value);
        copyBtn.innerHTML = `<i class="bi bi-check-circle"></i> Copied!`;
        setTimeout(() => copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`, 1000);
    });

    function updateEmailUI() {
        reportBox.value = `Hi, I already sent ${savedData.count} emails.\n\n- ${username}`;
    }

    // -------------------------------
    // MINI-GAMES MENU TOGGLE (INCLUDING MINESWEEPER)
    // -------------------------------
    let miniGamesVisible = false;

    toggleMiniGamesBtn.addEventListener("click", () => {
        miniGamesVisible = !miniGamesVisible;

        // Show/hide mini-games buttons
        miniGamesMenu.style.display = miniGamesVisible ? "flex" : "none";

        // Hide Minesweeper game if menu is hidden
        if (!miniGamesVisible) {
            minesweeperContainer.style.display = "none";
            document.getElementById("2048Card").style.display = "none";
        }

        toggleMiniGamesBtn.innerHTML = miniGamesVisible
            ? '<i class="bi bi-dash"></i>'
            : '<i class="bi bi-plus"></i>';
    });

    // -------------------------------
    // OPEN MINESWEEPER
    // -------------------------------
    openMinesweeperBtn.addEventListener("click", () => {
        minesweeperContainer.style.display = "block";
        initMinesweeper();
    });

    // -------------------------------
    // OPEN 2048
    // -------------------------------
    open2048Btn.addEventListener("click", () => {
        document.getElementById("2048Card").style.display = "block";
        init2048();
    });
}
