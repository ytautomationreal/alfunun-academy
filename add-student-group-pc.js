const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addStudentGroupPC() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Adding group_batch and pc_number columns to students table...');
        await pool.execute(`
            ALTER TABLE students
            ADD COLUMN group_batch VARCHAR(50) DEFAULT NULL,
            ADD COLUMN pc_number INT DEFAULT NULL;
        `);
        console.log('Columns added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await pool.end();
    }
}

addStudentGroupPC();
