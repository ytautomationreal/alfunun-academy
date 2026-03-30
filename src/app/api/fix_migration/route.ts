import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Checking gallery_images columns...");
        const [columns] = await pool.query<RowDataPacket[]>('SHOW COLUMNS FROM gallery_images');
        const columnNames = columns.map(c => c.Field);
        console.log("Existing columns:", columnNames);

        if (!columnNames.includes('video_url')) {
            console.log("Adding video_url...");
            await pool.query('ALTER TABLE gallery_images ADD COLUMN video_url VARCHAR(500)');
            return NextResponse.json({ success: true, message: 'Added video_url column' });
        } else {
            return NextResponse.json({ success: true, message: 'video_url already exists' });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
