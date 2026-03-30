const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Starting comprehensive fix...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'alfunun_academy',
    });

    try {
        // 1. Gallery Migration
        console.log("Checking gallery_images...");
        const [gCols] = await connection.execute(`SHOW COLUMNS FROM gallery_images`);
        const gColNames = gCols.map(c => c.Field);
        if (!gColNames.includes('video_url')) {
            console.log("Adding video_url to gallery_images...");
            await connection.execute(`ALTER TABLE gallery_images ADD COLUMN video_url VARCHAR(500)`);
            console.log("video_url added.");
        } else {
            console.log("video_url already exists.");
        }

        // 2. Admin Auth Fix
        console.log("Checking admins table...");
        // Ensure table exists (api does this but good to be sure)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Check for admin user
        const [admins] = await connection.execute("SELECT * FROM admins WHERE username = 'admin@alfunun.com'");
        if (admins.length === 0) {
            console.log("Creating admin user...");
            await connection.execute(
                "INSERT INTO admins (username, password) VALUES (?, ?)",
                ['admin@alfunun.com', 'admin123']
            );
            console.log("Admin user created: admin@alfunun.com / admin123");
        } else {
            console.log("Admin user exists. Updating password to 'admin123' to be sure...");
            await connection.execute(
                "UPDATE admins SET password = 'admin123' WHERE username = 'admin@alfunun.com'"
            );
            console.log("Admin password updated.");
        }

    } catch (error) {
        console.error("Fix script error:", error);
    } finally {
        await connection.end();
        console.log("Done.");
    }
}

main();
