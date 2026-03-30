const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listStudents() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
            'SELECT name, batch, pc_number, status FROM students WHERE status = "active" AND pc_number IS NOT NULL LIMIT 5'
        );

        console.log("Active Students with PCs:");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

listStudents();
