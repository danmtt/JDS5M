// === js/script.js ===
// Contains logic for BOTH the index page menu AND the content page hotspots.
// Uses checks to only run relevant code based on elements present on the page.
// Includes conditional logic for touch vs. non-touch devices for hotspots.

document.addEventListener('DOMContentLoaded', () => {

    // --- Device Detection ---
    // Check for touch capabilities (more reliable than user agent)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // --- Section 1: Index Page Menu Logic ---
    const mainButtons = document.querySelectorAll('.main-option-button');
    const allSubmenus = document.querySelectorAll('.submenu-content');
    const navContainer = document.querySelector('.nav-container');

    if (mainButtons.length > 0 && allSubmenus.length > 0) {
        mainButtons.forEach(button => {
            button.addEventListener('click', () => {
                const submenu = button.nextElementSibling;
                if (submenu && submenu.classList.contains('submenu-content')) {
                    const isOpening = submenu.style.display !== 'block';
                    allSubmenus.forEach(sm => {
                        sm.style.display = 'none';
                        const correspondingButton = sm.previousElementSibling;
                        if (correspondingButton && correspondingButton.tagName === 'BUTTON') {
                            correspondingButton.setAttribute('aria-expanded', 'false');
                        }
                    });
                    if (isOpening) {
                        submenu.style.display = 'block';
                        button.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        });
        if (navContainer) {
             document.addEventListener('click', (event) => {
                 if (!navContainer.contains(event.target)) {
                     allSubmenus.forEach(sm => {
                          sm.style.display = 'none';
                          const correspondingButton = sm.previousElementSibling;
                          if (correspondingButton && correspondingButton.tagName === 'BUTTON') {
                             correspondingButton.setAttribute('aria-expanded', 'false');
                          }
                     });
                 }
             });
        }
    } // End of Menu Logic check


    // --- Section 2: Content Page Hotspot/Tooltip Logic ---
    const allHotspots = document.querySelectorAll('.hotspot');
    const questionTooltip = document.getElementById('question-tooltip');
    const answerTooltip = document.getElementById('answer-tooltip');

    if (allHotspots.length > 0 && questionTooltip && answerTooltip) {

        function hideTooltips() {
            questionTooltip.classList.remove('visible');
            answerTooltip.classList.remove('visible');
             // Also reset any 'showing-question' state from hotspots
            allHotspots.forEach(hs => hs.removeAttribute('data-showing'));
        }

        function positionTooltip(tooltip, hotspotElement) {
            // ... (Positioning function remains the same as before) ...
            const hotspotRect = hotspotElement.getBoundingClientRect();
            const originalDisplay = tooltip.style.display;
            tooltip.style.visibility = 'hidden';
            tooltip.style.display = 'block';
            const tooltipHeight = tooltip.offsetHeight;
            const tooltipWidth = tooltip.offsetWidth;
            tooltip.style.display = originalDisplay;
            tooltip.style.visibility = 'visible';
            let tooltipTop = hotspotRect.top - tooltipHeight - 10;
            let tooltipLeft = hotspotRect.left + (hotspotRect.width / 2) - (tooltipWidth / 2);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            if (tooltipTop < 5) { tooltipTop = hotspotRect.bottom + 10; }
            if (tooltipTop + tooltipHeight > viewportHeight - 5) { tooltipTop = hotspotRect.top - tooltipHeight - 10; if (tooltipTop < 5) tooltipTop = 5; }
            if (tooltipLeft < 5) { tooltipLeft = 5; }
            if (tooltipLeft + tooltipWidth > viewportWidth - 5) { tooltipLeft = viewportWidth - tooltipWidth - 5; }
            tooltip.style.top = `${tooltipTop}px`;
            tooltip.style.left = `${tooltipLeft}px`;
        }

        allHotspots.forEach(hotspot => {
            const questionText = hotspot.dataset.question;
            const answerText = hotspot.dataset.answer;

            if (!questionText || !answerText) {
                console.warn(`Hotspot missing data-question or data-answer attribute:`, hotspot);
                return;
            }

            // --- Desktop Hover Logic ---
            if (!isTouchDevice) {
                hotspot.addEventListener('mouseover', () => {
                    // Only show question if answer isn't showing
                    if (!answerTooltip.classList.contains('visible')) {
                        // Check if another question is showing - hide it first
                        if (questionTooltip.classList.contains('visible') && !hotspot.hasAttribute('data-showing')) {
                             hideTooltips();
                        }
                        questionTooltip.textContent = questionText;
                        positionTooltip(questionTooltip, hotspot);
                        questionTooltip.classList.add('visible');
                        hotspot.setAttribute('data-showing', 'question'); // Mark for clarity, though not strictly needed for hover logic
                    }
                });

                hotspot.addEventListener('mouseout', () => {
                    // Hide question only if answer isn't visible
                    if (!answerTooltip.classList.contains('visible')) {
                        questionTooltip.classList.remove('visible');
                        hotspot.removeAttribute('data-showing');
                    }
                });
            } // End Non-Touch Device Hover Logic

            // --- Click Logic (Handles BOTH Desktop and Mobile) ---
            hotspot.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent triggering outside click listener immediately

                const isQuestionShowing = hotspot.getAttribute('data-showing') === 'question';

                if (isTouchDevice) {
                    // --- Mobile/Touch Logic ---
                    if (!isQuestionShowing) {
                        // First tap: Show Question
                        hideTooltips(); // Hide any other open tooltips/reset states
                        questionTooltip.textContent = questionText;
                        positionTooltip(questionTooltip, hotspot);
                        questionTooltip.classList.add('visible');
                        hotspot.setAttribute('data-showing', 'question'); // Set state: question is showing
                    } else {
                        // Second tap: Show Answer
                        hideTooltips(); // Hides question, resets state
                        answerTooltip.textContent = answerText;
                        positionTooltip(answerTooltip, hotspot);
                        answerTooltip.classList.add('visible');
                        // State is implicitly reset by hideTooltips()
                    }

                } else {
                    // --- Desktop Logic ---
                    // Click always shows answer, hide question if it was visible from hover
                    hideTooltips(); // Hides question, resets state
                    answerTooltip.textContent = answerText;
                    positionTooltip(answerTooltip, hotspot);
                    answerTooltip.classList.add('visible');
                }
            }); // End Click Listener

        }); // End forEach Hotspot

        // Global listener to hide tooltips when clicking outside hotspots
        // This also helps reset the mobile state if user taps away
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.hotspot')) {
                hideTooltips(); // Will remove data-showing attribute too
            }
        });

        // Scroll listener remains the same
        window.addEventListener('scroll', hideTooltips, { passive: true, capture: true });

    } // End of Hotspot/Tooltip Logic check


    // --- Section 3: Back To Top Button Logic ---
    const backToTopButton = document.getElementById("backToTopBtn");
    if (backToTopButton) {
        const scrollThreshold = 200;
        const toggleBackToTopButton = () => {
            if (window.scrollY > scrollThreshold) { backToTopButton.classList.add('visible'); }
            else { backToTopButton.classList.remove('visible'); }
        };
        window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleBackToTopButton(); // Initial check
    } // End of Back To Top Button check

    // --- Section 4: Collapsible Lesson Content Logic (Single Open Accordion) ---
    const collapsibleSections = document.querySelectorAll('.collapsible-section'); // Get all sections

    // Function to close ALL sections except the one specified (optional)
    const closeAllSections = (exceptSection = null) => {
        collapsibleSections.forEach(section => {
            if (section !== exceptSection) {
                const content = section.querySelector('.collapsible-content');
                const button = section.querySelector('.toggle-button');
                const arrow = button?.querySelector('.arrow'); // Use optional chaining

                if (content && button && arrow && button.getAttribute('data-state') === 'open') {
                    content.style.display = 'none';
                    button.setAttribute('data-state', 'closed');
                    button.setAttribute('aria-expanded', 'false');
                    arrow.textContent = '▶'; // Right arrow
                }
            }
        });
    };

    // Function to handle toggling for a specific section
    const toggleSingleCollapsible = (sectionToToggle) => {
        if (!sectionToToggle) return;

        const content = sectionToToggle.querySelector('.collapsible-content');
        const button = sectionToToggle.querySelector('.toggle-button');
        const arrow = button?.querySelector('.arrow');

        if (!content || !button || !arrow) return;

        const currentState = button.getAttribute('data-state');

        if (currentState === 'closed') {
            // --- It's closed, so we want to OPEN it ---
            // 1. Close all OTHER sections first
            closeAllSections(sectionToToggle);

            // 2. Open the target section
            content.style.display = 'block';
            button.setAttribute('data-state', 'open');
            button.setAttribute('aria-expanded', 'true');
            arrow.textContent = '▼'; // Down arrow

        } else {
            // --- It's open, so we want to CLOSE it ---
            // (No need to close others, just close this one)
            content.style.display = 'none';
            button.setAttribute('data-state', 'closed');
            button.setAttribute('aria-expanded', 'false');
            arrow.textContent = '▶'; // Right arrow
        }
    };

    // Add click listener to each HEADER (acting as the main trigger)
    collapsibleSections.forEach(section => {
         const header = section.querySelector('.collapsible-header');
         const button = section.querySelector('.toggle-button');

         if (header) {
            header.addEventListener('click', () => {
                toggleSingleCollapsible(section);
            });
         }
         // Also allow clicking the button directly, but prevent double toggling
         if(button) {
            button.addEventListener('click', (event) => {
                 event.stopPropagation(); // Stop click from bubbling to header if header also has listener
                 toggleSingleCollapsible(section);
            });
         }
    });

    // --- End Collapsible Lesson Content Logic ---

}); // End of DOMContentLoaded listener