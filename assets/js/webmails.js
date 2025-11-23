function copyText(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);

    if (!element || !button) return;

    let textToCopy = element.value ?? element.innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {

        // Save original icon
        const originalIcon = button.innerHTML;

        // Change icon to check
        button.innerHTML = `<i class="bi bi-check2-circle"></i>`;
        button.disabled = true;

        // Highlight input
        element.classList.add("copied-highlight");

        // Restore after delay
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.disabled = false;
            element.classList.remove("copied-highlight");
        }, 1500);
    });
}

// Utility function to load and parse data from localStorage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

function initWebmailsPage() {
    console.log('Webmail.js loaded and fully initialized!');

    // --- Template & Inputs ---
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');
    const companyInput = document.getElementById('companyInput');

    const country1 = document.getElementById('country1');
    const country2 = document.getElementById('country2');
    const marketInput = document.getElementById('marketInput');
    const marketInput2 = document.getElementById('marketInput2');
    const reportOutput = document.getElementById('reportOutput');
    const copyReportButton = document.getElementById('copyReport');

    const displayFullName = document.getElementById('displayFullName');
    const displayMyCompanyName = document.getElementById('displayMyCompanyName');
    const displayEmail = document.getElementById('displayEmail');
    const displayContact = document.getElementById('displayContact');
    const displayAddress = document.getElementById('displayAddress');
    const displayWebsite = document.getElementById('displayWebsite');

    const toggleButton = document.getElementById('togglePersonalDetails');
    const collapseElement = document.getElementById('personalDetailsCollapse');

    const toggleMarketBtn = document.getElementById('toggleMarket2');
    const marketSegment2 = document.getElementById('marketSegment2');

    const subjectTemplate = localStorage.getItem('subjectTemplate') || '';
    const bodyTemplate = localStorage.getItem('bodyTemplate') || '';
    const savedTargetCompanyName = localStorage.getItem('companyName');
    const savedUsername = localStorage.getItem('username') || 'Team Member';
    const savedWebmailData = loadFromLocalStorage('webmailData');

    // --- Save all report inputs including market 2 ---
    function saveToLocalStorage() {
        localStorage.setItem("webmailData", JSON.stringify({
            country1: country1 ? country1.value : '',
            country2: country2 ? country2.value : '',
            market: marketInput ? marketInput.value : '',
            market2: marketInput2 ? marketInput2.value : ''
        }));
    }

    // --- Restore collapse state ---
    const savedCollapseState = localStorage.getItem('personalDetailsCollapsed');
    const collapseInstance = bootstrap.Collapse.getOrCreateInstance(collapseElement, { toggle: false });

    if (savedCollapseState === 'true') {
        collapseInstance.hide();
        toggleButton.querySelector('i').classList.replace('bi-dash-lg', 'bi-plus-lg');
    } else {
        collapseInstance.show();
        toggleButton.querySelector('i').classList.replace('bi-plus-lg', 'bi-dash-lg');
    }

    // --- Update Report ---
    function updateReport() {
        const c1 = country1 ? country1.value.trim() : "Country 1";
        const c2 = country2 ? country2.value.trim() : "Country 2";
        const segment1 = marketInput ? marketInput.value.trim() : "";
        const segment2 = marketInput2 ? marketInput2.value.trim() : "";

        let reportText = `Hi team, I have finished sending webmails in ${c1}`;
        if (segment1) reportText += ` for ${segment1}`;
        reportText += `. I will start sending webmails in ${c2}`;
        if (segment2 && !marketSegment2.classList.contains('d-none')) {
            reportText += ` for ${segment2}`;
        }
        reportText += ` now.\n\n- ${savedUsername}`;

        if (reportOutput) reportOutput.value = reportText;

        saveToLocalStorage();
    }

    // --- Update Email Content ---
    function updateEmailContent() {
        const targetCompanyName = companyInput ? companyInput.value.trim() : '';
        let updatedSubject = subjectTemplate;
        let updatedBody = bodyTemplate;

        if (targetCompanyName) {
            updatedSubject = subjectTemplate.replace(/{company}/g, targetCompanyName);
            updatedBody = bodyTemplate.replace(/{company}/g, targetCompanyName);
        }

        if (emailSubject) emailSubject.value = updatedSubject;
        if (emailBody) emailBody.value = updatedBody;

        localStorage.setItem('companyName', targetCompanyName);
    }

    // --- Restore saved values ---
    if (savedTargetCompanyName) companyInput.value = savedTargetCompanyName;
    if (country1) country1.value = savedWebmailData.country1 || '';
    if (country2) country2.value = savedWebmailData.country2 || '';
    if (marketInput) marketInput.value = savedWebmailData.market || '';
    if (marketInput2) marketInput2.value = savedWebmailData.market2 || '';

    const placeholder = 'N/A (Set in Settings)';
    if (displayFullName) displayFullName.value = localStorage.getItem('fullName') || placeholder;
    if (displayMyCompanyName) displayMyCompanyName.value = localStorage.getItem('myCompanyName') || placeholder;
    if (displayEmail) displayEmail.value = localStorage.getItem('email') || placeholder;
    if (displayContact) displayContact.value = localStorage.getItem('contact') || placeholder;
    if (displayAddress) displayAddress.value = localStorage.getItem('address') || placeholder;
    if (displayWebsite) displayWebsite.value = localStorage.getItem('website') || placeholder;

    // --- Event Listeners ---

    if (toggleMarketBtn && marketSegment2) {
        toggleMarketBtn.addEventListener('click', function () {
            const icon = this.querySelector('i');
            if (marketSegment2.classList.contains('d-none')) {
                marketSegment2.classList.remove('d-none');
                icon.classList.replace('bi-plus', 'bi-x');
            } else {
                marketSegment2.classList.add('d-none');
                icon.classList.replace('bi-x', 'bi-plus');
                if (marketInput2) marketInput2.value = '';
                updateReport();
            }
        });
    }

    if (collapseElement && toggleButton) {
        collapseElement.addEventListener('shown.bs.collapse', function () {
            toggleButton.querySelector('i').classList.replace('bi-plus-lg', 'bi-dash-lg');
            localStorage.setItem('personalDetailsCollapsed', 'false');
        });
        collapseElement.addEventListener('hidden.bs.collapse', function () {
            toggleButton.querySelector('i').classList.replace('bi-dash-lg', 'bi-plus-lg');
            localStorage.setItem('personalDetailsCollapsed', 'true');
        });
    }

    // Inputs updating report
    [country1, country2, marketInput, marketInput2].forEach(input => {
        if (input) input.addEventListener('input', updateReport);
    });

    if (companyInput) companyInput.addEventListener('input', updateEmailContent);

    if (copyReportButton) copyReportButton.addEventListener('click', () => copyText('reportOutput', 'copyReport'));
    document.getElementById('copySubject')?.addEventListener('click', () => copyText('emailSubject', 'copySubject'));
    document.getElementById('copyBody')?.addEventListener('click', () => copyText('emailBody', 'copyBody'));
    document.getElementById('copyFullName')?.addEventListener('click', () => copyText('displayFullName', 'copyFullName'));
    document.getElementById('copyMyCompanyName')?.addEventListener('click', () => copyText('displayMyCompanyName', 'copyMyCompanyName'));
    document.getElementById('copyEmail')?.addEventListener('click', () => copyText('displayEmail', 'copyEmail'));
    document.getElementById('copyContact')?.addEventListener('click', () => copyText('displayContact', 'copyContact'));
    document.getElementById('copyAddress')?.addEventListener('click', () => copyText('displayAddress', 'copyAddress'));
    document.getElementById('copyWebsite')?.addEventListener('click', () => copyText('displayWebsite', 'copyWebsite'));

    // --- Initial Population ---
    updateEmailContent();
    updateReport();
}
    