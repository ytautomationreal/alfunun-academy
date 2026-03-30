const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createGroupsTable() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Creating groups table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                pc_count INT NOT NULL DEFAULT 20,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Groups table created successfully!');

        // Insert default groups if empty
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM groups');
        if (rows[0].count === 0) {
            console.log('Seeding default groups...');
            const defaultGroups = [
                ['Morning 09-11', 20],
                ['Morning 11-01', 20],
                ['Afternoon 02-04', 20],
                ['Evening 04-06', 20],
                ['Evening 06-08', 20],
                ['Night 08-10', 20]
            ];
            for (const [name, count] of defaultGroups) {
                await pool.execute('INSERT INTO groups (name, pc_count) VALUES (?, ?)', [name, count]);
            }
            console.log('Default groups seeded.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

createGroupsTable();
