const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkLatest() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Check the 5 most recent IDs, regardless of date
        const [rows] = await connection.execute(
            'SELECT id, name, admissionDate, admissionFeeAmount, monthlyFeeAmount FROM students ORDER BY id DESC LIMIT 5'
        );

        console.log("Most Recent Students (by ID):");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkLatest();
