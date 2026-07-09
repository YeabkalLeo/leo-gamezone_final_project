// Sessions page
const renderSessions = async () => {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header flex-between">
            <h1><i class="fas fa-clock"></i> Game Sessions</h1>
            <div class="flex gap-10">
                <button class="btn btn-primary" onclick="showCreateSessionModal()">
                    <i class="fas fa-plus"></i> New Session
                </button>
                <button class="btn btn-info" onclick="showActiveSessions()">
                    <i class="fas fa-play"></i> Active Sessions
                </button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="flex gap-10">
                    <input type="date" id="sessionDateFilter" class="form-control">
                    <button class="btn btn-primary btn-sm" onclick="filterSessionsByDate()">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="loadSessions()">
                        <i class="fas fa-sync"></i> Reset
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Game</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="sessionsTableBody">
                        <tr><td colspan="7" class="text-center">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await loadSessions();
    document.getElementById('sessionDateFilter').value = new Date().toISOString().split('T')[0];
};

const loadSessions = async () => {
    try {
        const result = await sessionAPI.getAll();
        renderSessionsTable(result.sessions || []);
    } catch (error) {
        showToast('Failed to load sessions: ' + error.message, 'error');
        document.getElementById('sessionsTableBody').innerHTML = `
            <tr><td colspan="7" class="text-center">Failed to load sessions</td></tr>
        `;
    }
};

const renderSessionsTable = (sessions) => {
    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No sessions found</td></tr>`;
        return;
    }

    tbody.innerHTML = sessions.map(session => `
        <tr>
            <td><strong>${session.customer_name}</strong></td>
            <td>${session.game_name || 'N/A'}</td>
            <td>${new Date(session.start_time).toLocaleString()}</td>
            <td>${session.end_time ? new Date(session.end_time).toLocaleString() : '-'}</td>
            <td>$${parseFloat(session.total_amount || 0).toFixed(2)}</td>
            <td>
                <span class="badge ${getSessionStatusBadge(session.status)}">
                    ${session.status}
                </span>
            </td>
            <td>
                ${session.status === 'active' ? `
                    <button class="btn btn-success btn-sm" onclick="showEndSessionModal('${session.id}')">
                        <i class="fas fa-stop"></i>
                    </button>
                ` : ''}
                ${session.status !== 'paid' && session.status !== 'completed' ? `
                    <button class="btn btn-primary btn-sm" onclick="showPaymentModal('${session.id}')">
                        <i class="fas fa-money-bill"></i>
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteSession('${session.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

const getSessionStatusBadge = (status) => {
    switch(status) {
        case 'active': return 'badge-success';
        case 'completed': return 'badge-info';
        case 'paid': return 'badge-primary';
        case 'cancelled': return 'badge-danger';
        default: return 'badge-secondary';
    }
};

const filterSessionsByDate = () => {
    const date = document.getElementById('sessionDateFilter').value;
    if (!date) return;
    
    const rows = document.querySelectorAll('#sessionsTableBody tr');
    rows.forEach(row => {
        const text = row.textContent;
        if (text.includes(date)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

const showActiveSessions = () => {
    const rows = document.querySelectorAll('#sessionsTableBody tr');
    rows.forEach(row => {
        const text = row.textContent;
        if (text.includes('active')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    showToast('Showing active sessions only', 'info');
};

const showCreateSessionModal = async () => {
    try {
        const [gamesResult, usersResult] = await Promise.all([
            gameAPI.getAvailable(),
            authAPI.getUsers()
        ]);

        const games = gamesResult.games || [];
        const users = usersResult.users || [];

        showModal(`
            <h2>New Game Session</h2>
            <form id="createSessionForm" onsubmit="createSession(event)">
                <div class="form-group">
                    <label for="sessionCustomer">Customer Name *</label>
                    <input type="text" id="sessionCustomer" required>
                </div>
                <div class="form-group">
                    <label for="sessionGame">Game *</label>
                    <select id="sessionGame" required>
                        <option value="">Select a game</option>
                        ${games.map(g => `
                            <option value="${g.id}">${g.name} - $${parseFloat(g.price_per_hour).toFixed(2)}/hr</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="sessionStaff">Staff</label>
                    <select id="sessionStaff">
                        <option value="">Select staff (optional)</option>
                        ${users.map(u => `
                            <option value="${u.id}">${u.full_name || u.username}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sessionStart">Start Time *</label>
                        <input type="datetime-local" id="sessionStart" required>
                    </div>
                    <div class="form-group">
                        <label for="sessionEnd">End Time</label>
                        <input type="datetime-local" id="sessionEnd">
                    </div>
                </div>
                <div class="flex gap-10 mt-20">
                    <button type="submit" class="btn btn-primary">Start Session</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('sessionStart').value = new Date().toISOString().slice(0, 16);
    } catch (error) {
        showToast('Failed to load data: ' + error.message, 'error');
    }
};

const createSession = async (e) => {
    e.preventDefault();
    const data = {
        customerName: document.getElementById('sessionCustomer').value,
        gameId: document.getElementById('sessionGame').value,
        userId: document.getElementById('sessionStaff').value || null,
        startTime: document.getElementById('sessionStart').value,
        endTime: document.getElementById('sessionEnd').value || null,
        status: 'active'
    };

    if (!data.gameId) {
        showToast('Please select a game', 'error');
        return;
    }

    try {
        const result = await sessionAPI.create(data);
        if (result.success) {
            showToast('Session started successfully!', 'success');
            closeModal();
            loadSessions();
        }
    } catch (error) {
        showToast('Failed to create session: ' + error.message, 'error');
    }
};

const showEndSessionModal = (id) => {
    showModal(`
        <h2>End Session</h2>
        <form id="endSessionForm" onsubmit="endSession(event, '${id}')">
            <div class="form-group">
                <label for="endTime">End Time *</label>
                <input type="datetime-local" id="endTime" required>
            </div>
            <div class="form-group">
                <label for="totalAmount">Total Amount ($) *</label>
                <input type="number" id="totalAmount" step="0.01" min="0" required>
            </div>
            <div class="flex gap-10 mt-20">
                <button type="submit" class="btn btn-success">End Session</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
    document.getElementById('endTime').value = new Date().toISOString().slice(0, 16);
};

const endSession = async (e, id) => {
    e.preventDefault();
    const data = {
        endTime: document.getElementById('endTime').value,
        totalAmount: parseFloat(document.getElementById('totalAmount').value)
    };

    if (data.totalAmount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }

    try {
        const result = await sessionAPI.end(id, data);
        if (result.success) {
            showToast('Session ended successfully!', 'success');
            closeModal();
            loadSessions();
        }
    } catch (error) {
        showToast('Failed to end session: ' + error.message, 'error');
    }
};

const showPaymentModal = (sessionId) => {
    showModal(`
        <h2>Record Payment</h2>
        <form id="paymentForm" onsubmit="recordPayment(event, '${sessionId}')">
            <div class="form-group">
                <label for="paymentAmount">Amount ($) *</label>
                <input type="number" id="paymentAmount" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label for="paymentMethod">Payment Method *</label>
                <select id="paymentMethod" required>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="wallet">Wallet</option>
                </select>
            </div>
            <div class="flex gap-10 mt-20">
                <button type="submit" class="btn btn-success">Record Payment</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
};

const recordPayment = async (e, sessionId) => {
    e.preventDefault();
    const data = {
        sessionId: sessionId,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        status: 'completed'
    };

    if (data.amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }

    try {
        const result = await paymentAPI.create(data);
        if (result.success) {
            showToast('Payment recorded successfully!', 'success');
            closeModal();
            loadSessions();
        }
    } catch (error) {
        showToast('Failed to record payment: ' + error.message, 'error');
    }
};

const deleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
        const result = await sessionAPI.delete(id);
        if (result.success) {
            showToast('Session deleted successfully!', 'success');
            loadSessions();
        }
    } catch (error) {
        showToast('Failed to delete session: ' + error.message, 'error');
    }
};