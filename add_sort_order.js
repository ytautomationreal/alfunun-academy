
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: 'd:/Alfunun Academy/.env' });

async function addSortOrder() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Adding sort_order column...');

        // Add column if not exists
        try {
            await pool.query("ALTER TABLE groups ADD COLUMN sort_order INT DEFAULT 999");
            console.log("Column added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column already exists.");
            } else {
                throw e;
            }
        }

        // Set English Language to 2, others to default or some sequence if possible
        // The user wants "English" to be 2nd. 
        // We can just query all and log them, then maybe update English specifically.

        await pool.query("UPDATE groups SET sort_order = 2 WHERE name LIKE '%English%'");
        // Ensure others have correct order? 
        // Let's just set the first one (maybe the earliest batch?) to 1.
        // User said: "mera pehle aya ye dosra nmbr pa etc"
        // Without knowing their full desired order, I can't set everything perfectly.
        // But I can set English to 2.

        console.log("Updated English Language sort_order to 2.");

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

addSortOrder();
