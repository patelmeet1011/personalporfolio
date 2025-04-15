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
        localStorage.setItem('theme', theme);
    };

    const storedTheme = localStorage.getItem('theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = storedTheme || preferredTheme;
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
            const skillName = button.getAttribute('data-skill-name');
            const skillDetails = button.getAttribute('data-skill-details');

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
                const currentActive = filterContainer.querySelector('.filter-btn.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                    currentActive.setAttribute('aria-pressed', 'false');
                }
                e.target.classList.add('active');
                e.target.setAttribute('aria-pressed', 'true');

                const filterValue = e.target.getAttribute('data-filter');

                // Add a class to the gallery to manage layout transition
                projectGallery.classList.add('filtering');

                projectItems.forEach(item => {
                    const tags = item.getAttribute('data-tags')?.split(',') || [];
                    const shouldShow = filterValue === 'all' || tags.includes(filterValue);

                    if (shouldShow) {
                        item.classList.remove('hide');
                    } else {
                        item.classList.add('hide');
                    }
                     // Ensure AOS animations are correctly handled on filter changes
                    item.classList.remove('aos-animate'); // Remove AOS animation class
                });

                 // Refresh AOS after a short delay to allow CSS transitions
                 setTimeout(() => {
                     AOS.refresh();
                     projectGallery.classList.remove('filtering'); // Remove transition class
                     // Re-add aos-animate to visible items if needed for re-animation (use carefully)
                     projectItems.forEach(item => {
                         if (!item.classList.contains('hide')) {
                            // If you want items to re-animate on filter, uncomment next line
                            // item.classList.add('aos-init', 'aos-animate');
                         }
                     });
                 }, 400); // Match transition duration in CSS if specified
            }
        });
    }


    // --- Navbar Active State Highlight & Smooth Scroll ---
    // Bootstrap's Scrollspy handles active state via data attributes on the body tag.
    // Adding smooth scroll enhancement for internal links:
    document.querySelectorAll('a.nav-link[href^="#"], a.footer-link[href^="#"], a.navbar-brand[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only prevent default for internal links (starting with #)
            if (href && href.startsWith('#') && href.length > 1) {
                 e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const navbarHeight = document.getElementById('navbar-main')?.offsetHeight || 70; // Use defined height or default
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile navbar if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarToggler && navbarCollapse?.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (bsCollapse) {
                            bsCollapse.hide();
                        }
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
            e.preventDefault(); // Prevent default browser submission
            e.stopPropagation(); // Prevent event bubbling

            // Use Bootstrap's built-in validation feedback
            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                // Optionally provide a general status message
                formStatus.textContent = 'Please review the highlighted fields.';
                // Use dismissible alert for better UX
                formStatus.className = 'alert alert-warning alert-dismissible fade show';
                formStatus.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
                return;
            }
            // Ensure validation styles are shown if form is valid but submitted
            contactForm.classList.add('was-validated');

            // --- Submission Logic ---
            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action'); // Get endpoint from form action attribute

            // Check if endpoint is configured
            if (!formAction || formAction === "YOUR_FORM_ENDPOINT") {
                 formStatus.textContent = 'Form submission endpoint is not configured.';
                 formStatus.className = 'alert alert-danger show';
                 return; // Stop submission
            }

            // Show loading state
            submitButton.disabled = true;
            const spinner = submitButton.querySelector('.spinner-border');
            if(spinner) spinner.classList.remove('d-none');
            formStatus.className = 'alert alert-info show'; // Use 'show' class for transitions
            formStatus.textContent = 'Sending message...';

            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' } // Important for services like Formspree
                });

                if (response.ok) {
                    // Success
                    formStatus.className = 'alert alert-success show';
                    formStatus.textContent = 'Message sent successfully! Thanks for reaching out.';
                    contactForm.reset();
                    contactForm.classList.remove('was-validated'); // Reset validation state
                } else {
                     // Handle non-OK responses (e.g., server errors)
                    const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
                    const errorMessage = errorData.error || `Error: ${response.statusText || 'Form submission failed.'}`;
                    throw new Error(errorMessage);
                }

            } catch (error) {
                 // Handle fetch errors (network issues) or errors thrown above
                console.error('Form submission error:', error);
                formStatus.className = 'alert alert-danger show';
                formStatus.textContent = error.message || 'Oops! Network error. Please try again.';
            } finally {
                // Hide loading state
                submitButton.disabled = false;
                if(spinner) spinner.classList.add('d-none');
                 // Auto-dismiss status messages after a delay for better UX
                setTimeout(() => {
                    // Check if the alert still exists and has the 'show' class
                    if (formStatus.classList.contains('show')) {
                        const currentAlert = bootstrap.Alert.getInstance(formStatus);
                        if (currentAlert) {
                            currentAlert.close(); // Use Bootstrap's close method if available
                        } else {
                            // Fallback if instance not found (might happen if closed manually)
                            formStatus.classList.remove('show');
                             formStatus.textContent = ''; // Clear text as well
                             formStatus.className = ''; // Clear classes
                        }
                    }
                 }, 7000); // 7 seconds
            }
        });
    }


    // --- Back to Top Button ---
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

        // Smooth scroll to top when button clicked
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Listen for scroll events to show/hide button
        window.addEventListener('scroll', toggleBackToTopButton);

        // Initial check in case the page loads already scrolled down
        toggleBackToTopButton();
    }

}); // End DOMContentLoaded