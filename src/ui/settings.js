/**
 * Settings: theme, vocabulary sidebar, and translate integration.
 */

let settings = { vocabHelp: true };

export function getSettings() {
    return settings;
}

export function toggleSettingsMenu(elements) {
    const menu = elements.settingsMenu;
    const btn = elements.settingsBtn;
    const isOpen = menu.classList.contains('show');

    if (isOpen) {
        menu.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
    } else {
        menu.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
    }
}

export function toggleVocabularyHelp(elements) {
    settings.vocabHelp = !settings.vocabHelp;

    // Update menu status
    const vocabStatus = document.getElementById('vocabStatus');
    if (vocabStatus) {
        vocabStatus.textContent = settings.vocabHelp ? 'ON' : 'OFF';
        vocabStatus.classList.toggle('active', settings.vocabHelp);
    }

    // Update nav button
    if (elements.vocabToggleNav) {
        elements.vocabToggleNav.setAttribute('aria-pressed', settings.vocabHelp.toString());
        elements.vocabToggleNav.style.background = settings.vocabHelp ? 'var(--color-primary-alpha)' : '';
    }

    // Toggle sidebar
    const sidebar = document.getElementById('vocabSidebar');
    const overlay = document.getElementById('vocabOverlay');

    if (sidebar) {
        if (settings.vocabHelp) {
            document.body.classList.add('vocab-open');
            sidebar.style.display = 'block';
            sidebar.classList.add('show');
            if (overlay) overlay.classList.add('show');
            if (elements.settingsMenu) {
                elements.settingsMenu.classList.remove('show');
                elements.settingsBtn.setAttribute('aria-expanded', 'false');
            }
        } else {
            document.body.classList.remove('vocab-open');
            sidebar.classList.remove('show');
            if (overlay) overlay.classList.remove('show');
            setTimeout(() => {
                if (!settings.vocabHelp) sidebar.style.display = 'none';
            }, 300);
        }
    }

    updateVocabularyDisplay();
}

export function updateVocabularyDisplay() {
    const vocabTerms = document.querySelectorAll('.vocab-term');
    vocabTerms.forEach(term => {
        if (settings.vocabHelp) {
            term.style.borderBottom = '2px dotted #ffd700';
            term.style.cursor = 'help';
        } else {
            term.style.borderBottom = 'none';
            term.style.cursor = 'inherit';
        }
    });
}
