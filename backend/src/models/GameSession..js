const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class GameSession {
    static async create(sessionData) {
        const { gameId, userId, customerName, startTime, endTime, totalAmount, status = 'active' } = sessionData;
        const sessionId = uuidv4();

        const query = `
            INSERT INTO game_sessions (id, game_id, user_id, customer_name, start_time, end_time, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(query, [sessionId, gameId, userId, customerName, startTime, endTime, totalAmount, status]);
        return sessionId;
    }

    static async getAll() {
        const [rows] = await db.execute(`
            SELECT gs.*, g.name as game_name, u.username as staff_name
            FROM game_sessions gs
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            ORDER BY gs.created_at DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(`
            SELECT gs.*, g.name as game_name, u.username as staff_name
            FROM game_sessions gs
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            WHERE gs.id = ?
        `, [id]);
        return rows[0];
    }

    static async update(id, sessionData) {
        const fields = [];
        const values = [];

        if (sessionData.customerName) {
            fields.push('customer_name = ?');
            values.push(sessionData.customerName);
        }
        if (sessionData.startTime) {
            fields.push('start_time = ?');
            values.push(sessionData.startTime);
        }
        if (sessionData.endTime) {
            fields.push('end_time = ?');
            values.push(sessionData.endTime);
        }
        if (sessionData.totalAmount !== undefined) {
            fields.push('total_amount = ?');
            values.push(sessionData.totalAmount);
        }
        if (sessionData.status) {
            fields.push('status = ?');
            values.push(sessionData.status);
        }

        if (fields.length === 0) return;

        values.push(id);
        const query = `UPDATE game_sessions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await db.execute(query, values);
    }

    static async updateStatus(id, status) {
        await db.execute(
            'UPDATE game_sessions SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
    }

    static async endSession(id, endTime, totalAmount) {
        await db.execute(
            'UPDATE game_sessions SET end_time = ?, total_amount = ?, status = "completed", updated_at = NOW() WHERE id = ?',
            [endTime, totalAmount, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM game_sessions WHERE id = ?', [id]);
    }

    static async getActiveSessions() {
        const [rows] = await db.execute(`
            SELECT gs.*, g.name as game_name, u.username as staff_name
            FROM game_sessions gs
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            WHERE gs.status = 'active'
            ORDER BY gs.start_time ASC
        `);
        return rows;
    }

    static async getByDate(date) {
        const [rows] = await db.execute(`
            SELECT gs.*, g.name as game_name, u.username as staff_name
            FROM game_sessions gs
            JOIN games g ON gs.game_id = g.id
            LEFT JOIN users u ON gs.user_id = u.id
            WHERE DATE(gs.start_time) = ?
            ORDER BY gs.start_time DESC
        `, [date]);
        return rows;
    }

    static async getByGame(gameId) {
        const [rows] = await db.execute(`
            SELECT gs.*, u.username as staff_name
            FROM game_sessions gs
            LEFT JOIN users u ON gs.user_id = u.id
            WHERE gs.game_id = ?
            ORDER BY gs.created_at DESC
        `, [gameId]);
        return rows;
    }

    static async getStats() {
        const [rows] = await db.execute(`
            SELECT 
                COUNT(*) as total_sessions,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_revenue,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_sessions,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END) as today_revenue
            FROM game_sessions
        `);
        return rows[0];
    }
}

module.exports = GameSession;
