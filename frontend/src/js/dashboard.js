// Dashboard page
const renderDashboard = async () => {
    const mainContent = document.getElementById('mainContent');
    
    // Show loading
    mainContent.innerHTML = `
        <div class="text-center" style="padding: 50px;">
            <div class="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    `;

    try {
        // Fetch all data
        const [sessions, payments, games, snacks, sessionStats] = await Promise.all([
            sessionAPI.getAll(),
            paymentAPI.getAll(),
            gameAPI.getAll(),
            snackAPI.getAll(),
            sessionAPI.getStats()
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessions.sessions?.filter(s => s.start_time?.startsWith(today)) || [];
        const todayRevenue = payments.payments?.filter(p => p.payment_date?.startsWith(today))
            .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const totalRevenue = payments.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const activeSessions = sessions.sessions?.filter(s => s.status === 'active') || [];

        mainContent.innerHTML = `
            <div class="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome back, ${currentUser?.fullName || currentUser?.username}!</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-gamepad"></i></div>
                    <div class="stat-number">${games.games?.length || 0}</div>
                    <div class="stat-label">Total Games</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-number">${todaySessions.length}</div>
                    <div class="stat-label">Today's Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="stat-number">$${todayRevenue.toFixed(2)}</div>
                    <div class="stat-label">Today's Revenue</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-utensils"></i></div>
                    <div class="stat-number">${snacks.snacks?.length || 0}</div>
                    <div class="stat-label">Total Snacks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-play"></i></div>
                    <div class="stat-number">${activeSessions.length}</div>
                    <div class="stat-label">Active Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-number">$${totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Active Sessions</h3>
                    <button class="btn btn-primary btn-sm" onclick="loadPage('sessions')">
                        View All
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Game</th>
                                <th>Started</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activeSessions.length === 0 ? `
                                <tr>
                                    <td colspan="4" class="text-center">No active sessions</td>
                                </tr>
                            ` : activeSessions.slice(0, 5).map(session => `
                                <tr>
                                    <td>${session.customer_name}</td>
                                    <td>${session.game_name || 'N/A'}</td>
                                    <td>${new Date(session.start_time).toLocaleString()}</td>
                                    <td><span class="badge badge-success">Active</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Low Stock Alerts</h3>
                    <button class="btn btn-primary btn-sm" onclick="loadPage('snacks')">
                        Manage Snacks
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Snack</th>
                                <th>Quantity</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(snacks.snacks?.filter(s => s.quantity <= 10) || []).length === 0 ? `
                                <tr>
                                    <td colspan="3" class="text-center">All snacks are well stocked</td>
                                </tr>
                            ` : (snacks.snacks?.filter(s => s.quantity <= 10) || []).slice(0, 5).map(snack => `
                                <tr>
                                    <td>${snack.name}</td>
                                    <td>${snack.quantity}</td>
                                    <td>
                                        <span class="badge ${snack.quantity === 0 ? 'badge-danger' : 'badge-warning'}">
                                            ${snack.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showToast('Failed to load dashboard: ' + error.message, 'error');
        mainContent.innerHTML = `
            <div class="card">
                <p class="text-center">Failed to load dashboard. Please try again.</p>
                <div class="text-center mt-10">
                    <button class="btn btn-primary" onclick="renderDashboard()">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
};