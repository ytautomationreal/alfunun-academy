import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET: Get monthly report data for a specific month
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json({ success: false, error: 'Month parameter required' }, { status: 400 });
        }

        // Get all fee records for this month with student info
        const [records] = await pool.query<RowDataPacket[]>(`
            SELECT 
                mfr.id,
                mfr.month_year,
                ROUND(mfr.amount) as amount,
                ROUND(mfr.previous_dues) as previous_dues,
                ROUND(mfr.paid) as paid,
                mfr.status,
                ROUND(mfr.amount + mfr.previous_dues) as total_due,
                ROUND(mfr.amount + mfr.previous_dues - mfr.paid) as balance,
                s.id as student_id,
                s.name as student_name,
                s.phone as student_phone,
                s.course,
                s.batch
            FROM monthly_fee_records mfr
            JOIN students s ON mfr.student_id = s.id
            WHERE mfr.month_year = ?
            ORDER BY s.name
        `, [month]);

        // Get summary stats
        const paidCount = records.filter((r: any) => r.status === 'paid').length;
        const partialCount = records.filter((r: any) => r.status === 'partial').length;
        const unpaidCount = records.filter((r: any) => r.status === 'pending').length;

        const totalAmount = records.reduce((sum: number, r: any) => sum + Number(r.total_due), 0);
        const totalPaid = records.reduce((sum: number, r: any) => sum + Number(r.paid), 0);
        const totalPending = records.reduce((sum: number, r: any) => sum + Number(r.balance), 0);

        return NextResponse.json({
            success: true,
            month,
            records,
            summary: {
                totalStudents: records.length,
                paidCount,
                partialCount,
                unpaidCount,
                totalAmount,
                totalPaid,
                totalPending
            }
        });
    } catch (error) {
        console.error('Monthly report error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}

// GET: Get available months
export async function OPTIONS(request: Request) {
    try {
        const [months] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT month_year 
            FROM monthly_fee_records 
            ORDER BY month_year DESC
        `);

        return NextResponse.json({
            success: true,
            months: months.map((m: any) => m.month_year)
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
