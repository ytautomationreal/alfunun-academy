import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // --- LAZY TABLE INITIALIZATION (Self-Healing) ---
        // Ensure table exists on first run
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Check availability of any admin, if none, seed default
        const [existingAdmins] = await pool.query<RowDataPacket[]>('SELECT id FROM admins LIMIT 1');
        if (existingAdmins.length === 0) {
            await pool.execute(
                'INSERT INTO admins (username, password) VALUES (?, ?)',
                ['admin@alfunun.com', 'admin123']
            );
        }
        // ------------------------------------------------

        // Validate Credentials
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            [email, password]
        );

        if (rows.length > 0) {
            const admin = rows[0];
            // Create response
            const response = NextResponse.json({ success: true, user: { email: admin.username } });

            // Set Cookie
            response.cookies.set({
                name: 'admin_session',
                value: 'true', // In a real app, use a JWT or Session ID
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
            });

            return response;
        } else {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
