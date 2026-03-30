import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 1. Create features table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS features (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                icon VARCHAR(50) DEFAULT 'Star',
                col_span VARCHAR(50) DEFAULT 'md:col-span-1',
                bg_class VARCHAR(100) DEFAULT 'bg-zinc-900/50',
                sort_order INT DEFAULT 0
            );
        `);

        // 2. Create technologies table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS technologies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50) DEFAULT 'Code2'
            );
        `);

        // 3. Seed Default Features (Check if empty first)
        const [features] = await connection.execute('SELECT COUNT(*) as count FROM features');
        // @ts-ignore
        if (features[0].count === 0) {
            await connection.execute(`
                INSERT INTO features (title, description, icon, col_span, bg_class, sort_order) VALUES 
                ('Filtered Drinking Water', 'Pure and safe drinking water available for all students and staff.', 'Droplets', 'md:col-span-2', 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10', 1),
                ('Free Wi-Fi', 'High-speed internet access for all students during lab hours.', 'Wifi', 'md:col-span-1', 'bg-zinc-900/50', 2),
                ('Freelancing Support', 'Expert guidance on Upwork and Fiverr to start your earning journey.', 'Award', 'md:col-span-1', 'bg-zinc-900/50', 3),
                ('Expert Mentors', 'Learn from industry professionals with years of practical experience.', 'Users', 'md:col-span-2', 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10', 4),
                ('Flexible Timings', 'Morning, afternoon, and evening batches to suit your schedule.', 'Clock', 'md:col-span-3', 'bg-zinc-900/50', 5);
            `);
        }

        // 4. Seed Default Technologies (Check if empty first)
        const [techs] = await connection.execute('SELECT COUNT(*) as count FROM technologies');
        // @ts-ignore
        if (techs[0].count === 0) {
            await connection.execute(`
                INSERT INTO technologies (name, icon) VALUES 
                ('React', 'Code2'), ('Node.js', 'Server'), ('MongoDB', 'Database'), 
                ('Next.js', 'Globe'), ('Tailwind', 'Layout'), ('Figma', 'Figma'), 
                ('TypeScript', 'Terminal'), ('Python', 'Cpu');
            `);
        }

        // 5. Insert Default Theme Settings (Check if exists)
        // using ON DUPLICATE KEY UPDATE to ensure we don't error out although IGNORE would work too
        await connection.execute(`
            INSERT IGNORE INTO site_settings (setting_key, setting_value, section) VALUES 
            ('theme_primary', '#06b6d4', 'theme'),
            ('theme_secondary', '#6366f1', 'theme');
        `);

        return NextResponse.json({ success: true, message: "Advanced CMS tables setup successfully" });
    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}
