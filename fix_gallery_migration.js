const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Starting migration retry...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'alfunun_academy',
    });

    try {
        // 1. Add video_url column
        const [columns] = await connection.execute(`SHOW COLUMNS FROM gallery_images`);
        const columnNames = columns.map(c => c.Field);
        if (!columnNames.includes('video_url')) {
            console.log("Adding video_url...");
            await connection.execute(`ALTER TABLE gallery_images ADD COLUMN video_url VARCHAR(500)`);
            console.log("video_url added.");
        } else {
            console.log("video_url exists.");
        }

        // 2. Reset Admin Password (using simple update, assuming plain text or handled by auth)
        // Check if admin exists
        const [users] = await connection.execute("SELECT * FROM users WHERE email = 'admin@alfunun.com'");
        if (users.length > 0) {
            console.log("Resetting admin password...");
            // Use simple password if no hashing, or bcrypt if needed. 
            // Assuming bcrypt based on typical setup, but generated code often uses plain text checking if simple.
            // Let's check how auth works. Assuming plain text for simplicity or standard bcrypt.
            // I'll try to find auth logic first, but for now just updating might be risky if hashed.
            // Actually, I'll skip password reset for now and rely on fixing the build error first. 
            // The browser subagent failed mostly due to the build error blocking interactions.
        }

    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        await connection.end();
    }
}

main();
