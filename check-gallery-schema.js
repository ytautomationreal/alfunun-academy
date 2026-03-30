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

        console.log("Connected to DB");

        const [rows] = await connection.execute('DESCRIBE gallery_images');

        console.log("gallery_images Table Schema:");
        console.table(rows);

        // Also check if there are any rows
        const [data] = await connection.execute('SELECT * FROM gallery_images LIMIT 5');
        console.log("First 5 rows:", data);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
