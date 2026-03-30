const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixLogin() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Connected to database.');

        // 1. Check existing users
        const [users] = await connection.query('SELECT * FROM admins');
        console.log('Current admins:', users);

        // 2. Add or Update admin@academy.com
        const targetEmail = 'admin@academy.com';
        const targetPass = 'admin123';

        const existing = users.find(u => u.username === targetEmail);

        if (existing) {
            console.log(`User ${targetEmail} exists. Updating password...`);
            await connection.execute('UPDATE admins SET password = ? WHERE username = ?', [targetPass, targetEmail]);
        } else {
            console.log(`User ${targetEmail} does not exist. Creating...`);
            await connection.execute('INSERT INTO admins (username, password) VALUES (?, ?)', [targetEmail, targetPass]);
        }

        console.log('Done. Verifying...');
        const [finalUsers] = await connection.query('SELECT * FROM admins WHERE username = ?', [targetEmail]);
        console.log('Verified user:', finalUsers);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

fixLogin();
