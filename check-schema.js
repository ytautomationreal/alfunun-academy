const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('DESCRIBE students');

        console.log("Students Table Schema:");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
