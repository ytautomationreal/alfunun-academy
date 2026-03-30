import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Extract fields
        const {
            name, fatherName, cnic, phone, address, course,
            admissionFeeStatus, monthlyFeeStatus, admissionFeeAmount, monthlyFeeAmount,
            batch, group_batch, // Handle both
            pc_number, status, leftDate, admissionDate,
            admissionFeePaid, monthlyFeePaid,
            base_monthly_fee // Include base monthly fee
        } = body;

        // Use batch or group_batch
        const finalBatch = batch || group_batch || null;

        // Check for duplicate PC allocation
        if (finalBatch && pc_number) {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT id, name FROM students WHERE batch = ? AND pc_number = ? AND status = ?',
                [finalBatch, pc_number, 'active']
            );

            if (existing.length > 0) {
                return NextResponse.json({
                    success: false,
                    error: `PC-${pc_number} in Batch '${finalBatch}' is already assigned to ${existing[0].name}. Please select a different PC.`
                }, { status: 409 }); // 409 Conflict
            }
        }

        // Use base_monthly_fee or monthlyFeeAmount
        const baseFee = Number(base_monthly_fee) || Number(monthlyFeeAmount) || 0;

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO students (
                name, fatherName, cnic, phone, address, course, 
                admissionFeeStatus, monthlyFeeStatus, admissionFeeAmount, monthlyFeeAmount,
                batch, pc_number, status, leftDate, admissionDate,
                admissionFeePaid, monthlyFeePaid, base_monthly_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, fatherName, cnic, phone, address, course,
                admissionFeeStatus || 'Unpaid', monthlyFeeStatus || 'Unpaid',
                admissionFeeAmount || 0, baseFee,
                finalBatch, pc_number || null, status || 'active', leftDate || null, admissionDate || new Date(),
                admissionFeePaid || 0, monthlyFeePaid || 0, baseFee
            ]
        );

        const studentId = result.insertId;

        // AUTO-CREATE MONTHLY FEE RECORD FOR ADMISSION MONTH
        // Use the admission date's month, not current server time
        const admissionDateObj = admissionDate ? new Date(admissionDate) : new Date();
        const admissionMonth = admissionDateObj.toISOString().slice(0, 7); // e.g., "2026-02"

        if (baseFee > 0) {
            try {
                // Check if record already exists (shouldn't, but just in case)
                const [existingRecord] = await pool.query<RowDataPacket[]>(
                    'SELECT id FROM monthly_fee_records WHERE student_id = ? AND month_year = ?',
                    [studentId, admissionMonth]
                );

                if (existingRecord.length === 0) {
                    // Create fee record for admission month
                    await pool.execute(
                        `INSERT INTO monthly_fee_records (student_id, month_year, amount, previous_dues, paid, status)
                         VALUES (?, ?, ?, 0, 0, 'pending')`,
                        [studentId, admissionMonth, baseFee]
                    );
                }
            } catch (feeError) {
                console.error('Error creating monthly fee record:', feeError);
                // Don't fail the whole admission if fee record creation fails
            }
        }

        return NextResponse.json({ success: true, data: { ...body, id: studentId } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
