// --------------------
// Table state history for Undo
// --------------------
let tableHistory = [];
const MAX_HISTORY = 20;

// --------------------
// Initialize Helper Page
// --------------------
function initHelperPage() {
    console.log("Initializing helper.js");

    const table = document.getElementById("excelGrid");
    const defaultColumns = 5;
    const defaultRows = 10;

    // Load saved table
    let savedData = JSON.parse(localStorage.getItem("helperTableData") || "null");

    const numCols = savedData ? savedData[0].length : defaultColumns;
    const numRows = savedData ? savedData.length : defaultRows;

    const colLetters = [];
    for (let i = 0; i < numCols; i++) colLetters.push(String.fromCharCode(65 + i));

    table.innerHTML = "";

    // Header row with copy buttons
    const header = table.insertRow();
    colLetters.forEach((letter, colIndex) => {
        const th = document.createElement("th");
        th.style.position = "relative";

        const span = document.createElement("span");
        span.innerText = letter;
        th.appendChild(span);

        const btn = document.createElement("button");
        btn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`;
        btn.title = "Copy this column";
        btn.style.marginLeft = "5px";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";
        btn.classList.add("btn", "btn-sm", "btn-outline-secondary");

        btn.addEventListener("click", () => {
            copyColumn(colIndex);

            // Change button text to "Copied"
            btn.innerHTML = `<i class="bi bi-check2-circle"></i> Copied`;

            // Optional: revert back to "Copy" after 2 seconds
            setTimeout(() => {
                btn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`;
            }, 1500);
        });

        th.appendChild(btn);
        header.appendChild(th);
    });


    // Table body
    for (let r = 0; r < numRows; r++) {
        const row = table.insertRow();
        for (let c = 0; c < numCols; c++) {
            const td = document.createElement("td");
            td.contentEditable = "true";
            if (savedData && savedData[r] && savedData[r][c] !== undefined) {
                td.innerText = savedData[r][c];
            }
            row.appendChild(td);
        }
    }

    // Track edits
    table.addEventListener("input", () => saveTableToLocalStorage());

    // --------------------
    // Clear All button
    // --------------------
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            saveTableToLocalStorage(); // save current state to history
            localStorage.removeItem("helperTableData");
            initHelperPage(); // reset table
            console.log("Table reset to initial 10x5 size");
        });
    }

    // --------------------
    // Remove N/A rows button
    // --------------------
    const removeNaBtn = document.getElementById("removeNaBtn");
    if (removeNaBtn) {
        removeNaBtn.addEventListener("click", () => {
            saveTableToLocalStorage(); // save current state for Undo

            const table = document.getElementById("excelGrid");
            let rowsDeleted = 0;

            for (let r = table.rows.length - 1; r > 0; r--) { // skip header
                const cellA = table.rows[r].cells[0];
                const cellB = table.rows[r].cells[1];

                const valA = cellA ? cellA.innerText.trim() : "";
                const valB = cellB ? cellB.innerText.trim().toLowerCase() : ""; // Normalize the email to lowercase

                // Remove rows if:
                // 1. Email is empty
                // 2. Email is exactly "n/a", "na" or any form of it (case insensitive)
                // 3. Both company and email are empty
                if (
                    valB === "" ||                           // If email is empty
                    valB === "n/a" ||                        // If email is "N/A", "n/a", "N/a", etc.
                    valB === "na" ||                         // If email is "na"
                    (valA === "" && valB === "")             // If both company and email are empty
                ) {
                    table.deleteRow(r);
                    rowsDeleted++;
                }
            }

            saveTableToLocalStorage(false); // save changes without pushing extra history
            console.log(`Removed ${rowsDeleted} rows (N/A or blank).`);
        });
    }

    // --------------------
    // Undo button
    // --------------------
    const undoBtn = document.getElementById("undoBtn");
    if (undoBtn) {
        undoBtn.addEventListener("click", () => {
            if (tableHistory.length === 0) {
                console.log("Nothing to undo");
                return;
            }

            const prevState = JSON.parse(tableHistory.pop());

            // Clear table (except header)
            while (table.rows.length > 1) table.deleteRow(1);

            // Restore previous state
            prevState.forEach(rowData => {
                const row = table.insertRow();
                rowData.forEach(cellData => {
                    const td = document.createElement("td");
                    td.contentEditable = "true";
                    td.innerText = cellData;
                    row.appendChild(td);
                });
            });

            localStorage.setItem("helperTableData", JSON.stringify(prevState));
            console.log("Undo applied");
        });
    }

    // Normalize Data Button
    const normalizeBtn = document.getElementById("normalizeDataBtn");
    if (normalizeBtn) {
        normalizeBtn.addEventListener("click", () => {
            saveTableToLocalStorage(); // save current state for Undo

            console.log("Normalizing data...");
            const table = document.getElementById("excelGrid");
            let changed = 0;
            const totalRows = table.rows.length;

            for (let r = 1; r < totalRows; r++) { // skip header
                const row = table.rows[r];
                let rowChanged = false;

                // --- Column A: Trim only ---
                const cellA = row.cells[0];
                if (cellA && cellA.innerText.trim() !== "") {
                    const originalA = cellA.innerText;
                    const trimmedA = originalA.trim();
                    if (originalA !== trimmedA) {
                        cellA.innerText = trimmedA;
                        rowChanged = true;
                    }
                }

                // --- Column B: Clean + trim + lowercase + remove internal spaces ---
                const cellB = row.cells[1];
                if (cellB && cellB.innerText.trim() !== "") {
                    const originalB = cellB.innerText;

                    // Clean email: trim, lowercase, and remove internal spaces
                    const cleanedB = originalB
                        .trim()                               // Trim leading/trailing spaces
                        .toLowerCase()                       // Convert to lowercase
                        .replace(/\s+/g, '');                // Remove internal spaces (inside the email)

                    if (originalB !== cleanedB) {
                        cellB.innerText = cleanedB;
                        rowChanged = true;
                    }
                }

                if (rowChanged) changed++;
            }

            if (changed > 0) {
                saveTableToLocalStorage(false);
                console.log(`Normalized data in ${changed} rows (Trimmed Col A + cleaned emails in Col B).`);
            } else {
                console.log("No data to normalize.");
            }
        });
    }

    const copyABBtn = document.getElementById("copyABBtn");
    if (copyABBtn && !copyABBtn.dataset.listenerAttached) {
        copyABBtn.addEventListener("click", () => {
            const table = document.getElementById("excelGrid");
            if (!table) return;

            let output = [];

            for (let r = 1; r < table.rows.length; r++) {
                const company = table.rows[r].cells[0]?.innerText.trim() || "";
                const email = table.rows[r].cells[1]?.innerText.trim() || "";

                if (company === "" && email === "") continue;

                output.push(`${company}\t${email}`);
            }

            if (output.length === 0) {
                alert("No data to copy.");
                return;
            }

            navigator.clipboard.writeText(output.join("\n"))
                .then(() => alert("Copied A + B (2 columns)!"))
                .catch(() => alert("Copy failed."));
        });

        copyABBtn.dataset.listenerAttached = "true"; // mark as attached
    }


}

// --------------------
// Save table state
// --------------------
function saveTableToLocalStorage(pushHistory = true) {
    const table = document.getElementById("excelGrid");
    const data = [];

    for (let r = 1; r < table.rows.length; r++) {
        const rowData = [];
        for (let c = 0; c < table.rows[r].cells.length; c++) {
            rowData.push(table.rows[r].cells[c].innerText);
        }
        data.push(rowData);
    }

    if (pushHistory) {
        tableHistory.push(JSON.stringify(data));
        if (tableHistory.length > MAX_HISTORY) tableHistory.shift();
    }

    localStorage.setItem("helperTableData", JSON.stringify(data));
}

// --------------------
// Paste support
// --------------------
document.addEventListener("paste", function (event) {
    const active = document.activeElement;
    if (!active || active.tagName !== "TD") return;

    event.preventDefault();

    const table = document.getElementById("excelGrid");
    const text = (event.clipboardData || window.clipboardData).getData("text");

    const rowsData = text.split(/\r?\n/);

    // Get starting position
    const startCell = active;
    let startRow = startCell.parentElement.rowIndex - 1; // skip header
    let startCol = startCell.cellIndex;

    let currentRows = table.rows.length - 1;
    let currentCols = table.rows[0].cells.length;

    const newRowsToAdd = [];

    rowsData.forEach((line, i) => {
        let cells = line.split("\t");
        // Handle quoted multi-line cells
        for (let j = 0; j < cells.length; j++) {
            let cell = cells[j];
            if (cell.startsWith('"') && !cell.endsWith('"')) {
                // Collect following lines until we find closing quote
                let k = i + 1;
                while (k < rowsData.length && !rowsData[k].endsWith('"')) {
                    cell += "\n" + rowsData[k];
                    rowsData[k] = ""; // mark as consumed
                    k++;
                }
                if (k < rowsData.length) {
                    cell += "\n" + rowsData[k].replace(/"$/, "");
                    rowsData[k] = "";
                }
                cells[j] = cell.replace(/^"|"$/g, ""); // remove quotes
            }
        }

        // Now insert this line
        const rowIndex = startRow + i + 1;
        if (rowIndex >= table.rows.length) {
            // Add new row if needed
            const row = table.insertRow();
            for (let c = 0; c < currentCols; c++) {
                const td = document.createElement("td");
                td.contentEditable = "true";
                row.appendChild(td);
            }
        }

        const rowCells = table.rows[startRow + i + 1].cells;

        cells.forEach((colText, j) => {
            rowCells[startCol + j].innerText = colText;
        });
    });

    saveTableToLocalStorage();
});


// --------------------
// Copy column
// --------------------
function copyColumn(colIndex) {
    const table = document.getElementById("excelGrid");
    const rows = Array.from(table.rows).slice(1);

    const values = rows.map(row => row.cells[colIndex].innerText);

    let first = values.findIndex(v => v.trim() !== "");
    let last = values.length - 1 - [...values].reverse().findIndex(v => v.trim() !== "");

    if (first === -1) return;

    const toCopy = values.slice(first, last + 1).join("\n");

    navigator.clipboard.writeText(toCopy)
        .then(() => console.log(`Copied column ${colIndex}`))
        .catch(err => console.error("Copy failed:", err));
}
