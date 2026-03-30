const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log('Connected to database.');

        // Create table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Admins table created or already exists.');

        // Create contact_messages table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contact Messages table created or already exists.');

        // Check if admin exists
        const [rows] = await connection.execute('SELECT * FROM admins WHERE username = ?', ['admin@alfunun.com']);

        if (rows.length === 0) {
            // Insert default admin
            await connection.execute(
                'INSERT INTO admins (username, password) VALUES (?, ?)',
                ['admin@alfunun.com', 'admin123']
            );
            console.log('Default admin created: admin@alfunun.com / admin123');
        } else {
            console.log('Default admin already exists.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

createAdminTable();
