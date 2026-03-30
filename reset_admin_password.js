const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'alfunun_academy',
    });

    try {
        const password = "admin";
        // Assuming the app uses bcrypt. If not, this might break plain text auth, 
        // but modern apps usually use bcrypt.
        // Let's check package.json to see if bcrypt/bcryptjs is used.
        // But for now, I'll update to a hatched password.
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Updating admin password...");
        await connection.execute(
            `UPDATE users SET password = ? WHERE email = 'admin@alfunun.com'`,
            [hashedPassword]
        );
        console.log("Password updated to 'admin'.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

main();
