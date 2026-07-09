  const mysql = require('mysql2');
const dotenv = require('dotenv');
const logger = require('../middleware/logger');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

// Test connection
(async () => {
    try {
        const connection = await db.getConnection();
        logger.info('Database connected successfully');
        connection.release();
    } catch (error) {
        logger.error('Database connection failed:', error.message);
        process.exit(1);
    }
})();

module.exports = db;
