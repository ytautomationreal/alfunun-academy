import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        // Fetch batches from both groups table (source of truth) and existing students (legacy data)
        const query = `
            SELECT name as batch, sort_order FROM groups 
            UNION 
            SELECT DISTINCT batch, 999 as sort_order FROM students 
            WHERE batch IS NOT NULL AND batch != "" AND batch NOT IN (SELECT name FROM groups)
            ORDER BY sort_order ASC, batch ASC
        `;

        const [rows] = await pool.query<RowDataPacket[]>(query);
        const batches = rows.map(r => r.batch);
        return NextResponse.json({ success: true, data: batches });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
