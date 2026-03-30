import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // YYYY-MM format

        // Default to current month if not specified
        const targetMonth = monthParam || new Date().toISOString().slice(0, 7);
        const [year, month] = targetMonth.split('-');
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
        const monthStartDate = `${targetMonth}-01`;
        const monthEndDate = `${targetMonth}-${lastDay}`;

        // ============================================
        // REVENUE DATA - Single month aggregated values
        // ============================================

        // 1. Admission Fees for selected month (from students table)
        const admissionQuery = `
            SELECT 
                ROUND(COALESCE(SUM(CASE WHEN admissionFeeStatus = 'Paid' THEN admissionFeePaid ELSE 0 END), 0)) as admissionRevenue
            FROM students
            WHERE status = 'active' 
              AND DATE_FORMAT(admissionDate, '%Y-%m') = ?
        `;

        // 2. Monthly Fees for selected month (from monthly_fee_records table)
        const monthlyQuery = `
            SELECT 
                ROUND(COALESCE(SUM(paid), 0)) as monthlyRevenue
            FROM monthly_fee_records
            WHERE month_year = ?
        `;

        // 3. Expenses for selected month
        const expenseQuery = `
            SELECT 
                ROUND(COALESCE(SUM(amount), 0)) as totalExpense
            FROM expenses
            WHERE DATE_FORMAT(date, '%Y-%m') = ?
        `;

        // ============================================
        // ADMISSIONS DATA - Daily breakdown for month
        // ============================================
        const admissionsQuery = `
            SELECT 
                DATE_FORMAT(list_date, '%d %b') as name,
                list_date as sortKey,
                (SELECT COUNT(*) FROM students WHERE DATE(admissionDate) = list_date) as students,
                (SELECT COUNT(*) FROM students WHERE DATE(leftDate) = list_date AND status = 'left') as leftStudents
            FROM (
                SELECT DATE(?) + INTERVAL seq DAY as list_date
                FROM (
                    SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
                    UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
                    UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
                    UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
                    UNION ALL SELECT 30
                ) as seq_table
            ) as dates
            WHERE list_date >= ? AND list_date <= ?
            ORDER BY list_date ASC
        `;

        // Execute queries
        const [admissionRows] = await pool.query<RowDataPacket[]>(admissionQuery, [targetMonth]);
        const [monthlyRows] = await pool.query<RowDataPacket[]>(monthlyQuery, [targetMonth]);
        const [expenseRows] = await pool.query<RowDataPacket[]>(expenseQuery, [targetMonth]);
        const [admissionsData] = await pool.query<RowDataPacket[]>(admissionsQuery, [monthStartDate, monthStartDate, monthEndDate]);

        // Process revenue data
        const admissionRevenue = Number(admissionRows[0]?.admissionRevenue) || 0;
        const monthlyRevenue = Number(monthlyRows[0]?.monthlyRevenue) || 0;
        const expenses = Number(expenseRows[0]?.totalExpense) || 0;

        // Format month name for display
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });

        // Revenue data as array for chart compatibility
        const revenueData = [{
            name: monthName,
            admissionRevenue,
            monthlyRevenue,
            expenses,
            totalRevenue: admissionRevenue + monthlyRevenue,
            netRevenue: admissionRevenue + monthlyRevenue - expenses
        }];

        // Process admissions data
        const admissionsChartData = admissionsData.map((row: RowDataPacket) => ({
            name: row.name,
            students: Number(row.students) || 0,
            left: Number(row.leftStudents) || 0
        }));

        return NextResponse.json({
            success: true,
            data: {
                revenue: revenueData,
                admissions: admissionsChartData
            }
        });

    } catch (error) {
        console.error('Charts API Error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
