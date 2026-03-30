
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: 'd:/Alfunun Academy/.env' });

async function listGroups() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SELECT id, name, sort_order FROM groups ORDER BY id ASC");
        console.log("Groups:", rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

listGroups();
