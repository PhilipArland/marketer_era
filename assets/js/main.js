document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // FUNCTION TO LOAD PAGES
    // ==============================
    function loadPage(page) {
        // Save last visited page
        localStorage.setItem('lastPage', page);

        fetch(`pages/${page}.html`)
            .then(res => res.text())
            .then(html => {
                const content = document.getElementById('content');
                content.innerHTML = html;

                window.scrollTo(0, 0);

                handlePageInit(page);
            })
            .catch(err => console.error('Error loading page:', err));
    }

    // ==============================
    // HELPER: LOAD HTML INTO ELEMENT
    // ==============================
    function loadHTML(targetId, url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(html => {
                const target = document.getElementById(targetId);
                if (target) target.innerHTML = html;
                target.scrollTop = 0;
                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    // ==============================
    // HANDLE PAGE SPECIFIC INIT
    // ==============================
    function handlePageInit(page) {
        syncActiveLinks(page);

        switch (page) {
            case 'dashboard': initDashboardPage(); break;
            case 'collection': initCollectionPage(); break;
            case 'webmails': initWebmailsPage(); break;
            case 'helper': initHelperPage(); break;
            case 'settings': initSettingsPage(); break;
        }
    }

    // ==============================
    // SYNC ACTIVE LINKS
    // ==============================
    function syncActiveLinks(page) {
        document.querySelectorAll('#left-sidebar a[data-page], #mobileSidebar a[data-page]')
            .forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === page);
            });
    }

    // ==============================
    // UPDATE PROFILE INFO
    // ==============================
    function updateProfileInfo() {
        const username = localStorage.getItem('username') || 'User';
        const profileImg = localStorage.getItem('profileImg') || 'assets/img/2.png';

        // Sidebar
        const sidebarUsernameEl = document.getElementById('sidebar-username');
        const sidebarProfileImgEl = document.getElementById('sidebar-profile-img');
        if (sidebarUsernameEl) sidebarUsernameEl.textContent = username;
        if (sidebarProfileImgEl) sidebarProfileImgEl.src = profileImg;

        // Navbar / Mobile
        const navProfileImgEl = document.getElementById('nav-profile-img');
        const navbarProfileImgEl = document.getElementById('navbar-profile-img');
        const navbarUsernameEl = document.getElementById('navbar-username');
        if (navProfileImgEl) navProfileImgEl.src = profileImg;
        if (navbarProfileImgEl) navbarProfileImgEl.src = profileImg;
        if (navbarUsernameEl) navbarUsernameEl.textContent = username;
    }

    // ==============================
    // MOBILE SIDEBAR
    // ==============================
    loadHTML("mobileSidebar", "includes/mobile-sidebar.html", () => {
        const toggleBtn = document.getElementById("mobileSidebarToggle");
        const sidebar = document.getElementById("mobileSidebar");
        const overlay = document.getElementById("sidebarOverlay");

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("active");
                overlay.classList.toggle("active");
                document.body.classList.toggle("no-scroll", sidebar.classList.contains("active"));
            });

            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        }

        // Handle mobile sidebar links
        document.querySelectorAll("#mobileSidebar a[data-page]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.getAttribute("data-page");
                loadPage(page);
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        });

        updateProfileInfo(); // ensure profile info is updated in mobile sidebar
    });

    // ==============================
    // LEFT SIDEBAR (DESKTOP)
    // ==============================
    loadHTML("left-sidebar", "includes/left-sidebar.html", () => {
        const toggleBtn = document.getElementById('toggle-btn');
        const sidebar = document.getElementById('left-sidebar');

        // Toggle sidebar
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('closed');
                toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            });
        }

        // Handle desktop sidebar links
        document.querySelectorAll('#left-sidebar a[data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                loadPage(page);
            });
        });

        updateProfileInfo(); // update profile info in sidebar
    });

    // ==============================
    // LOAD LAST PAGE OR DEFAULT
    // ==============================
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    loadPage(lastPage);
});
