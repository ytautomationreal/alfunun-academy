const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'alfunun_academy',
    });

    try {
        console.log("Checking gallery_images table...");
        const [columns] = await connection.execute(`SHOW COLUMNS FROM gallery_images`);
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('video_url')) {
            console.log("Adding video_url column...");
            await connection.execute(`ALTER TABLE gallery_images ADD COLUMN video_url VARCHAR(500)`);
            console.log("video_url column added.");
        } else {
            console.log("video_url column already exists.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

main();
