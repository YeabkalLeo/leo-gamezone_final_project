// Auth state management
let currentUser = null;

const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

const getUserInfo = () => {
    return currentUser;
};

const setUser = (user) => {
    currentUser = user;
    updateUI();
};

const updateUI = () => {
    const userInfo = document.getElementById('userInfo');
    if (currentUser) {
        userInfo.innerHTML = `
            <span class="avatar">
                <i class="fas fa-user"></i>
            </span>
            <span>${currentUser.fullName || currentUser.username}</span>
            <span class="badge badge-info">${currentUser.role}</span>
        `;
    }
};

// Login handler
const handleLogin = async (email, password) => {
    try {
        const result = await authAPI.login(email, password);
        if (result.success) {
            setToken(result.token);
            setUser(result.user);
            showToast('Login successful!', 'success');
            loadPage('dashboard');
            return true;
        }
        return false;
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
        return false;
    }
};

// Logout handler
const handleLogout = async () => {
    try {
        await authAPI.logout();
    } catch (error) {
        // Ignore logout errors
    }
    removeToken();
    currentUser = null;
    showToast('Logged out successfully', 'info');
    showLoginScreen();
};

// Show login screen
const showLoginScreen = () => {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <i class="fas fa-gamepad"></i>
                    <h2>Leo GameZone</h2>
                    <p>Management System</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await handleLogin(email, password);
    });
};

// Initialize auth
const initAuth = async () => {
    if (isAuthenticated()) {
        try {
            const result = await authAPI.getProfile();
            if (result.success) {
                setUser(result.user);
                loadPage('dashboard');
                return;
            }
        } catch (error) {
            // Token invalid
            removeToken();
        }
    }
    showLoginScreen();
};

// Check auth on page load
document.addEventListener('DOMContentLoaded', initAuth);

// Logout button handler
document.addEventListener('click', (e) => {
    if (e.target.closest('#logoutBtn')) {
        handleLogout();
    }
});