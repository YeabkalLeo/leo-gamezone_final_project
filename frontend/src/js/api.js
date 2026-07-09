// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// API request helper
const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                handleUnauthorized();
            }
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Handle unauthorized access
const handleUnauthorized = () => {
    removeToken();
    window.location.href = '#login';
    showToast('Session expired. Please log in again.', 'error');
};

// Auth API calls
const authAPI = {
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    register: (userData) => apiRequest('/auth/register', 'POST', userData),
    logout: () => apiRequest('/auth/logout', 'POST'),
    getProfile: () => apiRequest('/auth/profile'),
    getUsers: () => apiRequest('/auth/users'),
    updateUserRole: (userId, role) => apiRequest(`/auth/users/${userId}/role`, 'PUT', { role })
};

// Snack API calls
const snackAPI = {
    getAll: () => apiRequest('/snacks'),
    getById: (id) => apiRequest(`/snacks/${id}`),
    create: (data) => apiRequest('/snacks', 'POST', data),
    update: (id, data) => apiRequest(`/snacks/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/snacks/${id}`, 'DELETE'),
    updateQuantity: (id, quantity) => apiRequest(`/snacks/${id}/quantity`, 'PATCH', { quantity }),
    getLowStock: (threshold = 10) => apiRequest(`/snacks/low-stock?threshold=${threshold}`),
    search: (query) => apiRequest(`/snacks/search?query=${encodeURIComponent(query)}`)
};

// Game API calls
const gameAPI = {
    getAll: () => apiRequest('/games'),
    getAvailable: () => apiRequest('/games/available'),
    getById: (id) => apiRequest(`/games/${id}`),
    create: (data) => apiRequest('/games', 'POST', data),
    update: (id, data) => apiRequest(`/games/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/games/${id}`, 'DELETE'),
    updateStatus: (id, status) => apiRequest(`/games/${id}/status`, 'PATCH', { status }),
    search: (query) => apiRequest(`/games/search?query=${encodeURIComponent(query)}`),
    getByType: (type) => apiRequest(`/games/type/${type}`)
};

// Session API calls
const sessionAPI = {
    getAll: () => apiRequest('/sessions'),
    getActive: () => apiRequest('/sessions/active'),
    getStats: () => apiRequest('/sessions/stats'),
    getById: (id) => apiRequest(`/sessions/${id}`),
    create: (data) => apiRequest('/sessions', 'POST', data),
    update: (id, data) => apiRequest(`/sessions/${id}`, 'PUT', data),
    end: (id, data) => apiRequest(`/sessions/${id}/end`, 'POST', data),
    delete: (id) => apiRequest(`/sessions/${id}`, 'DELETE'),
    getByDate: (date) => apiRequest(`/sessions/date/${date}`),
    getByGame: (gameId) => apiRequest(`/sessions/game/${gameId}`)
};

// Payment API calls
const paymentAPI = {
    getAll: () => apiRequest('/payments'),
    getById: (id) => apiRequest(`/payments/${id}`),
    getBySession: (sessionId) => apiRequest(`/payments/session/${sessionId}`),
    create: (data) => apiRequest('/payments', 'POST', data),
    updateStatus: (id, status) => apiRequest(`/payments/${id}/status`, 'PATCH', { status }),
    getDailyReport: (date) => apiRequest(`/payments/daily-report?date=${date}`),
    getMonthlyReport: (year, month) => apiRequest(`/payments/monthly-report?year=${year}&month=${month}`),
    getRevenueStats: (startDate, endDate) => apiRequest(`/payments/revenue-stats?startDate=${startDate}&endDate=${endDate}`)
};

// Toast notification helper
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Modal helper
const showModal = (content) => {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = content;
    modal.style.display = 'block';
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

// Close modal on click outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on X click
document.querySelector('.close-modal')?.addEventListener('click', closeModal);
