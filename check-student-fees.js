const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkFees() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('SELECT id, name, admissionFeeStatus, admissionFeeAmount, monthlyFeeStatus, monthlyFeeAmount FROM students');

        console.log("Student Fee Data:");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkFees();
