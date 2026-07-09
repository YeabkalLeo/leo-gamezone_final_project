const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    static async create(userData) {
        const { username, email, password, role = 'staff', fullName } = userData;
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (id, username, email, password_hash, role, full_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(query, [userId, username, email, hashedPassword, role, fullName]);
        return userId;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, full_name, created_at, last_login FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    static async updateLastLogin(id) {
        await db.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [id]
        );
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async getAll() {
        const [rows] = await db.execute(
            'SELECT id, username, email, role, full_name, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    static async updateRole(id, role) {
        await db.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );
    }
}

module.exports = User;
