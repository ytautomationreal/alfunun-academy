const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'alfunun_academy',
    });

    try {
        console.log("Checking teachers table...");
        const [columns] = await connection.execute(`SHOW COLUMNS FROM teachers`);
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('sort_order')) {
            console.log("Adding sort_order column...");
            await connection.execute(`ALTER TABLE teachers ADD COLUMN sort_order INT DEFAULT 0`);
            console.log("sort_order column added.");
        } else {
            console.log("sort_order column already exists.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

main();
