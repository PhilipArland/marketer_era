function initSettingsPage() {
    // Define all keys for webmail templates and personal details
    const PERSONAL_DETAIL_KEYS = [
        'subjectTemplate',
        'bodyTemplate',
        'fullName',
        'myCompanyName', // <-- MATCHES NEW HTML ID
        'address',
        'contact',
        'email',
        'website'
    ];

    // --- 1. Load Settings from localStorage ---
    function loadSettings() {
        // Load General Settings (Username, Profile Image)
        const username = localStorage.getItem('username');
        const profileImg = localStorage.getItem('profileImg');

        const usernameField = document.getElementById('username');
        if (username && usernameField) {
            usernameField.value = username;
        }

        const previewContainer = document.getElementById('preview-container');
        if (profileImg && previewContainer) {
            previewContainer.innerHTML = `<img id="profile-preview" src="${profileImg}" alt="Profile Image" style="max-width: 100%; max-height: 250px; object-fit: contain;">`;
        }

        // Load Webmail/Personal Details using the key array
        PERSONAL_DETAIL_KEYS.forEach(key => {
            const element = document.getElementById(key);
            const value = localStorage.getItem(key);
            if (element && value !== null) {
                element.value = value;
            }
        });
    }

    // --- 2. Save General Settings (Username, Profile Image) ---
    function saveSettings() {
        const usernameElement = document.getElementById('username');
        const username = usernameElement ? usernameElement.value : null;
        const profileImgInput = document.getElementById('profile-img');
        const profileImgFile = profileImgInput ? profileImgInput.files[0] : null;

        if (username) {
            localStorage.setItem('username', username);
        }

        if (profileImgFile) {
            const maxFileSize = 2 * 1024 * 1024; // 2MB limit
            if (profileImgFile.size > maxFileSize) {
                alert('Image size exceeds the 2MB limit. Please choose a smaller image.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = function () {
                localStorage.setItem('profileImg', reader.result);
                alert('Profile Image saved!');
            };
            reader.readAsDataURL(profileImgFile);
        }

        alert('Settings saved!');
    }


    // --- 3. Save Webmail Templates and Personal Details ---
    function saveWebmailTemplates() {
        PERSONAL_DETAIL_KEYS.forEach(key => {
            const element = document.getElementById(key);
            // Save if the element exists and has a value (even an empty string)
            if (element) {
                localStorage.setItem(key, element.value);
            }
        });

        alert('Webmail Templates and Personal Details saved!');
    }

    // --- 4. Event Listeners and Initialization ---

    loadSettings();

    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }

    const saveWebmailButton = document.getElementById('saveWebmailBtn');
    if (saveWebmailButton) {
        saveWebmailButton.addEventListener('click', saveWebmailTemplates);
    }

    const profileImgInput = document.getElementById('profile-img');
    if (profileImgInput) {
        profileImgInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const previewContainer = document.getElementById('preview-container');
                    previewContainer.innerHTML = `<img id="profile-preview" src="${reader.result}" alt="Profile Image" style="max-width: 100%; max-height: 250px; object-fit: contain;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function resetAllSettings() {
        const CONFIRM = confirm("Are you sure you want to reset all settings? This cannot be undone.");
        if (!CONFIRM) return;

        // Clear localStorage keys
        localStorage.removeItem('username');
        localStorage.removeItem('profileImg');
        PERSONAL_DETAIL_KEYS.forEach(key => localStorage.removeItem(key));

        // Clear UI fields
        const usernameField = document.getElementById('username');
        if (usernameField) usernameField.value = '';

        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) previewContainer.innerHTML = '';

        PERSONAL_DETAIL_KEYS.forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = '';
        });

        // Reset file input
        const profileImgInput = document.getElementById('profile-img');
        if (profileImgInput) profileImgInput.value = '';

        alert("All settings have been reset.");
    }

    // Attach listener
    const resetAllBtn = document.getElementById('resetAllBtn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetAllSettings);
    }

}