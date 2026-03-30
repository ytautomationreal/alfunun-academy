import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Step 1: Add base_monthly_fee column to students table if not exists
        await pool.execute(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS base_monthly_fee DECIMAL(10,2) DEFAULT 0
        `).catch(() => {
            // Column might already exist, ignore error
        });

        // Step 2: Create monthly_fee_records table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS monthly_fee_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                month_year VARCHAR(7) NOT NULL,
                amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                paid DECIMAL(10,2) DEFAULT 0,
                previous_dues DECIMAL(10,2) DEFAULT 0,
                status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_student_month (student_id, month_year)
            )
        `);

        // Step 3: Copy existing monthlyFeeAmount to base_monthly_fee where base_monthly_fee is 0
        await pool.execute(`
            UPDATE students 
            SET base_monthly_fee = monthlyFeeAmount 
            WHERE (base_monthly_fee IS NULL OR base_monthly_fee = 0) 
            AND monthlyFeeAmount > 0
        `);

        return NextResponse.json({
            success: true,
            message: 'Migration completed successfully! base_monthly_fee field and monthly_fee_records table created.'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
