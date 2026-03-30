const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function resetDatabase() {
    try {
        console.log("Connecting to database...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // List of tables to clear
        const tables = ['students', 'groups', 'reviews', 'messages'];

        console.log("Clearing data...");

        // Disable foreign key checks to allow truncation
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const table of tables) {
            try {
                // Check if table exists first (optional, but safe)
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    await connection.execute(`TRUNCATE TABLE ${table}`);
                    console.log(`✅ Cleared table: ${table}`);
                } else {
                    console.log(`⚠️ Table not found: ${table}`);
                }
            } catch (err) {
                console.error(`❌ Failed to clear ${table}:`, err.message);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("\nDatabase reset complete! You can now start adding fresh data.");
        await connection.end();
    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

resetDatabase();
