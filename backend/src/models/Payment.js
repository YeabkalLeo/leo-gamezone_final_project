const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
    static async create(paymentData) {
        const { sessionId, amount, paymentMethod, status = 'completed' } = paymentData;
        const paymentId = uuidv4();

        const query = `
            INSERT INTO payments (id, session_id, amount, payment_method, status, payment_date)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(query, [paymentId, sessionId, amount, paymentMethod, status]);
        return paymentId;
    }

    static async getAll() {
        const [rows] = await db.execute(`
            SELECT p.*, gs.customer_name, g.name as game_name, u.username as staff_name
            FROM payments p
            JOIN game_sessions gs ON p.session_id = gs.id
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            ORDER BY p.payment_date DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(`
            SELECT p.*, gs.customer_name, g.name as game_name, u.username as staff_name
            FROM payments p
            JOIN game_sessions gs ON p.session_id = gs.id
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async getBySession(sessionId) {
        const [rows] = await db.execute(
            'SELECT * FROM payments WHERE session_id = ? ORDER BY payment_date DESC',
            [sessionId]
        );
        return rows;
    }

    static async updateStatus(id, status) {
        await db.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status, id]
        );
    }

    static async getDailyReport(date) {
        const [rows] = await db.execute(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                payment_method,
                COUNT(*) as method_count,
                SUM(amount) as method_total
            FROM payments
            WHERE DATE(payment_date) = ?
            GROUP BY payment_method WITH ROLLUP
        `, [date]);
        return rows;
    }

    static async getMonthlyReport(year, month) {
        const [rows] = await db.execute(`
            SELECT 
                DATE(payment_date) as date,
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                payment_method,
                COUNT(*) as method_count,
                SUM(amount) as method_total
            FROM payments
            WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ?
            GROUP BY DATE(payment_date), payment_method WITH ROLLUP
            ORDER BY date DESC
        `, [year, month]);
        return rows;
    }

    static async getRevenueStats(startDate, endDate) {
        const [rows] = await db.execute(`
            SELECT 
                DATE(payment_date) as date,
                COUNT(*) as payments_count,
                SUM(amount) as total_revenue,
                AVG(amount) as avg_payment
            FROM payments
            WHERE payment_date BETWEEN ? AND ?
            GROUP BY DATE(payment_date)
            ORDER BY date DESC
        `, [startDate, endDate]);
        return rows;
    }
}

module.exports = Payment;
