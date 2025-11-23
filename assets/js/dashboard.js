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

    // 1. Get references to sections, buttons, and the report textarea
    const collectionSection = document.getElementById('collectionSection');
    const emailsSection = document.getElementById('emailsSection');
    const webmailsSection = document.getElementById('webmailsSection');

    const btnCollection = document.getElementById('btnCollection');
    const btnEmails = document.getElementById('btnEmails');
    const btnWebmails = document.getElementById('btnWebmails');

    const dailyReport = document.getElementById("dailyReport");

    // 2. Load saved section visibility from localStorage
    const secCol = localStorage.getItem("section_collection") || "show";
    const secEmails = localStorage.getItem("section_emails") || "hide";
    const secWebmails = localStorage.getItem("section_webmails") || "hide";

    collectionSection.style.display = secCol === "show" ? "block" : "none";
    emailsSection.style.display = secEmails === "show" ? "block" : "none";
    webmailsSection.style.display = secWebmails === "show" ? "block" : "none";

    // Toggle buttons' active state
    if (secCol === "show") btnCollection.classList.add("active");
    if (secEmails === "show") btnEmails.classList.add("active");
    if (secWebmails === "show") btnWebmails.classList.add("active");

    // 3. Load saved input values from localStorage into the input fields
    document.querySelectorAll("input").forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
        }
    });

    // 4. Toggle visibility for Collection Section
    btnCollection.addEventListener('click', () => {
        const show = collectionSection.style.display === "none";
        collectionSection.style.display = show ? "block" : "none";
        btnCollection.classList.toggle("active");
        localStorage.setItem("section_collection", show ? "show" : "hide");
        generateReport();
    });

    // 5. Toggle visibility for Emails Section
    btnEmails.addEventListener('click', () => {
        const show = emailsSection.style.display === "none";
        emailsSection.style.display = show ? "block" : "none";
        btnEmails.classList.toggle("active");
        localStorage.setItem("section_emails", show ? "show" : "hide");
        generateReport();
    });

    // 6. Toggle visibility for Webmails Section
    btnWebmails.addEventListener('click', () => {
        const show = webmailsSection.style.display === "none";
        webmailsSection.style.display = show ? "block" : "none";
        btnWebmails.classList.toggle("active");
        localStorage.setItem("section_webmails", show ? "show" : "hide");
        generateReport();
    });

    // 7. Define toggle button elements for Country/State switch
    const toggleColLocation = document.getElementById("toggleColLocation");
    const toggleEmailLocation = document.getElementById("toggleEmailLocation");
    const toggleWebmailLocation = document.getElementById("toggleWebmailLocation");

    // 8. Load saved modes from localStorage
    let colMode = localStorage.getItem("colMode") || "country";
    let emailMode = localStorage.getItem("emailMode") || "country";
    let webmailMode = localStorage.getItem("webmailMode") || "country";

    // Apply the initial modes
    applyMode(colMode, "colLocation");
    applyMode(emailMode, "emailLocation");
    applyMode(webmailMode, "webmailLocation");

    // 9. Add event listeners to toggle buttons for Country/State
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

    // Helper function to toggle between "country" and "state"
    function toggleMode(currentMode) {
        return currentMode === "country" ? "state" : "country";
    }

    // Helper function to apply the correct mode (Country/State) and label
    function applyMode(mode, inputId) {
        const input = document.getElementById(inputId);
        input.placeholder = mode === "country"
            ? `Country (Click "🔁" to toggle between Country and State)`
            : `State (Click "🔁" to toggle between Country and State)`;
        input.dataset.mode = mode; // Store the mode in data attribute for reference
    }

    // Helper function to format the location label based on input
    function formatLocationLabel(locationInputValue, mode) {
        const locations = locationInputValue.split(/,| and /i).map(s => s.trim()).filter(Boolean); // Split by commas and "and"
        const locationCount = locations.length;

        // If the input is empty, return the basic label
        if (locationCount === 0) {
            return mode === "country" ? "Country:" : "State:";
        }

        let label = "";
        if (locationCount === 1) {
            label = mode === "country" ? "Country" : "State";
        } else {
            label = mode === "country" ? "Countries" : "States";
        }

        // Format list for 2 or more locations
        let formattedLocations = "";
        if (locationCount === 1) {
            formattedLocations = locations[0];
        } else if (locationCount === 2) {
            formattedLocations = `${locations[0]} and ${locations[1]}`;
        } else {
            const lastLocation = locations.pop();
            formattedLocations = `${locations.join(", ")}, and ${lastLocation}`;
        }

        return `${label}: ${formattedLocations}`;
    }

    // 10. Generate the report based on the input values
    function generateReport() {
        const now = new Date();
        // Determine if it's before 1:00 PM (13:00 in 24-hour format)
        const isMidDay = now.getHours() < 13;

        // Format the base date string
        const dateString = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        // Append the Mid-Day Report tag if required
        const reportDateHeader = isMidDay
            ? `${dateString} (Mid-Day Report)`
            : dateString;


        // -----------------------------
        // 1. Collect Values for Report
        // -----------------------------
        let collectionText = "";
        if (collectionSection.style.display !== "none") {
            const colLocation = document.getElementById("colLocation").value;
            const colMarket = document.getElementById("colMarket").value;
            const colCompanyCount = document.getElementById("colCompanyCount").value;
            const colEmailCount = document.getElementById("colEmailCount").value;
            const colMode = document.getElementById("colLocation").dataset.mode; // Retrieve the mode

            // Get the collection location label
            const collectionLocationLabel = formatLocationLabel(colLocation, colMode);

            collectionText =
                `COMPANY NAME COLLECTION
${collectionLocationLabel}
Market Segment: ${colMarket}
No. of Collected Company Names: ${colCompanyCount}
No. of Collected Company Emails: ${colEmailCount}`;
        }

        let emailText = "";
        if (emailsSection.style.display !== "none") {
            const emailLocation = document.getElementById("emailLocation").value;
            const emailMarket = document.getElementById("emailMarket").value;
            const emailProductLine = document.getElementById("emailProductLine").value;
            const emailCount = document.getElementById("emailCount").value;
            const emailMode = document.getElementById("emailLocation").dataset.mode; // Retrieve the mode

            // Get the email location label
            const emailLocationLabel = formatLocationLabel(emailLocation, emailMode);

            emailText =
                `SENDING EMAILS
${emailLocationLabel}
Market Segment: ${emailMarket}
Product Line: ${emailProductLine}
No. of Sent Emails: ${emailCount}`;
        }

        let webmailText = "";
        if (webmailsSection.style.display !== "none") {
            const webmailLocation = document.getElementById("webmailLocation").value;
            const webmailMarket = document.getElementById("webmailMarket").value;
            const webmailProductLine = document.getElementById("webmailProductLine").value;
            const webmailCount = document.getElementById("webmailCount").value;
            const webmailMode = document.getElementById("webmailLocation").dataset.mode; // Retrieve the mode

            // Get the webmail location label
            const webmailLocationLabel = formatLocationLabel(webmailLocation, webmailMode);

            webmailText =
                `SENDING WEBMAILS
${webmailLocationLabel}
Market Segment: ${webmailMarket}
Product Line: ${webmailProductLine}
No. of Sent Webmails: ${webmailCount}`;
        }

        let responseText = "";
        // Note: responseSection is not toggled, so we assume it's always available
        const emailsReceived = document.getElementById("emailsReceived").value || "0";
        const notInterested = document.getElementById("notInterested").value || "0";
        responseText =
            `Emails Received: ${emailsReceived}
Not Interested: ${notInterested}`;


        // -----------------------------
        // 2. Assemble the Report Content
        // -----------------------------
        const sections = [];
        if (collectionText) sections.push(collectionText);
        if (emailText) sections.push(emailText);
        if (webmailText) sections.push(webmailText);
        if (responseText) sections.push(responseText);

        const reportBody = sections.join("\n\n");

        // -----------------------------
        // 3. Final Report Template
        // -----------------------------
        const username = localStorage.getItem('username') || 'User';
        const fullReport = `
${reportDateHeader}

${reportBody}

Thank you.

- ${username}`.trim();

        // Set the report to the textarea
        dailyReport.value = fullReport;

        // Save the report in localStorage
        localStorage.setItem("generatedReport", fullReport);
    }

    // 11. Load the report from localStorage (if available)
    const savedReport = localStorage.getItem("generatedReport");
    if (savedReport) {
        dailyReport.value = savedReport;
    }

    // 12. Auto Update the Report on Input Change
    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            // Save input values in localStorage
            localStorage.setItem(input.id, input.value);

            // Regenerate the report
            generateReport();
        });
    });

    // 13. Copy Report Button Functionality
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

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Clear all input fields
            document.querySelectorAll("input").forEach(input => {
                input.value = "";
                // Clear corresponding localStorage items for inputs
                localStorage.removeItem(input.id);
            });

            // Clear the generated report
            dailyReport.value = "";
            localStorage.removeItem("generatedReport");

            // Reset location modes to default ("country") and re-apply placeholders
            localStorage.setItem("colMode", "country");
            localStorage.setItem("emailMode", "country");
            localStorage.setItem("webmailMode", "country");
            applyMode("country", "colLocation");
            applyMode("country", "emailLocation");
            applyMode("country", "webmailLocation");

            // Force a report regeneration (which will now be mostly empty)
            generateReport();
            console.log("All input fields and local storage data have been reset.");
        });
    }

    // Call to generate report after page load
    generateReport();
}
