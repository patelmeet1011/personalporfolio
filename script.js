document.addEventListener('DOMContentLoaded', () => {

    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const moonIcon = '<i class="bi bi-moon-stars-fill"></i>';
    const sunIcon = '<i class="bi bi-sun-fill"></i>';

    // --- Theme Toggle ---
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-bs-theme', theme);
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
            themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        }
        // Use try-catch for localStorage in case it's blocked/unavailable
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn("LocalStorage is not available. Theme preference cannot be saved.");
        }
    };

    let currentTheme = 'light'; // Default theme
    try {
      const storedTheme = localStorage.getItem('theme');
      const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      currentTheme = storedTheme || preferredTheme;
    } catch (e) {
        console.warn("Could not access localStorage to read theme preference.");
        // Fallback to system preference if localStorage fails
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        currentTheme = preferredTheme;
    }
    setTheme(currentTheme); // Set initial theme

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    // --- AOS Initialization ---
    AOS.init({
        duration: 700, // Slightly faster
        once: true,    // Animate only once
        offset: 50,    // Offset (in px) from the original trigger point
        easing: 'ease-out-cubic', // Smoother easing
    });

    // --- VantaJS Initialization ---
    // (Place this after other initializations like Theme and AOS)
    try {
        if (document.getElementById('vanta-bg')) { // Check if the element exists
            VANTA.NET({
              el: "#vanta-bg", // Target the div you added in index.html
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              // --- Customize These ---
              color: 0x4A90E2,         // Example: Your primary blue (or choose another)
              backgroundColor: currentTheme === 'dark' ? 0x121212 : 0xffffff, // Match theme background
              points: 12.00,           // Adjust density
              maxDistance: 23.00,      // Adjust connection distance
              spacing: 18.00           // Adjust point spacing
              // Add more NET-specific options if needed
            });
            console.log("VantaJS NET effect initialized on #vanta-bg.");
        } else {
            console.warn("VantaJS target element #vanta-bg not found.");
        }
    } catch (e) {
        console.error("VantaJS initialization error:", e);
    }
    // --- End of VantaJS Initialization ---

    // --- Footer Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Bootstrap Tooltips Initialization ---
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // --- Skill Modal ---
    const skillModal = document.getElementById('skillModal');
    if (skillModal) {
        skillModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget; // Card that triggered the modal
            // Provide default values if attributes are missing
            const skillName = button.getAttribute('data-skill-name') || 'Skill Details';
            const skillDetails = button.getAttribute('data-skill-details') || 'No details provided.';

            const modalTitle = skillModal.querySelector('#modal-skill-name');
            const modalBody = skillModal.querySelector('#modal-skill-details');

            // Check if elements exist before setting text content
            if (modalTitle) modalTitle.textContent = skillName;
            if (modalBody) modalBody.textContent = skillDetails;
        });
    }

    // --- Project Filtering ---
    const filterContainer = document.getElementById('project-filters');
    const projectItems = document.querySelectorAll('.project-gallery .project-item');
    const projectGallery = document.querySelector('.project-gallery'); // Get the gallery container

    if (filterContainer && projectItems.length > 0 && projectGallery) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Deactivate currently active button
                const currentActive = filterContainer.querySelector('.filter-btn.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                    currentActive.setAttribute('aria-pressed', 'false');
                }
                // Activate clicked button
                e.target.classList.add('active');
                e.target.setAttribute('aria-pressed', 'true');

                const filterValue = e.target.getAttribute('data-filter');

                // Add a class to the gallery to manage layout transition (optional, depends on CSS)
                projectGallery.classList.add('filtering');

                projectItems.forEach(item => {
                    const tags = item.getAttribute('data-tags')?.split(',') || [];
                    const shouldShow = filterValue === 'all' || tags.includes(filterValue);

                    // Use CSS classes for hide/show to leverage transitions
                    if (shouldShow) {
                        item.classList.remove('hide');
                    } else {
                        item.classList.add('hide');
                    }
                    // Ensure AOS animations are correctly handled on filter changes
                    // Remove animation class to reset state for potential re-animation
                    item.classList.remove('aos-animate');
                });

                // Refresh AOS after a short delay to allow CSS transitions and layout shifts
                setTimeout(() => {
                    AOS.refresh(); // Recalculate element positions for AOS
                    projectGallery.classList.remove('filtering'); // Remove transition helper class

                    // Optionally re-trigger animations for newly visible items
                    projectItems.forEach(item => {
                        if (!item.classList.contains('hide') && !item.classList.contains('aos-animate')) {
                            // Add classes back to trigger animation; adjust as needed
                            item.classList.add('aos-init', 'aos-animate');
                        }
                    });
                }, 300); // Adjust delay to match CSS transition duration if any
            }
        });
    }


    // --- Navbar Active State Highlight & Smooth Scroll ---
    // Bootstrap's Scrollspy handles active state. This enhances smooth scroll.
    document.querySelectorAll('a.nav-link[href^="#"], a.footer-link[href^="#"], a.navbar-brand[href^="#"], a.back-to-top-btn[href^="#"]').forEach(anchor => { // Added .back-to-top-btn
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's a valid internal link
            if (href && href.startsWith('#') && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault(); // Prevent default jump only if target exists

                    const navbarHeight = document.getElementById('navbar-main')?.offsetHeight || 70;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile navbar if open after clicking a link
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    // Check if the toggler is not collapsed (visible) and the collapse menu is shown
                    if (navbarToggler && !navbarToggler.classList.contains('collapsed') && navbarCollapse?.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
                        bsCollapse.hide();
                    }
                }
            }
        });
    });


    // --- Enhanced Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitButton = document.getElementById('submit-button');

    if (contactForm && formStatus && submitButton) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                // Provide clearer feedback for validation errors
                formStatus.className = 'alert alert-warning alert-dismissible fade show';
                formStatus.innerHTML = 'Please check the required fields. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
                return;
            }
            contactForm.classList.add('was-validated'); // Keep validation styles visible

            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');
            const submitButtonOriginalHTML = submitButton.innerHTML; // Store original button content
            const spinner = submitButton.querySelector('.spinner-border');

            if (!formAction || formAction === "YOUR_FORM_ENDPOINT") {
                console.error("Form submission endpoint is not configured.");
                formStatus.className = 'alert alert-danger show alert-dismissible fade show';
                formStatus.innerHTML = 'Form submission is not configured. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
                return;
            }

            submitButton.disabled = true;
            if (spinner) spinner.classList.remove('d-none');
            // Update button text more reliably
            submitButton.childNodes[spinner ? 1 : 0].textContent = ' Sending... ';
            formStatus.className = 'alert alert-info show';
            formStatus.textContent = 'Sending your message... Please wait.';

            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.className = 'alert alert-success alert-dismissible fade show';
                    formStatus.innerHTML = 'Message sent successfully! Thank you. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                } else {
                    let errorMessage = 'An error occurred during submission.';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || `Server Error: ${response.status} ${response.statusText}`;
                    } catch (parseError) {
                        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorMessage);
                }

            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.className = 'alert alert-danger alert-dismissible fade show';
                formStatus.innerHTML = `Oops! ${error.message || 'A network error occurred.'} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
            } finally {
                submitButton.disabled = false;
                // Restore original button content (including icon)
                submitButton.innerHTML = submitButtonOriginalHTML;

                // Auto-dismiss status messages after a delay
                setTimeout(() => {
                   const currentAlertInstance = bootstrap.Alert.getOrCreateInstance(formStatus);
                   currentAlertInstance?.close(); // Gracefully close using Bootstrap's method
                }, 7000); // 7 seconds
            }
        });
    }


    // --- Back to Top Button ---
    // (Your existing Back to Top Button code seems fine, keeping it as is)
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        const scrollThreshold = 300; // Show button after scrolling down this many pixels
        const toggleBackToTopButton = () => {
            if (window.pageYOffset > scrollThreshold) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        };

        // Smooth scroll event listener is already added in the "Navbar Active State Highlight & Smooth Scroll" section
        // Just need the scroll listener for visibility

        // Listen for scroll events to show/hide button
        window.addEventListener('scroll', toggleBackToTopButton);

        // Initial check in case the page loads already scrolled down
        toggleBackToTopButton();
    }

}); // End DOMContentLoaded
