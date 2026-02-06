/**
 * Screen management - showing/hiding game screens with animations.
 */

let elements = {};

export function setElements(els) {
    elements = els;
}

export function getElements() {
    return elements;
}

export function hideAllScreens() {
    elements.sideSelection.style.display = 'none';
    elements.sideIntroduction.style.display = 'none';
    elements.battleBriefing.style.display = 'none';
    elements.gameScreen.style.display = 'none';
    elements.battleResultsModal.style.display = 'none';
    elements.campaignLogModal.style.display = 'none';
    elements.endGameSummary.style.display = 'none';
}

export function showScreen(screenElement) {
    hideAllScreens();
    screenElement.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showScreenWithAnimation(screenElement, animationType = 'fadeIn') {
    if (!screenElement) return;
    hideAllScreens();
    screenElement.style.display = 'block';
    screenElement.classList.add(`animate-${animationType}`);

    const animatableElements = screenElement.querySelectorAll(
        '.side-card, .choice-option, .summary-stat, .timeline-item'
    );
    animatableElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('animate-slide-in-left');
    });

    setTimeout(() => {
        screenElement.classList.remove(`animate-${animationType}`);
        animatableElements.forEach(el => {
            el.classList.remove('animate-slide-in-left');
            el.style.animationDelay = '';
        });
    }, 800);
}

export function toggleVisualMode(mode) {
    const { photoToggle, mapToggle, briefingImage, briefingMap } = elements;

    if (mode === 'photo') {
        photoToggle.classList.add('active');
        mapToggle.classList.remove('active');
        briefingMap.style.display = 'none';
        briefingImage.style.display = 'flex';
        briefingImage.classList.add('animate-scale-in');
    } else if (mode === 'map') {
        photoToggle.classList.remove('active');
        mapToggle.classList.add('active');
        briefingImage.style.display = 'none';
        briefingMap.style.display = 'flex';
        briefingMap.classList.add('animate-scale-in');
    }

    setTimeout(() => {
        briefingImage.classList.remove('animate-scale-in');
        briefingMap.classList.remove('animate-scale-in');
    }, 500);
}

/**
 * Focus trap for modals - keeps Tab cycling within the modal.
 */
export function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });

    firstFocusable?.focus();
}
