// Node.js script to add image_url to technologies table
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addImageUrlColumn() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Adding image_url column to technologies table...');
        await pool.execute(`
            ALTER TABLE technologies
            ADD COLUMN image_url VARCHAR(512) DEFAULT NULL;
        `);
        console.log('Column added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column image_url already exists.');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await pool.end();
    }
}

addImageUrlColumn();
