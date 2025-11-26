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