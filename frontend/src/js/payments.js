// Payments page
const renderPayments = async () => {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header flex-between">
            <h1><i class="fas fa-money-bill-wave"></i> Payments</h1>
            <div class="flex gap-10">
                <button class="btn btn-info" onclick="showDailyReport()">
                    <i class="fas fa-calendar-day"></i> Daily Report
                </button>
                <button class="btn btn-info" onclick="showMonthlyReport()">
                    <i class="fas fa-calendar-month"></i> Monthly Report
                </button>
            </div>
        </div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Session</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="paymentsTableBody">
                        <tr><td colspan="7" class="text-center">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await loadPayments();
};

const loadPayments = async () => {
    try {
        const result = await paymentAPI.getAll();
        renderPaymentsTable(result.payments || []);
    } catch (error) {
        showToast('Failed to load payments: ' + error.message, 'error');
        document.getElementById('paymentsTableBody').innerHTML = `
            <tr><td colspan="7" class="text-center">Failed to load payments</td></tr>
        `;
    }
};

const renderPaymentsTable = (payments) => {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No payments found</td></tr>`;
        return;
    }

    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.session_id?.slice(0, 8) || 'N/A'}</td>
            <td>${payment.customer_name || 'N/A'}</td>
            <td><strong>$${parseFloat(payment.amount).toFixed(2)}</strong></td>
            <td><span class="badge badge-info">${payment.payment_method}</span></td>
            <td>${new Date(payment.payment_date).toLocaleString()}</td>
            <td>
                <span class="badge ${getPaymentStatusBadge(payment.status)}">
                    ${payment.status}
                </span>
            </td>
            <td>
                ${payment.status !== 'completed' && payment.status !== 'refunded' ? `
                    <button class="btn btn-success btn-sm" onclick="updatePaymentStatus('${payment.id}', 'completed')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="updatePaymentStatus('${payment.id}', 'failed')">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                ${payment.status === 'completed' ? `
                    <button class="btn btn-warning btn-sm" onclick="updatePaymentStatus('${payment.id}', 'refunded')">
                        <i class="fas fa-undo"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
};

const getPaymentStatusBadge = (status) => {
    switch(status) {
        case 'completed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'failed': return 'badge-danger';
        case 'refunded': return 'badge-info';
        default: return 'badge-secondary';
    }
};

const updatePaymentStatus = async (id, status) => {
    if (!confirm(`Mark this payment as ${status}?`)) return;
    
    try {
        const result = await paymentAPI.updateStatus(id, status);
        if (result.success) {
            showToast(`Payment status updated to ${status}`, 'success');
            loadPayments();
        }
    } catch (error) {
        showToast('Failed to update payment: ' + error.message, 'error');
    }
};

const showDailyReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const result = await paymentAPI.getDailyReport(today);
        const report = result.report || [];

        // Group by payment method
        const methods = {};
        report.forEach(r => {
            if (r.payment_method) {
                if (!methods[r.payment_method]) {
                    methods[r.payment_method] = { count: 0, total: 0 };
                }
                methods[r.payment_method].count += r.method_count || 0;
                methods[r.payment_method].total += parseFloat(r.method_total || 0);
            }
        });

        const totalCount = report.find(r => !r.payment_method)?.total_payments || 0;
        const totalAmount = report.find(r => !r.payment_method)?.total_amount || 0;

        showModal(`
            <h2>Daily Report - ${today}</h2>
            <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="stat-card">
                    <div class="stat-number">${totalCount}</div>
                    <div class="stat-label">Total Payments</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${parseFloat(totalAmount).toFixed(2)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>
            <h3>By Payment Method</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Method</th>
                            <th>Count</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(methods).map(([method, data]) => `
                            <tr>
                                <td><span class="badge badge-info">${method}</span></td>
                                <td>${data.count}</td>
                                <td>$${data.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        ${Object.keys(methods).length === 0 ? `
                            <tr><td colspan="3" class="text-center">No payments today</td></tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
            <div class="mt-20">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        `);
    } catch (error) {
        showToast('Failed to load report: ' + error.message, 'error');
    }
};

const showMonthlyReport = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    showModal(`
        <h2>Monthly Report</h2>
        <form id="monthlyReportForm" onsubmit="loadMonthlyReport(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="reportYear">Year</label>
                    <input type="number" id="reportYear" value="${year}" min="2020" max="2030">
                </div>
                <div class="form-group">
                    <label for="reportMonth">Month</label>
                    <input type="number" id="reportMonth" value="${month}" min="1" max="12">
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Load Report</button>
        </form>
        <div id="monthlyReportContent" class="mt-20"></div>
    `);
};

const loadMonthlyReport = async (e) => {
    e.preventDefault();
    const year = document.getElementById('reportYear').value;
    const month = document.getElementById('reportMonth').value;

    try {
        const result = await paymentAPI.getMonthlyReport(year, month);
        const report = result.report || [];

        // Group by date
        const dailyData = {};
        report.forEach(r => {
            if (r.date) {
                if (!dailyData[r.date]) {
                    dailyData[r.date] = { count: 0, total: 0 };
                }
                dailyData[r.date].count += r.total_payments || 0;
                dailyData[r.date].total += parseFloat(r.total_amount || 0);
            }
        });

        const container = document.getElementById('monthlyReportContent');
        if (Object.keys(dailyData).length === 0) {
            container.innerHTML = `<p class="text-center">No data for this month</p>`;
            return;
        }

        container.innerHTML = `
            <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="stat-card">
                    <div class="stat-number">${Object.values(dailyData).reduce((sum, d) => sum + d.count, 0)}</div>
                    <div class="stat-label">Total Payments</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${Object.values(dailyData).reduce((sum, d) => sum + d.total, 0).toFixed(2)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payments</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(dailyData).sort((a, b) => b[0].localeCompare(a[0])).map(([date, data]) => `
                            <tr>
                                <td>${date}</td>
                                <td>${data.count}</td>
                                <td>$${data.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        showToast('Failed to load monthly report: ' + error.message, 'error');
    }
};