
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function setupSortOrder() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Add column if it doesn't exist
        try {
            await pool.query("ALTER TABLE groups ADD COLUMN sort_order INT DEFAULT 999");
            console.log("Added sort_order column.");
        } catch (e) {
            console.log("Column likely exists (" + e.code + ")");
        }

        // 2. Reset everything to 999
        await pool.query("UPDATE groups SET sort_order = 999");

        // 3. Set specific orders based on current data
        // We know user wants English at 2.
        await pool.query("UPDATE groups SET sort_order = 2 WHERE name LIKE '%English%'");

        // 4. Try to infer others? 
        // "2:30PM" starts with 2. 
        // "5:00PM" starts with 5.
        // Maybe we set sort_order = 1 for the 2:30PM batch?
        await pool.query("UPDATE groups SET sort_order = 1 WHERE name LIKE '2:30%'");

        // The rest can stay 999 (sorted alphabetically after these 2) OR we can be smarter.

        console.log("Updated sort orders.");

    } catch (error) {
        console.log("Error: " + error.message);
    } finally {
        await pool.end();
    }
}

setupSortOrder();
