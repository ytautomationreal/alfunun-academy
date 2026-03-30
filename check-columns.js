const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [columns] = await connection.execute(`SHOW COLUMNS FROM gallery_images`);
        console.log("Columns:", columns.map(c => c.Field));
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

checkColumns();
