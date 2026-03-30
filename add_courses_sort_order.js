const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addSortOrderColumn() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        // Check if column exists
        const [columns] = await connection.execute(`SHOW COLUMNS FROM courses LIKE 'sort_order'`);

        if (columns.length === 0) {
            console.log("Adding sort_order column...");
            await connection.execute(`
                ALTER TABLE courses
                ADD COLUMN sort_order INT DEFAULT 0
            `);
            console.log("Column sort_order added successfully.");
        } else {
            console.log("Column sort_order already exists.");
        }

    } catch (error) {
        console.error("Error adding column:", error);
    } finally {
        await connection.end();
    }
}

addSortOrderColumn();
