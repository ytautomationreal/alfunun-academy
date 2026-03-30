const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testDelete() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        // 1. Insert a dummy review
        console.log('Inserting dummy review...');
        const [insertRes] = await pool.execute(
            'INSERT INTO reviews (name, rating, reviewText) VALUES (?, ?, ?)',
            ['Test Delete', 5, 'To be deleted']
        );
        const id = insertRes.insertId;
        console.log('Inserted review with ID:', id);

        // 2. Fetch locally using fetch (mocking the API call conceptually, but here we just hit DB directly first)
        // Actually, let's use the actual API url via fetch if server is running? 
        // No, I can't hit localhost:3000 easily from a node script if there are issues, better to test logic.
        // But the user issue is likely frontend 'confirm' or API route.

        // Let's rely on my analysis that the API route looks correct.
        // The API route code: DELETE FROM reviews WHERE id = ?

        // I will simulate the exact query the API does.
        const [delRes] = await pool.execute('DELETE FROM reviews WHERE id = ?', [String(id)]);
        console.log('Delete result:', delRes);

        if (delRes.affectedRows > 0) {
            console.log('Delete successful!');
        } else {
            console.log('Delete failed!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

testDelete();
