import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: 'YYYY-MM'

        // Get admission fee revenue from students table
        let admissionQuery = `
            SELECT 
                SUM(CASE WHEN admissionFeeStatus = 'Paid' THEN ROUND(admissionFeePaid) ELSE 0 END) as admissionRevenue,
                COUNT(CASE WHEN admissionFeeStatus = 'Paid' THEN 1 END) as paidAdmissionCount,
                COUNT(CASE WHEN admissionFeeStatus = 'Unpaid' OR admissionFeeStatus IS NULL THEN 1 END) as unpaidAdmissionCount
            FROM students
            WHERE status = 'active'
        `;
        const admissionParams: any[] = [];

        if (month) {
            admissionQuery += ` AND DATE_FORMAT(admissionDate, '%Y-%m') = ?`;
            admissionParams.push(month);
        }

        const [admissionRows] = await pool.query<RowDataPacket[]>(admissionQuery, admissionParams);
        const admissionStats = admissionRows[0];

        // Get monthly fee revenue from monthly_fee_records table (actual paid amounts)
        let monthlyQuery = `
            SELECT 
                ROUND(COALESCE(SUM(paid), 0)) as monthlyRevenue,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidMonthlyCount,
                COUNT(CASE WHEN status = 'pending' OR status = 'partial' THEN 1 END) as unpaidMonthlyCount
            FROM monthly_fee_records
        `;
        const monthlyParams: any[] = [];

        if (month) {
            monthlyQuery += ` WHERE month_year = ?`;
            monthlyParams.push(month);
        }

        const [monthlyRows] = await pool.query<RowDataPacket[]>(monthlyQuery, monthlyParams);
        const monthlyStats = monthlyRows[0];

        const admissionRevenue = Number(admissionStats.admissionRevenue) || 0;
        const monthlyRevenue = Number(monthlyStats.monthlyRevenue) || 0;
        const revenue = admissionRevenue + monthlyRevenue;

        const feeBreakdown = {
            admission: {
                revenue: admissionRevenue,
                paid: admissionStats.paidAdmissionCount || 0,
                unpaid: admissionStats.unpaidAdmissionCount || 0
            },
            monthly: {
                revenue: monthlyRevenue,
                paid: monthlyStats.paidMonthlyCount || 0,
                unpaid: monthlyStats.unpaidMonthlyCount || 0
            }
        };

        // Get Total Students
        const [studentRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as total FROM students WHERE status = 'active'"
        );
        const totalStudents = studentRows[0].total;

        // Get Active Batches
        let activeBatches = 0;
        try {
            const [courseRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM courses');
            activeBatches = courseRows[0].total;
        } catch (e) {
            const [batchRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(DISTINCT course) as total FROM students');
            activeBatches = batchRows[0].total;
        }

        // Unpaid Total
        const unpaidFees = feeBreakdown.admission.unpaid + feeBreakdown.monthly.unpaid;

        // EXPENSES & NET PROFIT
        let expenseQuery = 'SELECT SUM(amount) as total FROM expenses';
        const expenseParams: any[] = [];
        if (month) {
            expenseQuery += ' WHERE DATE_FORMAT(date, "%Y-%m") = ?';
            expenseParams.push(month);
        }
        const [expenseRows] = await pool.query<RowDataPacket[]>(expenseQuery, expenseParams);
        const totalExpenses = Number(expenseRows[0].total) || 0;

        const netProfit = revenue - totalExpenses;

        return NextResponse.json({
            success: true,
            data: {
                totalStudents,
                activeBatches,
                unpaidFees,
                revenue,
                totalExpenses,
                netProfit,
                breakdown: feeBreakdown
            }
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
