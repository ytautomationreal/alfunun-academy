const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Checking tables...');
        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        console.log('\nChecking students columns...');
        const [studentCols] = await pool.query('DESCRIBE students');
        console.log(studentCols.map(c => c.Field));

        // Check if courses exists
        try {
            console.log('\nChecking courses table...');
            const [courseCols] = await pool.query('DESCRIBE courses');
            console.log(courseCols.map(c => c.Field));
        } catch (e) {
            console.log('Courses table does not exist or error:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkSchema();
