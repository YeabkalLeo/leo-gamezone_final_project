// Main Application Controller
// Navigation handling
const pageRoutes = {
    'dashboard': renderDashboard,
    'games': renderGames,
    'sessions': renderSessions,
    'snacks': renderSnacks,
    'payments': renderPayments,
    'reports': renderPayments // Reuse payments for reports
};

// Load page based on hash
const loadPage = (page) => {
    const renderFn = pageRoutes[page];
    if (renderFn) {
        renderFn();
        updateActiveNav(page);
    } else {
        // Default to dashboard
        renderDashboard();
        updateActiveNav('dashboard');
    }
};

// Update active nav item
const updateActiveNav = (page) => {
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
};

// Debounce helper
const debounce = (fn, delay = 300) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};

// Handle navigation
document.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar a');
    if (link) {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
            window.location.hash = page;
            loadPage(page);
        }
    }
});

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        loadPage(hash);
    }
});

// Check auth and load initial page
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle for mobile
    const header = document.querySelector('.header');
    header?.addEventListener('click', (e) => {
        const toggle = e.target.closest('.menu-toggle');
        if (toggle) {
            document.getElementById('sidebar')?.classList.toggle('open');
        }
    });

    // Initialize
    if (isAuthenticated()) {
        initAuth();
    }
});

// Global error handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl + D for dashboard
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        loadPage('dashboard');
    }
    
    // Ctrl + G for games
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        loadPage('games');
    }
    
    // Ctrl + S for snacks
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        loadPage('snacks');
    }
});

console.log('🐱 Leo GameZone Management System v1.0');
console.log('📋 Loaded pages:', Object.keys(pageRoutes));
console.log('🛡️ Auth status:', isAuthenticated() ? 'Authenticated' : 'Not authenticated');