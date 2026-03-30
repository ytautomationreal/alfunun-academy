import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE: Clear all monthly fee records
export async function DELETE() {
    try {
        // Delete all monthly fee records
        await pool.execute('DELETE FROM monthly_fee_records');

        // Reset all student fee data to 0
        await pool.execute(`
            UPDATE students SET 
                monthlyFeeAmount = 0,
                monthlyFeePaid = 0,
                monthlyFeeStatus = 'Unpaid'
        `);

        return NextResponse.json({
            success: true,
            message: 'All monthly fee records cleared and student fee data reset'
        });
    } catch (error) {
        console.error('Clear fee data error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
