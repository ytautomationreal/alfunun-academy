import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE: Reset/delete monthly fee records for a specific month
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json({ success: false, error: 'Month parameter required' }, { status: 400 });
        }

        // Delete records for this month
        await pool.execute(`
            DELETE FROM monthly_fee_records WHERE month_year = ?
        `, [month]);

        return NextResponse.json({
            success: true,
            message: `Fee records for ${month} deleted`
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
