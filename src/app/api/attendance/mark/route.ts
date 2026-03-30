import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, attendance } = body; // attendance: [{ studentId: 1, status: 'present' }, ...]

        if (!date || !Array.isArray(attendance)) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Loop through and insert/update attendance
            for (const record of attendance) {
                await connection.execute(
                    `INSERT INTO attendance (student_id, date, status) 
                     VALUES (?, ?, ?) 
                     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
                    [record.studentId, date, record.status]
                );
            }

            await connection.commit();
            return NextResponse.json({ success: true, message: 'Attendance marked successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Mark Attendance Error:", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
