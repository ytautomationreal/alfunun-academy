import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET: Debug endpoint to check fee sync
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('student_id');

        if (!studentId) {
            return NextResponse.json({ success: false, error: 'student_id required' }, { status: 400 });
        }

        // Get student data
        const [students] = await pool.query<RowDataPacket[]>(`
            SELECT id, name, monthlyFeeAmount, monthlyFeePaid, monthlyFeeStatus, base_monthly_fee 
            FROM students WHERE id = ?
        `, [studentId]);

        // Get fee records
        const [records] = await pool.query<RowDataPacket[]>(`
            SELECT * FROM monthly_fee_records WHERE student_id = ? ORDER BY month_year DESC
        `, [studentId]);

        return NextResponse.json({
            success: true,
            student: students[0] || null,
            records
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// POST: Force sync student fees from records
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { student_id } = body;

        if (!student_id) {
            return NextResponse.json({ success: false, error: 'student_id required' }, { status: 400 });
        }

        // Calculate totals from monthly_fee_records
        const [totals] = await pool.query<RowDataPacket[]>(`
            SELECT 
                ROUND(COALESCE(SUM(paid), 0)) as total_paid, 
                ROUND(COALESCE(SUM(amount + previous_dues), 0)) as total_amount 
            FROM monthly_fee_records 
            WHERE student_id = ?
        `, [student_id]);

        const totalPaid = Number(totals[0]?.total_paid) || 0;
        const totalAmount = Number(totals[0]?.total_amount) || 0;

        // Determine status
        let newStatus = 'Unpaid';
        if (totalPaid >= totalAmount && totalAmount > 0) {
            newStatus = 'Paid';
        } else if (totalPaid > 0) {
            newStatus = 'Partial';
        }

        // Update student
        await pool.execute(`
            UPDATE students 
            SET monthlyFeePaid = ?, 
                monthlyFeeAmount = ?,
                monthlyFeeStatus = ?
            WHERE id = ?
        `, [totalPaid, totalAmount, newStatus, student_id]);

        return NextResponse.json({
            success: true,
            message: 'Synced successfully',
            totalPaid,
            totalAmount,
            status: newStatus
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
