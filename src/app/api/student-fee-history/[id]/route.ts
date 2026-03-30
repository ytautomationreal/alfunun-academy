import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET: Get fee history for a specific student
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = parseInt(id, 10);

        if (isNaN(studentId)) {
            return NextResponse.json({ success: false, error: 'Invalid student ID' }, { status: 400 });
        }

        // Get all monthly fee records for this student
        const [records] = await pool.query<RowDataPacket[]>(`
            SELECT 
                id,
                month_year,
                ROUND(amount) as amount,
                ROUND(previous_dues) as previous_dues,
                ROUND(paid) as paid,
                status,
                ROUND(amount + previous_dues) as total_due,
                ROUND(amount + previous_dues - paid) as balance,
                created_at
            FROM monthly_fee_records 
            WHERE student_id = ?
            ORDER BY month_year DESC
        `, [studentId]);

        // Get student's current totals
        const [student] = await pool.query<RowDataPacket[]>(`
            SELECT 
                id, name, 
                ROUND(monthlyFeeAmount) as monthlyFeeAmount, 
                ROUND(monthlyFeePaid) as monthlyFeePaid, 
                monthlyFeeStatus,
                ROUND(admissionFeeAmount) as admissionFeeAmount, 
                ROUND(admissionFeePaid) as admissionFeePaid, 
                admissionFeeStatus,
                ROUND(base_monthly_fee) as base_monthly_fee
            FROM students 
            WHERE id = ?
        `, [studentId]);

        if (student.length === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            student: student[0],
            history: records,
            summary: {
                totalMonths: records.length,
                totalAmount: records.reduce((sum: number, r: any) => sum + Number(r.total_due), 0),
                totalPaid: records.reduce((sum: number, r: any) => sum + Number(r.paid), 0),
                totalBalance: records.reduce((sum: number, r: any) => sum + Number(r.balance), 0)
            }
        });
    } catch (error) {
        console.error('GET fee history error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}

// PATCH: Mark a specific month as PAID or WAIVED (skip)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;
        const studentId = parseInt(id, 10);

        if (isNaN(studentId)) {
            connection.release();
            return NextResponse.json({ success: false, error: 'Invalid student ID' }, { status: 400 });
        }

        const body = await request.json();
        const { month_year, paid_amount, action } = body;

        if (!month_year) {
            connection.release();
            return NextResponse.json({ success: false, error: 'month_year required' }, { status: 400 });
        }

        // Start transaction
        await connection.beginTransaction();

        try {
            // Handle WAIVE/SKIP action
            if (action === 'waive' || action === 'skip') {
                await connection.execute(`
                    UPDATE monthly_fee_records 
                    SET amount = 0, previous_dues = 0, paid = 0, status = 'paid'
                    WHERE student_id = ? AND month_year = ?
                `, [studentId, month_year]);
            } else {
                // Normal PAID action
                const paidAmountRounded = Math.round(Number(paid_amount) || 0);

                await connection.execute(`
                    UPDATE monthly_fee_records 
                    SET paid = ?, 
                        status = CASE 
                            WHEN ? >= ROUND(amount + previous_dues) THEN 'paid'
                            WHEN ? > 0 THEN 'partial'
                            ELSE 'pending'
                        END
                    WHERE student_id = ? AND month_year = ?
                `, [paidAmountRounded, paidAmountRounded, paidAmountRounded, studentId, month_year]);
            }

            // NOW SYNC STUDENT TABLE - Calculate from monthly_fee_records
            const [totals] = await connection.query<RowDataPacket[]>(`
                SELECT 
                    COALESCE(SUM(paid), 0) as total_paid, 
                    COALESCE(SUM(amount + previous_dues), 0) as total_amount 
                FROM monthly_fee_records 
                WHERE student_id = ?
            `, [studentId]);

            const totalPaid = Math.round(Number(totals[0]?.total_paid) || 0);
            const totalAmount = Math.round(Number(totals[0]?.total_amount) || 0);

            // Determine status
            let newStatus = 'Unpaid';
            if (totalAmount === 0 || totalPaid >= totalAmount) {
                newStatus = 'Paid';
            } else if (totalPaid > 0) {
                newStatus = 'Partial';
            }

            // RECALCULATE PREVIOUS DUES FOR FUTURE MONTHS
            // Get all months after the current one and update their previous_dues
            const [futureMonths] = await connection.query<RowDataPacket[]>(`
                SELECT id, month_year 
                FROM monthly_fee_records 
                WHERE student_id = ? AND month_year > ?
                ORDER BY month_year ASC
            `, [studentId, month_year]);

            for (const futureMonth of futureMonths) {
                // Calculate total unpaid from all months BEFORE this future month
                const [unpaidBefore] = await connection.query<RowDataPacket[]>(`
                    SELECT COALESCE(ROUND(SUM(amount + previous_dues - paid)), 0) as unpaid
                    FROM monthly_fee_records
                    WHERE student_id = ? AND month_year < ? AND status != 'paid'
                `, [studentId, futureMonth.month_year]);

                const newPreviousDues = Math.round(Number(unpaidBefore[0]?.unpaid) || 0);

                // Update this future month's previous_dues
                await connection.execute(`
                    UPDATE monthly_fee_records 
                    SET previous_dues = ?
                    WHERE id = ?
                `, [newPreviousDues, futureMonth.id]);
            }

            // Update student record
            await connection.execute(`
                UPDATE students 
                SET monthlyFeePaid = ?, monthlyFeeAmount = ?, monthlyFeeStatus = ?
                WHERE id = ?
            `, [totalPaid, totalAmount, newStatus, studentId]);

            // Commit transaction
            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: action === 'waive' || action === 'skip' ? `${month_year} skipped` : `${month_year} marked as paid`,
                totalPaid,
                totalAmount,
                status: newStatus
            });
        } catch (txError) {
            await connection.rollback();
            throw txError;
        }
    } catch (error) {
        connection.release();
        console.error('PATCH fee history error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
