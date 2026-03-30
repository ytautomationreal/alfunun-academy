// Node.js script to create features table
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupFeaturesTable() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Creating features table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS features (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                icon VARCHAR(50) DEFAULT 'Monitor',
                col_span VARCHAR(50) DEFAULT 'md:col-span-1',
                bg_class VARCHAR(100) DEFAULT 'bg-zinc-900/50',
                sort_order INT DEFAULT 0
            )
        `);
        console.log('Features table created successfully!');

        // Add default features
        const features = [
            { title: 'High Speed Internet', description: 'Fast WiFi connectivity for seamless learning', icon: 'Wifi', sort_order: 1 },
            { title: 'Modern Labs', description: 'Latest computers and equipment for hands-on practice', icon: 'Monitor', sort_order: 2 },
            { title: 'Expert Mentors', description: 'Industry experienced teachers to guide you', icon: 'Users', sort_order: 3 },
            { title: 'Flexible Timing', description: 'Morning and evening batches available', icon: 'Clock', sort_order: 4 },
            { title: 'Filtered Drinking Water', description: 'Clean and safe drinking water available', icon: 'Droplets', sort_order: 5 },
            { title: 'Laptop Friendly', description: 'Bring your own device for personalized learning', icon: 'Laptop', sort_order: 6 },
            { title: 'Safe Campus', description: 'Secure and friendly environment for all', icon: 'Shield', sort_order: 7 },
        ];

        for (const f of features) {
            await pool.execute(
                'INSERT INTO features (title, description, icon, col_span, bg_class, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                [f.title, f.description, f.icon, 'md:col-span-1', 'bg-zinc-900/50', f.sort_order]
            );
            console.log(`Added: ${f.title}`);
        }

        console.log('All features added!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

setupFeaturesTable();
