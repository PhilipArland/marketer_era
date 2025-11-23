/** Saves data to localStorage. */
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/** Loads and parses data from localStorage. */
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

/** Copies the generated message to clipboard. */
function copyOutput() {
    const outputText = document.getElementById('outputText');
    if (outputText) {
        outputText.select();
        document.execCommand('copy');
    }
}

// --- CORE APPLICATION LOGIC ---
function updateAndSave() {
    updateGeneratedMessage();
    saveCollectionData();
}

/**
 * Saves all input and checkbox states to localStorage.
 */
function saveCollectionData() {
    const countryInput = document.getElementById('countryInput');
    const countryInput2 = document.getElementById('countryInput2');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const marketSegmentInput2 = document.getElementById('marketSegmentInput2');
    const citiesInput = document.getElementById('citiesInput');
    const citiesWrapper = document.getElementById('citiesWrapper');
    const secondSection = document.getElementById('secondCountrySegment');

    const country1 = countryInput ? countryInput.value.trim() : '';
    const country2 = countryInput2 ? countryInput2.value.trim() : '';
    const segment1 = marketSegmentInput ? marketSegmentInput.value.trim() : '';
    const segment2 = marketSegmentInput2 ? marketSegmentInput2.value.trim() : '';
    const citiesInputString = citiesInput ? citiesInput.value : '';

    const checkboxes = Array.from(document.querySelectorAll("#cityList input[type='checkbox']")).map(cb => cb.checked);
    const isCitiesWrapperVisible = citiesWrapper ? citiesWrapper.style.display !== 'none' : true;
    const isSecondSectionVisible = secondSection ? !secondSection.classList.contains('d-none') : false;

    localStorage.setItem('collectionData', JSON.stringify({
        country1,
        country2,
        segment1,
        segment2,
        citiesInputString,
        checkboxes,
        isCitiesWrapperVisible,
        isSecondSectionVisible
    }));
}

/**
 * Updates the progress bar based on checked cities.
 */
function updateProgress(boxes) {
    const progressBar = document.getElementById("progressBar");
    if (!progressBar || boxes.length === 0) {
        if (progressBar) progressBar.style.width = '0%';
        return;
    }

    const checked = Array.from(boxes).filter(cb => cb.checked).length;
    const total = boxes.length;
    const percent = Math.round((checked / total) * 100);

    progressBar.style.width = percent + "%";
    progressBar.textContent = percent + "%";
    progressBar.setAttribute('aria-valuenow', checked);
}

/**
 * Updates the generated message based on input and progress.
 */
function updateGeneratedMessage() {
    const countryInput = document.getElementById('countryInput');
    const countryInput2 = document.getElementById('countryInput2');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const marketSegmentInput2 = document.getElementById('marketSegmentInput2');
    const cityList = document.getElementById('cityList');
    const outputText = document.getElementById('outputText');
    const secondSection = document.getElementById('secondCountrySegment');

    if (!countryInput || !marketSegmentInput || !cityList || !outputText) return;

    const country1 = countryInput.value.trim();
    let country2 = countryInput2 ? countryInput2.value.trim() : '';
    const segment1 = marketSegmentInput.value.trim();
    let segment2 = marketSegmentInput2 ? marketSegmentInput2.value.trim() : '';

    // If second section is hidden, ignore country2/segment2
    if (secondSection && secondSection.classList.contains('d-none')) {
        country2 = '';
        segment2 = '';
    }

    const boxes = cityList.querySelectorAll("input[type='checkbox']");
    const labels = cityList.querySelectorAll(".form-check-label");

    let username = localStorage.getItem('username') || 'User';
    let cityText = "";
    let nextCityText = "";

    // Find the last checked city
    const lastCheckedIndex = Array.from(boxes).map(cb => cb.checked).lastIndexOf(true);

    if (labels.length > 0) {
        if (lastCheckedIndex === -1) {
            cityText = labels[0].innerText;
            nextCityText = labels.length > 1 ? labels[1].innerText : "";
        } else {
            cityText = labels[lastCheckedIndex].innerText;
            nextCityText = (lastCheckedIndex + 1 < labels.length) ? labels[lastCheckedIndex + 1].innerText : "";
        }
    }

    // Build message
    let message = `Hi, I have finished collecting company names and emails in ${cityText}, ${country1} for ${segment1}. `;

    if (country2 || segment2) {
        const nextCountry = country2 || country1;
        const nextSegment = segment2 || segment1;

        if (segment2) {
            message += `I will start collecting in ${nextCountry} for ${nextSegment} now.`;
        } else {
            message += `I will start collecting in ${nextCountry} now.`;
        }
    } else if (nextCityText) {
        message += `I will start collecting in ${nextCityText}, ${country1} now.`;
    }

    message += `\n\n- ${username}`;
    outputText.value = message;

    updateProgress(boxes);
}



/**
 * Generates the city checkboxes from the textarea input, attaching listeners.
 * @param {Array<boolean>} [savedCheckboxes=[]] - Optional array to restore checked state.
 */
function generateCityList(savedCheckboxes = []) {
    const citiesInput = document.getElementById('citiesInput');
    const cityList = document.getElementById('cityList');

    if (!citiesInput || !cityList) return;

    // Split and filter cities
    const cities = citiesInput.value.trim().split('\n').filter(city => city.trim() !== '');

    let html = '';
    cities.forEach((city, idx) => {
        const isChecked = savedCheckboxes[idx] === true;
        const checkedAttribute = isChecked ? 'checked' : '';

        html += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="city_${idx}" ${checkedAttribute}>
                <label class="form-check-label" for="city_${idx}">${city}</label>
            </div>
        `;
    });

    cityList.innerHTML = html;

    // Attach listeners to checkboxes
    const newlyCreatedBoxes = cityList.querySelectorAll("input[type='checkbox']");
    newlyCreatedBoxes.forEach(box => {
        box.addEventListener('click', () => {
            updateProgress(newlyCreatedBoxes);
            saveCollectionData();
            updateGeneratedMessage();
        });
    });

    updateProgress(newlyCreatedBoxes);
    updateGeneratedMessage();
}

// --- MAIN INITIALIZATION LOGIC ---
function loadAllData() {
    const saved = JSON.parse(localStorage.getItem('collectionData') || '{}');
    const countryInput = document.getElementById('countryInput');
    const countryInput2 = document.getElementById('countryInput2');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const marketSegmentInput2 = document.getElementById('marketSegmentInput2');
    const citiesInput = document.getElementById('citiesInput');
    const citiesWrapper = document.getElementById('citiesWrapper');
    const secondSection = document.getElementById('secondCountrySegment');
    const toggleSecondSectionBtn = document.getElementById('toggleSecondSectionBtn');

    if (!countryInput || !marketSegmentInput || !citiesInput) return;

    // Restore values
    countryInput.value = saved.country1 || '';
    if (countryInput2) countryInput2.value = saved.country2 || '';
    marketSegmentInput.value = saved.segment1 || '';
    if (marketSegmentInput2) marketSegmentInput2.value = saved.segment2 || '';
    citiesInput.value = saved.citiesInputString || '';

    // Restore checkbox states
    generateCityList(saved.checkboxes || []);

    // Restore second section visibility
    if (secondSection && toggleSecondSectionBtn) {
        if (saved.isSecondSectionVisible) {
            secondSection.classList.remove('d-none');
            toggleSecondSectionBtn.querySelector('i').classList.remove('bi-plus-lg');
            toggleSecondSectionBtn.querySelector('i').classList.add('bi-dash-lg');
        } else {
            secondSection.classList.add('d-none');
            toggleSecondSectionBtn.querySelector('i').classList.remove('bi-dash-lg');
            toggleSecondSectionBtn.querySelector('i').classList.add('bi-plus-lg');
        }
    }

    if (citiesWrapper) {
        citiesWrapper.style.display = saved.isCitiesWrapperVisible !== false ? 'block' : 'none';
    }
}

function initCollectionPage() {
    console.log('Collection.js loaded!');

    loadAllData();

    const countryInput = document.getElementById('countryInput');
    const countryInput2 = document.getElementById('countryInput2');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const marketSegmentInput2 = document.getElementById('marketSegmentInput2');
    const citiesInput = document.getElementById('citiesInput');
    const generateCitiesBtn = document.getElementById('generateCitiesBtn');
    const toggleCitiesBtn = document.getElementById('toggleCitiesBtn');
    const toggleSecondSectionBtn = document.getElementById('toggleSecondSectionBtn');
    const secondSection = document.getElementById('secondCountrySegment');

    // Input listeners
    if (countryInput) countryInput.addEventListener('input', updateAndSave);
    if (countryInput2) countryInput2.addEventListener('input', updateAndSave);
    if (marketSegmentInput) marketSegmentInput.addEventListener('input', updateAndSave);
    if (marketSegmentInput2) marketSegmentInput2.addEventListener('input', updateAndSave);
    if (citiesInput) citiesInput.addEventListener('input', updateAndSave);

    // Generate cities button
    if (generateCitiesBtn) {
        generateCitiesBtn.addEventListener('click', () => generateCityList());
    }

    // Toggle cities wrapper
    if (toggleCitiesBtn) {
        toggleCitiesBtn.addEventListener('click', () => {
            const citiesWrapper = document.getElementById('citiesWrapper');
            const icon = toggleCitiesBtn.querySelector('i');
            if (!citiesWrapper || !icon) return;

            const isVisible = citiesWrapper.style.display !== 'none';
            citiesWrapper.style.display = isVisible ? 'none' : 'block';

            icon.classList.toggle('bi-dash-lg');
            icon.classList.toggle('bi-plus-lg');

            saveCollectionData();
        });
    }

    // Toggle second section
    if (toggleSecondSectionBtn && secondSection) {
        toggleSecondSectionBtn.addEventListener('click', () => {
            secondSection.classList.toggle('d-none');
            const icon = toggleSecondSectionBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-plus-lg');
                icon.classList.toggle('bi-dash-lg');
            }
            saveCollectionData();
            updateGeneratedMessage();
        });
    }
}
