import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Student extends RowDataPacket {
    id: number;
    name: string;
    status: string;
    base_monthly_fee: number;
    monthlyFeeAmount: number;
    monthlyFeePaid: number;
}

interface FeeRecord extends RowDataPacket {
    id: number;
    student_id: number;
    month_year: string;
    amount: number;
    paid: number;
    previous_dues: number;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const targetMonth = body.month || new Date().toISOString().slice(0, 7); // Format: '2026-01'

        // Get all active students with their base monthly fee
        const [students] = await pool.query<Student[]>(`
            SELECT id, name, status, base_monthly_fee, monthlyFeeAmount, monthlyFeePaid 
            FROM students 
            WHERE status = 'active' OR status IS NULL
        `);

        if (students.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active students found',
                generated: 0
            });
        }

        let generatedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const student of students) {
            try {
                // Check if fee record already exists for this month
                const [existing] = await pool.query<FeeRecord[]>(`
                    SELECT * FROM monthly_fee_records 
                    WHERE student_id = ? AND month_year = ?
                `, [student.id, targetMonth]);

                if (existing.length > 0) {
                    skippedCount++;
                    continue; // Already generated
                }

                // Get the student's base monthly fee
                const baseFee = Number(student.base_monthly_fee) || Number(student.monthlyFeeAmount) || 0;

                if (baseFee <= 0) {
                    errors.push(`${student.name}: No monthly fee set`);
                    continue;
                }

                // Calculate previous unpaid balance from ALL previous months
                const [prevRecords] = await pool.query<RowDataPacket[]>(`
                    SELECT ROUND(SUM(amount + previous_dues - paid)) as total_unpaid
                    FROM monthly_fee_records
                    WHERE student_id = ? AND status != 'paid'
                `, [student.id]);

                const previousUnpaid = Math.round(Number(prevRecords[0]?.total_unpaid) || 0);

                // NEW TOTAL = BASE FEE (new month) + previous unpaid dues
                const newTotal = baseFee + previousUnpaid;

                // Create fee record for this month
                await pool.execute(`
                    INSERT INTO monthly_fee_records (student_id, month_year, amount, previous_dues, paid, status)
                    VALUES (?, ?, ?, ?, 0, 'pending')
                `, [student.id, targetMonth, baseFee, previousUnpaid]);

                // UPDATE STUDENT:
                // - monthlyFeeAmount = newTotal (base fee + previous dues)
                // - monthlyFeePaid = 0 (reset for new month)
                // - monthlyFeeStatus = 'Unpaid' (new month starts fresh)
                await pool.execute(`
                    UPDATE students 
                    SET monthlyFeeAmount = ?, monthlyFeePaid = 0, monthlyFeeStatus = 'Unpaid'
                    WHERE id = ?
                `, [newTotal, student.id]);

                generatedCount++;
            } catch (err) {
                errors.push(`${student.name}: ${(err as Error).message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Monthly fees generated for ${targetMonth}`,
            generated: generatedCount,
            skipped: skippedCount,
            total: students.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Generate fees error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}

// GET: Check fee status for a month
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

        const [records] = await pool.query<RowDataPacket[]>(`
            SELECT 
                mfr.*,
                s.name as student_name,
                s.phone as student_phone,
                s.course,
                s.batch
            FROM monthly_fee_records mfr
            JOIN students s ON mfr.student_id = s.id
            WHERE mfr.month_year = ?
            ORDER BY s.name
        `, [month]);

        // Get summary
        const [summary] = await pool.query<RowDataPacket[]>(`
            SELECT 
                COUNT(*) as total_students,
                SUM(amount + previous_dues) as total_amount,
                SUM(paid) as total_paid,
                SUM(amount + previous_dues - paid) as total_pending,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
            FROM monthly_fee_records
            WHERE month_year = ?
        `, [month]);

        return NextResponse.json({
            success: true,
            month,
            records,
            summary: summary[0]
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
