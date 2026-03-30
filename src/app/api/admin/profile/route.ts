import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { currentUsername, newUsername, newPassword } = body;

        // In a real app, we should verify the current password too.
        // For now, we update based on the current username (stored in session/localstorage on client).

        // 1. Check if new username is taken (if changing username)
        if (newUsername !== currentUsername) {
            const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM admins WHERE username = ?', [newUsername]);
            if (existing.length > 0) {
                return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 400 });
            }
        }

        // 2. Update
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE admins SET username = ?, password = ? WHERE username = ?',
            [newUsername, newPassword, currentUsername]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
