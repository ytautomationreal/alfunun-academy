
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // 1. Add column if not exists
        try {
            await pool.query("ALTER TABLE groups ADD COLUMN sort_order INT DEFAULT 999");
        } catch (e: any) {
            // Ignore duplicate column error
        }

        // 2. Reset
        await pool.query("UPDATE groups SET sort_order = 999");

        // 3. Set Custom Order
        // 1st: 2:30PM
        await pool.query("UPDATE groups SET sort_order = 1 WHERE name LIKE '2:30%'");
        // 2nd: English
        await pool.query("UPDATE groups SET sort_order = 2 WHERE name LIKE '%English%'");
        // 3rd: 5:00PM
        await pool.query("UPDATE groups SET sort_order = 3 WHERE name LIKE '5:00%'");
        // 4th: 6:30PM
        await pool.query("UPDATE groups SET sort_order = 4 WHERE name LIKE '6:30%'");
        // 5th: 8:00PM
        await pool.query("UPDATE groups SET sort_order = 5 WHERE name LIKE '8:00%'");


        return NextResponse.json({ success: true, message: "Order updated" });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
