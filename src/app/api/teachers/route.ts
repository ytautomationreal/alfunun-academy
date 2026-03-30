import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

async function ensureTableAndColumns() {
    // 1. Create table if not exists with ALL columns
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            imageUrl VARCHAR(255),
            bio TEXT,
            facebook VARCHAR(255),
            twitter VARCHAR(255),
            linkedin VARCHAR(255),
            instagram VARCHAR(255),
            youtube VARCHAR(255),
            github VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Check for missing columns
    const [rows]: any = await pool.execute("SHOW COLUMNS FROM teachers");
    const existingColumns = rows.map((r: any) => r.Field);

    const requiredColumns = ['instagram', 'youtube', 'github', 'sort_order'];

    for (const col of requiredColumns) {
        if (!existingColumns.includes(col)) {
            try {
                const type = col === 'sort_order' ? 'INT DEFAULT 0' : 'VARCHAR(255)';
                await pool.execute(`ALTER TABLE teachers ADD COLUMN ${col} ${type}`);
            } catch (error: any) {
                if (error.code !== 'ER_DUP_FIELDNAME') {
                    console.warn(`Warning parsing column ${col}: ${error.message}`);
                }
            }
        }
    }
}

export async function GET() {
    try {
        await ensureTableAndColumns();
        const [rows] = await pool.execute('SELECT * FROM teachers ORDER BY sort_order ASC, created_at DESC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error("Teacher GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, role, imageUrl, bio, facebook, twitter, linkedin, instagram, youtube, github, sort_order } = body;

        await ensureTableAndColumns();

        await pool.execute(
            'INSERT INTO teachers (name, role, imageUrl, bio, facebook, twitter, linkedin, instagram, youtube, github, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name || null,
                role || null,
                imageUrl || null,
                bio || null,
                facebook || null,
                twitter || null,
                linkedin || null,
                instagram || null,
                youtube || null,
                github || null,
                sort_order || 0
            ]
        );

        return NextResponse.json({ success: true, message: "Teacher added" });
    } catch (error: any) {
        console.error("Teacher POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
