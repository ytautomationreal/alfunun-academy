import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // YYYY-MM
        const batch = searchParams.get('batch');

        let query = `
            SELECT 
                s.id as student_id,
                s.name as student_name,
                s.fatherName,
                s.pc_number as rollNumber,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
                COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as 'leave',
                COUNT(a.status) as total
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id 
        `;

        const params: any[] = [];

        if (month) {
            query += ` AND DATE_FORMAT(a.date, "%Y-%m") = ?`;
            params.push(month);
        }

        // query += ` WHERE s.status = 'active'`; 
        let whereAdded = false;

        if (batch && batch !== 'All') {
            query += ` WHERE s.batch = ?`;
            params.push(batch);
            whereAdded = true;
        }

        query += ` GROUP BY s.id ORDER BY s.name`;

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        // Also fetch daily logs for the month if needed for detailed view
        // But for summary, this aggregation is good.

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("Attendance Stats Error:", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
