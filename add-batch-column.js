const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addBatchColumn() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log("Connected to DB.");

        // Check if column exists
        const [columns] = await connection.execute(`SHOW COLUMNS FROM students LIKE 'batch'`);

        if (columns.length === 0) {
            console.log("Adding 'batch' column...");
            await connection.execute(`ALTER TABLE students ADD COLUMN batch VARCHAR(100) DEFAULT NULL`);
            console.log("'batch' column added successfully.");
        } else {
            console.log("'batch' column already exists.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

addBatchColumn();
