import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const batch = searchParams.get('batch');

        if (!date) {
            return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
        }

        let query = `
            SELECT 
                s.id as student_id,
                s.name as student_name,
                s.fatherName,
                s.pc_number as rollNumber,
                a.status
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            WHERE 1=1 AND (s.status = 'active' OR s.status IS NULL)
        `;

        const params: any[] = [date];

        if (batch && batch !== 'All') {
            query += ` AND s.batch = ?`;
            params.push(batch);
        }

        query += ` ORDER BY s.name`;

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
