
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Try loading from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function listGroups() {
    console.log("DB_HOST:", process.env.DB_HOST);

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SELECT id, name, sort_order FROM groups ORDER BY id ASC");
        console.log("Groups:", JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Full Error:', error);
        console.error('Message:', error.message);
    } finally {
        await pool.end();
    }
}

listGroups();
