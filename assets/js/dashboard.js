function initDashboardPage() {
    console.log("Initializing dashboard.js");

    const username = localStorage.getItem('username') || 'User'; // Default to 'User' if not set
    const welcomeMsg = document.getElementById("welcomeMsg");
    welcomeMsg.textContent = `Welcome, ${username}`;

    // 2. Date and Time Update
    const currentDate = document.getElementById("currentDate");
    const currentTime = document.getElementById("currentTime");

    function updateDateTime() {
        const now = new Date();

        // Format date: November 20, 2025
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);

        // Format time: 11:00:45 pm
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // hour '0' should be '12'
        currentTime.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    // Initial call to updateDateTime
    updateDateTime();
    // Update time every second
    setInterval(updateDateTime, 1000);

    // 3. Payday Calculation (same logic from your previous code)
    const holidays = [
        // Regular Holidays
        new Date(2025, 0, 1),    // Jan 1 — New Year’s Day
        new Date(2025, 3, 9),    // Apr 9 — Araw ng Kagitingan
        new Date(2025, 3, 17),   // Apr 17 — Maundy Thursday
        new Date(2025, 3, 18),   // Apr 18 — Good Friday
        new Date(2025, 4, 1),    // May 1 — Labor Day
        new Date(2025, 5, 12),   // Jun 12 — Independence Day
        new Date(2025, 7, 25),   // Aug 25 — National Heroes Day (last Monday of Aug)
        new Date(2025, 10, 30),  // Nov 30 — Bonifacio Day
        new Date(2025, 11, 25),  // Dec 25 — Christmas Day
        new Date(2025, 11, 30),  // Dec 30 — Rizal Day
        // Special (Non-Working) Days
        new Date(2025, 0, 29),   // Jan 29 — Chinese New Year
        new Date(2025, 3, 19),   // Apr 19 — Black Saturday
        new Date(2025, 7, 21),   // Aug 21 — Ninoy Aquino Day
        new Date(2025, 9, 31),   // Oct 31 — All Saints’ Day Eve
        new Date(2025, 10, 1),   // Nov 1 — All Saints’ Day
        new Date(2025, 11, 8),   // Dec 8 — Feast of the Immaculate Conception
        new Date(2025, 11, 24),  // Dec 24 — Christmas Eve
        new Date(2025, 11, 31),  // Dec 31 — Last Day of the Year
    ];

    function isWorkingDay(date) {
        const day = date.getDay();
        // Weekend or holiday
        return day !== 0 && day !== 6 && !holidays.some(h =>
            h.getFullYear() === date.getFullYear() &&
            h.getMonth() === date.getMonth() &&
            h.getDate() === date.getDate()
        );
    }

    function adjustToWorkingDay(date) {
        let adjusted = new Date(date);
        while (!isWorkingDay(adjusted)) {
            adjusted.setDate(adjusted.getDate() - 1);
        }
        return adjusted;
    }

    function nextPayday(today = new Date()) {
        const year = today.getFullYear();
        const month = today.getMonth();
        const fifteenth = new Date(year, month, 15);
        const lastDay = new Date(year, month + 1, 0);

        let payday = today <= fifteenth ? fifteenth : lastDay;
        // Adjust if payday falls on weekend or holiday
        return adjustToWorkingDay(payday);
    }

    function workingDaysBetween(start, end) {
        let count = 0;
        let current = new Date(start);
        while (current < end) {
            if (isWorkingDay(current)) count++;
            current.setDate(current.getDate() + 1);
        }
        return count;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
        });
    }

    // Calculate payday and remaining working days
    const today = new Date();
    const payday = nextPayday(today);
    const workdaysLeft = workingDaysBetween(today, payday);

    const paydayMsg = document.getElementById("paydayMsg");
    if (workdaysLeft === 0) {
        paydayMsg.textContent = `Today is payday! (${formatDate(payday)})`;
    } else {
        paydayMsg.textContent = `Goal: ${formatDate(payday)} | ${workdaysLeft} working day${workdaysLeft !== 1 ? "s" : ""} left before payday!`;
    }

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
    // 3.1 DYNAMIC COLLECTION SETS (COMPANY COLLECTION)
    // -------------------------------------------------------------------
    let setCount = Number(localStorage.getItem("setCount")) || 1;
    const collectionSetsContainer = document.getElementById("collectionSetsContainer");
    const addCollectionSetBtn = document.getElementById("addCollectionSetBtn");

    function createCollectionSet(id, restore = false) {
        const newSet = document.createElement("div");
        newSet.classList.add("collection-set");
        newSet.id = `set-${id}`;

        newSet.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-3">Company Collection</h5>
                <button class="btn btn-danger btn-sm remove-set" data-set-id="${id}">×</button>
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
            const setElement = document.getElementById(`set-${setId}`);
            if (setElement) setElement.remove();

            ["colLocation", "colMarket", "colCompanyCount", "colEmailCount", `colMode-${setId}`].forEach(k => {
                localStorage.removeItem(`${k}-${setId}`);
            });

            let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
            const idx = activeSets.indexOf(setId);
            if (idx > -1) activeSets.splice(idx, 1);
            localStorage.setItem("activeSets", JSON.stringify(activeSets));

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

        // Mode toggle
        document.getElementById(`toggleColLocation-${id}`).addEventListener("click", () => {
            const inp = document.getElementById(`colLocation-${id}`);
            const newMode = inp.dataset.mode === "country" ? "state" : "country";
            inp.dataset.mode = newMode;
            localStorage.setItem(`colMode-${id}`, newMode);
            applyMode(newMode, `colLocation-${id}`);
            generateReport();
        });

        // Auto-save
        newSet.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                localStorage.setItem(input.id, input.value);
                generateReport();
            });
        });
    }

    // Restore previous sets
    let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
    for (let i of activeSets) createCollectionSet(i, true);

    // Add new set
    addCollectionSetBtn.addEventListener("click", () => {
        createCollectionSet(setCount);

        let activeSets = JSON.parse(localStorage.getItem("activeSets")) || [];
        activeSets.push(setCount);
        localStorage.setItem("activeSets", JSON.stringify(activeSets));

        setCount++;
        localStorage.setItem("setCount", setCount);
        generateReport();
    });

    // -------------------------------------------------------------------
    // 3.2 DYNAMIC EMAIL SETS (Sending Emails)
    // -------------------------------------------------------------------
    let emailSetCount = Number(localStorage.getItem("emailSetCount")) || 1;
    const emailSetsContainer = document.getElementById("emailSetsContainer");
    const addEmailSetBtn = document.getElementById("addEmailSetBtn");

    function createEmailSet(id, restore = false) {
        const newSet = document.createElement("div");
        newSet.classList.add("email-set");
        newSet.id = `email-set-${id}`;

        newSet.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-3">Email Sending</h5>
            <button class="btn btn-danger btn-sm remove-email-set" data-set-id="${id}">×</button>
        </div>

        <div class="input-group mb-2">
            <button class="btns btn-primary toggle-email me-1" id="toggleEmail-${id}" type="button">
                <i class="bi bi-arrow-repeat"></i>
            </button>
            <input type="text" id="emailLocation-${id}" class="form-control emailLocation" placeholder="Location">
        </div>

        <input type="text" id="emailMarket-${id}" class="form-control mb-2 emailMarket" placeholder="Market Segment">
        <input type="text" id="emailProductLine-${id}" class="form-control mb-2 emailProductLine" placeholder="Product Line">
        <input type="number" id="emailCount-${id}" class="form-control mb-2 emailCount" placeholder="No. of Sent Emails">
        <hr>
    `;

        emailSetsContainer.appendChild(newSet);

        // Remove button
        newSet.querySelector('.remove-email-set').addEventListener('click', (e) => {
            const setId = parseInt(e.target.dataset.setId);
            const setElement = document.getElementById(`email-set-${setId}`);
            if (setElement) setElement.remove();

            // Remove saved inputs from localStorage
            ["emailLocation", "emailMarket", "emailProductLine", "emailCount", `emailMode-${setId}`].forEach(k => {
                localStorage.removeItem(`${k}-${setId}`);
            });

            let activeEmailSets = JSON.parse(localStorage.getItem("activeEmailSets")) || [];
            const idx = activeEmailSets.indexOf(setId);
            if (idx > -1) activeEmailSets.splice(idx, 1);
            localStorage.setItem("activeEmailSets", JSON.stringify(activeEmailSets));

            generateReport();
        });

        // Restore saved inputs
        if (restore) {
            ["emailLocation", "emailMarket", "emailProductLine", "emailCount"].forEach(k => {
                const v = localStorage.getItem(`${k}-${id}`);
                if (v) document.getElementById(`${k}-${id}`).value = v;
            });
        }

        // Restore mode or default
        const savedMode = localStorage.getItem(`emailMode-${id}`) || "country";
        const locationInput = document.getElementById(`emailLocation-${id}`);
        locationInput.dataset.mode = savedMode;
        applyMode(savedMode, `emailLocation-${id}`);

        // Mode toggle
        document.getElementById(`toggleEmail-${id}`).addEventListener("click", () => {
            const inp = document.getElementById(`emailLocation-${id}`);
            const newMode = inp.dataset.mode === "country" ? "state" : "country";
            inp.dataset.mode = newMode;
            localStorage.setItem(`emailMode-${id}`, newMode);
            applyMode(newMode, `emailLocation-${id}`);
            generateReport();
        });

        // Auto-save
        newSet.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                localStorage.setItem(input.id, input.value);
                generateReport();
            });
        });
    }

    // Restore previous email sets
    let activeEmailSets = JSON.parse(localStorage.getItem("activeEmailSets")) || [];
    for (let i of activeEmailSets) createEmailSet(i, true);

    // Add new email set
    addEmailSetBtn.addEventListener("click", () => {
        createEmailSet(emailSetCount);

        let activeEmailSets = JSON.parse(localStorage.getItem("activeEmailSets")) || [];
        activeEmailSets.push(emailSetCount);
        localStorage.setItem("activeEmailSets", JSON.stringify(activeEmailSets));

        emailSetCount++;
        localStorage.setItem("emailSetCount", emailSetCount);
        generateReport();
    });

    // -------------------------------------------------------------------
    // 3.3 DYNAMIC WEBMAIL SETS (Sending Webmails)
    // -------------------------------------------------------------------
    let webmailSetCount = Number(localStorage.getItem("webmailSetCount")) || 1;
    const webmailSetsContainer = document.getElementById("webmailSetsContainer");
    const addWebmailSetBtn = document.getElementById("addWebmailSetBtn");

    function createWebmailSet(id, restore = false) {
        const newSet = document.createElement("div");
        newSet.classList.add("webmail-set");
        newSet.id = `webmail-set-${id}`;

        newSet.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-3">Webmail Sending</h5>
        <button class="btn btn-danger btn-sm remove-webmail-set" data-set-id="${id}">×</button>
    </div>

    <div class="input-group mb-2">
        <button class="btns btn-primary toggle-webmail me-1" id="toggleWebmail-${id}" type="button">
            <i class="bi bi-arrow-repeat"></i>
        </button>
        <input type="text" id="webmailLocation-${id}" class="form-control webmailLocation" placeholder="Location">
    </div>

    <input type="text" id="webmailMarket-${id}" class="form-control mb-2 webmailMarket" placeholder="Market Segment">
    <input type="text" id="webmailProductLine-${id}" class="form-control mb-2 webmailProductLine" placeholder="Product Line">
    <input type="number" id="webmailCount-${id}" class="form-control mb-2 webmailCount" placeholder="No. of Sent Webmails">
    <hr>
    `;

        webmailSetsContainer.appendChild(newSet);

        // Remove button
        newSet.querySelector('.remove-webmail-set').addEventListener('click', (e) => {
            const setId = parseInt(e.target.dataset.setId);
            const setElement = document.getElementById(`webmail-set-${setId}`);
            if (setElement) setElement.remove();

            // Remove saved inputs from localStorage
            ["webmailLocation", "webmailMarket", "webmailProductLine", "webmailCount", `webmailMode-${setId}`].forEach(k => {
                localStorage.removeItem(`${k}-${setId}`);
            });

            let activeWebmailSets = JSON.parse(localStorage.getItem("activeWebmailSets")) || [];
            const idx = activeWebmailSets.indexOf(setId);
            if (idx > -1) activeWebmailSets.splice(idx, 1);
            localStorage.setItem("activeWebmailSets", JSON.stringify(activeWebmailSets));

            generateReport();
        });

        // Restore saved inputs
        if (restore) {
            ["webmailLocation", "webmailMarket", "webmailProductLine", "webmailCount"].forEach(k => {
                const v = localStorage.getItem(`${k}-${id}`);
                if (v) document.getElementById(`${k}-${id}`).value = v;
            });
        }

        // Restore mode or default
        const savedMode = localStorage.getItem(`webmailMode-${id}`) || "country";
        const locationInput = document.getElementById(`webmailLocation-${id}`);
        locationInput.dataset.mode = savedMode;
        applyMode(savedMode, `webmailLocation-${id}`);

        // Mode toggle
        document.getElementById(`toggleWebmail-${id}`).addEventListener("click", () => {
            const inp = document.getElementById(`webmailLocation-${id}`);
            const newMode = inp.dataset.mode === "country" ? "state" : "country";
            inp.dataset.mode = newMode;
            localStorage.setItem(`webmailMode-${id}`, newMode);
            applyMode(newMode, `webmailLocation-${id}`);
            generateReport();
        });

        // Auto-save
        newSet.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", () => {
                localStorage.setItem(input.id, input.value);
                generateReport();
            });
        });
    }

    // Restore previous webmail sets
    let activeWebmailSets = JSON.parse(localStorage.getItem("activeWebmailSets")) || [];
    for (let i of activeWebmailSets) createWebmailSet(i, true);

    // Add new webmail set
    addWebmailSetBtn.addEventListener("click", () => {
        createWebmailSet(webmailSetCount);

        let activeWebmailSets = JSON.parse(localStorage.getItem("activeWebmailSets")) || [];
        activeWebmailSets.push(webmailSetCount);
        localStorage.setItem("activeWebmailSets", JSON.stringify(activeWebmailSets));

        webmailSetCount++;
        localStorage.setItem("webmailSetCount", webmailSetCount);
        generateReport();
    });

    // -------------------------------------------------------------------
    // 4. SECTION TOGGLE BUTTONS (UNCHANGED)
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
    // 5. MODE TOGGLE FOR MAIN INPUTS (UNCHANGED)
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
    // 6. REPORT GENERATION (UNCHANGED)
    // -------------------------------------------------------------------
    function formatLocationLabel(value, mode) {
        if (!value || value.trim() === "") return mode === "country" ? "Country:" : "State:";
        const locations = value.split(/,| and /i).map(s => s.trim()).filter(Boolean);
        const count = locations.length;
        if (count === 0) return mode === "country" ? "Country:" : "State:";
        const label = (count === 1) ? (mode === "country" ? "Country" : "State") : (mode === "country" ? "Countries" : "States");
        if (count === 1) return `${label}: ${locations[0]}`;
        if (count === 2) return `${label}: ${locations[0]} and ${locations[1]}`;
        const last = locations.pop();
        return `${label}: ${locations.join(", ")}, and ${last}`;
    }

    function generateReport() {
        const now = new Date();
        const isMidDay = now.getHours() < 13;
        const dateString = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const reportDateHeader = isMidDay ? `${dateString} (Mid-Day Report)` : dateString;

        // ===============================
        // COLLECTION SECTION
        // ===============================
        let collectionText = "";
        if (collectionSection.style.display !== "none") {
            const colLocation = document.getElementById("colLocation").value;
            const colMarket = document.getElementById("colMarket").value;
            const colCompanyCount = document.getElementById("colCompanyCount").value;
            const colEmailCount = document.getElementById("colEmailCount").value;
            const mode = document.getElementById("colLocation").dataset.mode;
            const locLabel = formatLocationLabel(colLocation, mode);

            collectionText +=
                `COMPANY NAME COLLECTION
${locLabel}
Market Segment: ${colMarket}
No. of Collected Company Names: ${colCompanyCount}
No. of Collected Company Emails: ${colEmailCount}`;
        }

        // DYNAMIC COLLECTION SETS
        if (collectionSection.style.display !== "none") {
            document.querySelectorAll(".collection-set").forEach(set => {
                const loc = set.querySelector(".colLocation").value;
                const market = set.querySelector(".colMarket").value;
                const companyCount = set.querySelector(".colCompanyCount").value;
                const emailCount = set.querySelector(".colEmailCount").value;
                const mode = set.querySelector(".colLocation").dataset.mode;
                const locLabel = formatLocationLabel(loc, mode);

                collectionText +=
                    `\n\nCOMPANY NAME COLLECTION
${locLabel}
Market Segment: ${market}
No. of Collected Company Names: ${companyCount}
No. of Collected Company Emails: ${emailCount}`;
            });
        }

        // ===============================
        // EMAIL SECTION
        // ===============================
        let emailText = "";
        if (emailsSection.style.display !== "none") {
            const emailLocation = document.getElementById("emailLocation").value;
            const emailMarket = document.getElementById("emailMarket").value;
            const emailProductLine = document.getElementById("emailProductLine").value;
            const emailCount = document.getElementById("emailCount").value;
            const emailMode = document.getElementById("emailLocation").dataset.mode;
            const emailLocLabel = formatLocationLabel(emailLocation, emailMode);

            emailText +=
                `SENDING EMAILS
${emailLocLabel}
Market Segment: ${emailMarket}
Product Line: ${emailProductLine}
No. of Sent Emails: ${emailCount}`;
        }

        // DYNAMIC EMAIL SETS
        if (emailsSection.style.display !== "none") {
            document.querySelectorAll(".email-set").forEach(set => {
                const emailLoc = set.querySelector(".emailLocation").value;
                const emailMarket = set.querySelector(".emailMarket").value;
                const emailProductLine = set.querySelector(".emailProductLine").value;
                const emailCount = set.querySelector(".emailCount").value;
                const mode = set.querySelector(".emailLocation").dataset.mode;
                const emailLocLabel = formatLocationLabel(emailLoc, mode);

                emailText +=
                    `\n\nSENDING EMAILS
${emailLocLabel}
Market Segment: ${emailMarket}
Product Line: ${emailProductLine}
No. of Sent Emails: ${emailCount}`;
            });
        }

        // ===============================
        // WEBMAIL SECTION
        // ===============================
        let webmailText = "";
        if (webmailsSection.style.display !== "none") {
            const webmailLocation = document.getElementById("webmailLocation").value;
            const webmailMarket = document.getElementById("webmailMarket").value;
            const webmailProductLine = document.getElementById("webmailProductLine").value;
            const webmailCount = document.getElementById("webmailCount").value;
            const webmailMode = document.getElementById("webmailLocation").dataset.mode;
            const webmailLocLabel = formatLocationLabel(webmailLocation, webmailMode);

            webmailText +=
                `SENDING WEBMAILS
${webmailLocLabel}
Market Segment: ${webmailMarket}
Product Line: ${webmailProductLine}
No. of Sent Webmails: ${webmailCount}`;
        }

        // DYNAMIC WEBMAIL SETS
        if (webmailsSection.style.display !== "none") {
            document.querySelectorAll(".webmail-set").forEach(set => {
                const webmailLoc = set.querySelector(".webmailLocation").value;
                const webmailMarket = set.querySelector(".webmailMarket").value;
                const webmailProductLine = set.querySelector(".webmailProductLine").value;
                const webmailCount = set.querySelector(".webmailCount").value;
                const mode = set.querySelector(".webmailLocation").dataset.mode;
                const webmailLocLabel = formatLocationLabel(webmailLoc, mode);

                webmailText +=
                    `\n\nSENDING WEBMAILS
${webmailLocLabel}
Market Segment: ${webmailMarket}
Product Line: ${webmailProductLine}
No. of Sent Webmails: ${webmailCount}`;
            });
        }

        // ===============================
        // RESPONSE SECTION
        // ===============================
        const emailsReceived = document.getElementById("emailsReceived").value || "0";
        const notInterested = document.getElementById("notInterested").value || "0";

        const responseText =
            `Emails Received: ${emailsReceived}
Not Interested: ${notInterested}`;

        // ===============================
        // FINAL ASSEMBLY
        // ===============================
        const sections = [];
        if (collectionText) sections.push(collectionText);
        if (emailText) sections.push(emailText);
        if (webmailText) sections.push(webmailText);
        sections.push(responseText);

        const reportBody = sections.join("\n\n");
        const username = localStorage.getItem("username") || "User";

        const fullReport =
            `${reportDateHeader}

${reportBody}

Thank you.

- ${username}`;

        dailyReport.value = fullReport;
        localStorage.setItem("generatedReport", fullReport);
    }

    // Restore saved report
    const savedReport = localStorage.getItem("generatedReport");
    if (savedReport) dailyReport.value = savedReport;

    // SAVE ORIGINAL INPUTS
    [
        "colLocation", "colMarket", "colCompanyCount", "colEmailCount",
        "emailLocation", "emailMarket", "emailProductLine", "emailCount",
        "webmailLocation", "webmailMarket", "webmailProductLine", "webmailCount",
        "emailsReceived", "notInterested"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        // Restore previous value
        const saved = localStorage.getItem(id);
        if (saved !== null) el.value = saved;

        // Save when typing
        el.addEventListener("input", () => {
            localStorage.setItem(id, el.value);
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
