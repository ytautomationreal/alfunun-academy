const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createExpensesTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log("Connected to DB.");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) DEFAULT 'General',
                date DATE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Expenses table created successfully.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

createExpensesTable();
