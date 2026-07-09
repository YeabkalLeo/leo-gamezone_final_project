const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Game {
    static async create(gameData) {
        const { name, description, type, pricePerHour, maxPlayers, status = 'available' } = gameData;
        const gameId = uuidv4();

        const query = `
            INSERT INTO games (id, name, description, type, price_per_hour, max_players, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(query, [gameId, name, description, type, pricePerHour, maxPlayers, status]);
        return gameId;
    }

    static async getAll() {
        const [rows] = await db.execute(
            'SELECT * FROM games ORDER BY name ASC'
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM games WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, gameData) {
        const fields = [];
        const values = [];

        if (gameData.name) {
            fields.push('name = ?');
            values.push(gameData.name);
        }
        if (gameData.description) {
            fields.push('description = ?');
            values.push(gameData.description);
        }
        if (gameData.type) {
            fields.push('type = ?');
            values.push(gameData.type);
        }
        if (gameData.pricePerHour !== undefined) {
            fields.push('price_per_hour = ?');
            values.push(gameData.pricePerHour);
        }
        if (gameData.maxPlayers !== undefined) {
            fields.push('max_players = ?');
            values.push(gameData.maxPlayers);
        }
        if (gameData.status) {
            fields.push('status = ?');
            values.push(gameData.status);
        }

        if (fields.length === 0) return;

        values.push(id);
        const query = `UPDATE games SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await db.execute(query, values);
    }

    static async updateStatus(id, status) {
        await db.execute(
            'UPDATE games SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM games WHERE id = ?', [id]);
    }

    static async getAvailable() {
        const [rows] = await db.execute(
            'SELECT * FROM games WHERE status = "available" ORDER BY name ASC'
        );
        return rows;
    }

    static async search(query) {
        const searchTerm = `%${query}%`;
        const [rows] = await db.execute(
            'SELECT * FROM games WHERE name LIKE ? OR description LIKE ? OR type LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        return rows;
    }

    static async getByType(type) {
        const [rows] = await db.execute(
            'SELECT * FROM games WHERE type = ? ORDER BY name ASC',
            [type]
        );
        return rows;
    }
}

module.exports = Game;
