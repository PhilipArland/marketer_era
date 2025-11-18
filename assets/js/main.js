document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("username");

    // Put saved username into input field
    if (savedName) {
        const nameInput = document.getElementById("userName");
        if (nameInput) nameInput.value = savedName;

        const sidebarName = document.getElementById("sidebar-username");
        if (sidebarName) sidebarName.textContent = savedName;
    }

    /* ----------------------------------
       MOBILE SIDEBAR TOGGLE
    ----------------------------------- */
    const mobileBtn = document.getElementById("mobileSidebarToggle");
    const sidebar = document.getElementById("left-sidebar");

    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener("click", () => {
            sidebar.classList.toggle("d-none");
            sidebar.classList.toggle("show-mobile-sidebar");
        });
    }
});
