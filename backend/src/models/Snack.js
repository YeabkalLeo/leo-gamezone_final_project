const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Snack {
    static async create(snackData) {
        const { name, description, price, quantity, category, supplier } = snackData;
        const snackId = uuidv4();

        const query = `
            INSERT INTO snacks (id, name, description, price, quantity, category, supplier, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(query, [snackId, name, description, price, quantity, category, supplier]);
        return snackId;
    }

    static async getAll() {
        const [rows] = await db.execute(
            'SELECT * FROM snacks ORDER BY name ASC'
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM snacks WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, snackData) {
        const fields = [];
        const values = [];

        if (snackData.name) {
            fields.push('name = ?');
            values.push(snackData.name);
        }
        if (snackData.description) {
            fields.push('description = ?');
            values.push(snackData.description);
        }
        if (snackData.price !== undefined) {
            fields.push('price = ?');
            values.push(snackData.price);
        }
        if (snackData.quantity !== undefined) {
            fields.push('quantity = ?');
            values.push(snackData.quantity);
        }
        if (snackData.category) {
            fields.push('category = ?');
            values.push(snackData.category);
        }
        if (snackData.supplier) {
            fields.push('supplier = ?');
            values.push(snackData.supplier);
        }

        if (fields.length === 0) return;

        values.push(id);
        const query = `UPDATE snacks SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await db.execute(query, values);
    }

    static async updateQuantity(id, newQuantity) {
        await db.execute(
            'UPDATE snacks SET quantity = ?, updated_at = NOW() WHERE id = ?',
            [newQuantity, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM snacks WHERE id = ?', [id]);
    }

    static async getLowStock(threshold = 10) {
        const [rows] = await db.execute(
            'SELECT * FROM snacks WHERE quantity <= ? ORDER BY quantity ASC',
            [threshold]
        );
        return rows;
    }

    static async search(query) {
        const searchTerm = `%${query}%`;
        const [rows] = await db.execute(
            'SELECT * FROM snacks WHERE name LIKE ? OR description LIKE ? OR category LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        return rows;
    }
}

module.exports = Snack;
