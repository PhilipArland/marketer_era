function initEmailPage() {
    console.log("email.js loaded and initialized!");

    const addBtn = document.getElementById("addEmailBtn");
    const reportBox = document.getElementById("emailReportOutput");
    const copyBtn = document.getElementById("copyEmailReportBtn");
    const undoBtn = document.getElementById("undoEmailReportBtn");
    const clearBtn = document.getElementById("clearEmailReportBtn");

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
}
