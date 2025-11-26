function initDashboardPage() {
    console.log("Initializing dashboard.js");

    // ---------------------------------------
    // 1. BASIC PAGE REFERENCES
    // ---------------------------------------
    const collectionSection = document.getElementById('collectionSection');
    const emailsSection = document.getElementById('emailsSection');
    const webmailsSection = document.getElementById('webmailsSection');
    const btnCollection = document.getElementById('btnCollection');
    const btnEmails = document.getElementById('btnEmails');
    const btnWebmails = document.getElementById('btnWebmails');
    const dailyReport = document.getElementById("dailyReport");

    // ---------------------------------------
    // 2. RESTORE VISIBILITY
    // ---------------------------------------
    const secCol = localStorage.getItem("section_collection") || "show";
    const secEmails = localStorage.getItem("section_emails") || "hide";
    const secWebmails = localStorage.getItem("section_webmails") || "hide";

    collectionSection.style.display = secCol === "show" ? "block" : "none";
    emailsSection.style.display = secEmails === "show" ? "block" : "none";
    webmailsSection.style.display = secWebmails === "show" ? "block" : "none";

    if (secCol === "show") btnCollection.classList.add("active");
    if (secEmails === "show") btnEmails.classList.add("active");
    if (secWebmails === "show") btnWebmails.classList.add("active");

    // -------------------------------------------------------------------
    // 3. DYNAMIC COLLECTION SETS — COMPLETE FIXED VERSION
    // -------------------------------------------------------------------

    let setCount = Number(localStorage.getItem("setCount")) || 1;
    const collectionSetsContainer = document.getElementById("collectionSetsContainer");
    const addCollectionSetBtn = document.getElementById("addCollectionSetBtn");

    // Create a dynamic collection set (new or restore)
    function createCollectionSet(id, restore = false) {
        const newSet = document.createElement("div");
        newSet.classList.add("collection-set");
        newSet.id = `set-${id}`;

        newSet.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-3">Company Collection</h5>
                <button class="btn btn-outline-dark btn-sm remove-set" data-set-id="${id}">×</button>
            </div>

            <div class="input-group mb-2">
                <button class="btns btn-primary toggle-collection me-1" id="toggleColLocation-${id}" type="button">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
                <input type="text" id="colLocation-${id}" class="form-control colLocation" placeholder="Location">
            </div>

            <input type="text" id="colMarket-${id}" class="form-control mb-2 colMarket" placeholder="Market Segment">
            <input type="number" id="colCompanyCount-${id}" class="form-control mb-2 colCompanyCount" placeholder="No. of Collected Company Names">
            <input type="number" id="colEmailCount-${id}" class="form-control mb-2 colEmailCount" placeholder="No. of Collected Company Emails">
            <hr>
        `;

        collectionSetsContainer.appendChild(newSet);

        // Remove button
        newSet.querySelector('.remove-set').addEventListener('click', (e) => {
            const setId = parseInt(e.target.dataset.setId);

            // Remove from DOM
            const setElement = document.getElementById(`set-${setId}`);
            if (setElement) setElement.remove();

            // Remove related localStorage entries
            ['colLocation', 'colMarket', 'colCompanyCount', 'colEmailCount', `colMode-${setId}`].forEach(key => {
                localStorage.removeItem(`${key}-${setId}`);
            });

            // Update activeSets in localStorage
            let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
            const idx = activeSets.indexOf(setId);
            if (idx > -1) activeSets.splice(idx, 1);
            localStorage.setItem("activeSets", JSON.stringify(activeSets));

            // Regenerate the report
            generateReport();
        });



        // Restore inputs
        if (restore) {
            ["colLocation", "colMarket", "colCompanyCount", "colEmailCount"].forEach(k => {
                const v = localStorage.getItem(`${k}-${id}`);
                if (v) document.getElementById(`${k}-${id}`).value = v;
            });
        }

        // Restore or apply mode
        const savedMode = localStorage.getItem(`colMode-${id}`) || "country";
        const locationInput = document.getElementById(`colLocation-${id}`);
        locationInput.dataset.mode = savedMode;
        applyMode(savedMode, `colLocation-${id}`);

        // Mode toggle button
        document.getElementById(`toggleColLocation-${id}`).addEventListener("click", () => {
            const inp = document.getElementById(`colLocation-${id}`);
            const newMode = inp.dataset.mode === "country" ? "state" : "country";
            inp.dataset.mode = newMode;
            localStorage.setItem(`colMode-${id}`, newMode);
            applyMode(newMode, `colLocation-${id}`);
            generateReport();
        });

        // Auto-save inputs
        newSet.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                localStorage.setItem(input.id, input.value);
                generateReport();
            });
        });

        // Remove set
        newSet.querySelector(".remove-set").addEventListener("click", () => {
            ["colLocation", "colMarket", "colCompanyCount", "colEmailCount"].forEach(k => {
                localStorage.removeItem(`${k}-${id}`);
            });
            localStorage.removeItem(`colMode-${id}`);
            newSet.remove();
            generateReport();
        });
    }

    // Restore all saved sets except the original one
    let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
    for (let i of activeSets) {
        createCollectionSet(i, true);
    }

    // Add new set
    addCollectionSetBtn.addEventListener("click", () => {
        createCollectionSet(setCount);

        // Update activeSets
        let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
        activeSets.push(setCount);
        localStorage.setItem("activeSets", JSON.stringify(activeSets));

        setCount++;
        localStorage.setItem("setCount", setCount);
        generateReport();
    });


    // -------------------------------------------------------------------
    // 4. TOGGLE SECTION VISIBILITY
    // -------------------------------------------------------------------
    btnCollection.addEventListener('click', () => {
        const show = collectionSection.style.display === "none";
        collectionSection.style.display = show ? "block" : "none";
        btnCollection.classList.toggle("active");
        localStorage.setItem("section_collection", show ? "show" : "hide");
        generateReport();
    });

    btnEmails.addEventListener('click', () => {
        const show = emailsSection.style.display === "none";
        emailsSection.style.display = show ? "block" : "none";
        btnEmails.classList.toggle("active");
        localStorage.setItem("section_emails", show ? "show" : "hide");
        generateReport();
    });

    btnWebmails.addEventListener('click', () => {
        const show = webmailsSection.style.display === "none";
        webmailsSection.style.display = show ? "block" : "none";
        btnWebmails.classList.toggle("active");
        localStorage.setItem("section_webmails", show ? "show" : "hide");
        generateReport();
    });

    // -------------------------------------------------------------------
    // 5. ORIGINAL TOGGLE BUTTONS (MAIN COLLECTION / EMAIL / WEBMAIL)
    // -------------------------------------------------------------------
    const toggleColLocation = document.getElementById("toggleColLocation");
    const toggleEmailLocation = document.getElementById("toggleEmailLocation");
    const toggleWebmailLocation = document.getElementById("toggleWebmailLocation");

    let colMode = localStorage.getItem("colMode") || "country";
    let emailMode = localStorage.getItem("emailMode") || "country";
    let webmailMode = localStorage.getItem("webmailMode") || "country";

    applyMode(colMode, "colLocation");
    applyMode(emailMode, "emailLocation");
    applyMode(webmailMode, "webmailLocation");

    toggleColLocation.addEventListener('click', () => {
        colMode = toggleMode(colMode);
        localStorage.setItem("colMode", colMode);
        applyMode(colMode, "colLocation");
        generateReport();
    });

    toggleEmailLocation.addEventListener('click', () => {
        emailMode = toggleMode(emailMode);
        localStorage.setItem("emailMode", emailMode);
        applyMode(emailMode, "emailLocation");
        generateReport();
    });

    toggleWebmailLocation.addEventListener('click', () => {
        webmailMode = toggleMode(webmailMode);
        localStorage.setItem("webmailMode", webmailMode);
        applyMode(webmailMode, "webmailLocation");
        generateReport();
    });

    function toggleMode(currentMode) {
        return currentMode === "country" ? "state" : "country";
    }

    function applyMode(mode, inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.placeholder = mode === "country"
            ? `Country (Click "🔁" to toggle)`
            : `State (Click "🔁" to toggle)`;
        input.dataset.mode = mode;
    }

    // -------------------------------------------------------------------
    // 6. FORMAT LOCATION LABEL
    // -------------------------------------------------------------------
    function formatLocationLabel(value, mode) {
        if (!value || value.trim() === "") {
            return mode === "country" ? "Country:" : "State:";
        }

        const locations = value.split(/,| and /i).map(s => s.trim()).filter(Boolean);
        const count = locations.length;

        if (count === 0) return mode === "country" ? "Country:" : "State:";

        const label = (count === 1)
            ? (mode === "country" ? "Country" : "State")
            : (mode === "country" ? "Countries" : "States");

        if (count === 1) return `${label}: ${locations[0]}`;
        if (count === 2) return `${label}: ${locations[0]} and ${locations[1]}`;

        const last = locations.pop();
        return `${label}: ${locations.join(", ")}, and ${last}`;
    }

    // -------------------------------------------------------------------
    // 7. GENERATE REPORT
    // -------------------------------------------------------------------
    function generateReport() {
        const now = new Date();
        const isMidDay = now.getHours() < 13;
        const dateString = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const reportDateHeader = isMidDay ? `${dateString} (Mid-Day Report)` : dateString;

        // MAIN COLLECTION
        let collectionText = "";
        if (collectionSection.style.display !== "none") {
            const colLocation = document.getElementById("colLocation").value;
            const colMarket = document.getElementById("colMarket").value;
            const colCompanyCount = document.getElementById("colCompanyCount").value;
            const colEmailCount = document.getElementById("colEmailCount").value;
            const mode = document.getElementById("colLocation").dataset.mode;

            const locLabel = formatLocationLabel(colLocation, mode);

            collectionText = `
COMPANY NAME COLLECTION
${locLabel}
Market Segment: ${colMarket}
No. of Collected Company Names: ${colCompanyCount}
No. of Collected Company Emails: ${colEmailCount}`;
        }

        // DYNAMIC COLLECTION SETS
        document.querySelectorAll(".collection-set").forEach(set => {
            const loc = set.querySelector(".colLocation").value;
            const market = set.querySelector(".colMarket").value;
            const companyCount = set.querySelector(".colCompanyCount").value;
            const emailCount = set.querySelector(".colEmailCount").value;
            const mode = set.querySelector(".colLocation").dataset.mode;

            const locLabel = formatLocationLabel(loc, mode);

            collectionText += `

COMPANY NAME COLLECTION
${locLabel}
Market Segment: ${market}
No. of Collected Company Names: ${companyCount}
No. of Collected Company Emails: ${emailCount}`;
        });

        // EMAIL SECTION
        let emailText = "";
        if (emailsSection.style.display !== "none") {
            const emailLocation = document.getElementById("emailLocation").value;
            const emailMarket = document.getElementById("emailMarket").value;
            const emailProductLine = document.getElementById("emailProductLine").value;
            const emailCount = document.getElementById("emailCount").value;
            const emailMode = document.getElementById("emailLocation").dataset.mode;

            const emailLocLabel = formatLocationLabel(emailLocation, emailMode);

            emailText = `SENDING EMAILS:
${emailLocLabel}
Market Segment: ${emailMarket}
Product Line: ${emailProductLine}
No. of Sent Emails: ${emailCount}`;
        }

        // WEBMAIL SECTION
        let webmailText = "";
        if (webmailsSection.style.display !== "none") {
            const webmailLocation = document.getElementById("webmailLocation").value;
            const webmailMarket = document.getElementById("webmailMarket").value;
            const webmailProductLine = document.getElementById("webmailProductLine").value;
            const webmailCount = document.getElementById("webmailCount").value;
            const webmailMode = document.getElementById("webmailLocation").dataset.mode;

            const webmailLocLabel = formatLocationLabel(webmailLocation, webmailMode);

            webmailText = `SENDING WEBMAILS:
${webmailLocLabel}
Market Segment: ${webmailMarket}
Product Line: ${webmailProductLine}
No. of Sent Webmails: ${webmailCount}`;
        }

        // RESPONSE SECTION
        const emailsReceived = document.getElementById("emailsReceived").value || "0";
        const notInterested = document.getElementById("notInterested").value || "0";

        const responseText = `Emails Received: ${emailsReceived}
Not Interested: ${notInterested}`;

        // FINAL REPORT
        const sections = [];
        if (collectionText) sections.push(collectionText);
        if (emailText) sections.push(emailText);
        if (webmailText) sections.push(webmailText);
        sections.push(responseText);

        const reportBody = sections.join("\n\n");
        const username = localStorage.getItem("username") || "User";

        const fullReport = `${reportDateHeader}
${reportBody}
Thank you.

- ${username}`;

        dailyReport.value = fullReport;
        localStorage.setItem("generatedReport", fullReport);
    }

    // Restore saved report
    const savedReport = localStorage.getItem("generatedReport");
    if (savedReport) dailyReport.value = savedReport;

    // GLOBAL input listener
    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            localStorage.setItem(input.id, input.value);
            generateReport();
        });
    });

    // Copy buttons
    const copyReportBtn = document.getElementById("copyReportBtn");
    copyReportBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(dailyReport.value);
        copyReportBtn.innerHTML = '<i class="bi bi-clipboard-check me-1"></i> Copied!';
        setTimeout(() => {
            copyReportBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i> Copy Report';
        }, 1500);
    });

    const copyReportBtn2 = document.getElementById("copyReportBtn2");
    copyReportBtn2.addEventListener('click', () => {
        navigator.clipboard.writeText(dailyReport.value);
        copyReportBtn2.innerHTML = '<i class="bi bi-clipboard-check me-1"></i> Copied!';
        setTimeout(() => {
            copyReportBtn2.innerHTML = '<i class="bi bi-clipboard me-1"></i> Copy Report';
        }, 1500);
    });

    // RESET BUTTON
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.querySelectorAll("input").forEach(inp => {
                localStorage.removeItem(inp.id);
                inp.value = "";
            });

            // Remove dynamic sets storage
            for (let i = 1; i < setCount; i++) {
                ["colLocation", "colMarket", "colCompanyCount", "colEmailCount"].forEach(k => {
                    localStorage.removeItem(`${k}-${i}`);
                });
                localStorage.removeItem(`colMode-${i}`);
            }
            localStorage.removeItem("setCount");
            setCount = 1;
            collectionSetsContainer.innerHTML = "";

            // Reset defaults
            localStorage.setItem("colMode", "country");
            localStorage.setItem("emailMode", "country");
            localStorage.setItem("webmailMode", "country");

            applyMode("country", "colLocation");
            applyMode("country", "emailLocation");
            applyMode("country", "webmailLocation");

            localStorage.removeItem("generatedReport");
            dailyReport.value = "";

            console.log("All input fields and local storage data have been reset.");
            generateReport();
        });
    }

    // Generate first time
    generateReport();
}
