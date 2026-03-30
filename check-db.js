const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log("Connected to DB.");

        const [columns] = await connection.execute(`SHOW COLUMNS FROM students`);
        console.log("Students Table Columns:", columns.map(c => c.Field));

        const [rows] = await connection.execute(`SELECT * FROM students LIMIT 3`);
        console.log("Sample Students:", rows);

        const [groups] = await connection.execute(`SELECT * FROM groups`);
        console.log("Groups:", groups);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

checkSchema();
