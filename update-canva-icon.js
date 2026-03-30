// Node.js script to update Canva technology with local icon
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateCanvaIcon() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Updating Canva icon...');
        // Updates the row where name is 'Canva' to have the local image URL
        // Using /icons/canva.png assuming it's in public/icons/canva.png
        const [result] = await pool.execute(
            'UPDATE technologies SET image_url = ? WHERE name = ?',
            ['/icons/canva.png', 'Canva']
        );

        if (result.affectedRows > 0) {
            console.log('Canva icon updated successfully!');
        } else {
            console.log('Canva technology not found. Please check the name.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

updateCanvaIcon();
