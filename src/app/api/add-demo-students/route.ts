import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST: Add demo students for testing
export async function POST() {
    try {
        const demoStudents = [
            { name: 'Ahmed Khan', fatherName: 'Muhammad Khan', cnic: '35201-1234567-1', phone: '0300-1234567', course: 'Web Development', address: 'Lahore', base_monthly_fee: 3000 },
            { name: 'Fatima Ali', fatherName: 'Ali Hassan', cnic: '35201-1234567-2', phone: '0301-2345678', course: 'Graphic Design', address: 'Karachi', base_monthly_fee: 2500 },
            { name: 'Usman Raza', fatherName: 'Raza Ahmed', cnic: '35201-1234567-3', phone: '0302-3456789', course: 'Basic Computer', address: 'Islamabad', base_monthly_fee: 2000 },
            { name: 'Ayesha Bibi', fatherName: 'Bibi Sahib', cnic: '35201-1234567-4', phone: '0303-4567890', course: 'Web Development', address: 'Faisalabad', base_monthly_fee: 3000 },
            { name: 'Hassan Malik', fatherName: 'Malik Sahib', cnic: '35201-1234567-5', phone: '0304-5678901', course: 'Video Editing', address: 'Multan', base_monthly_fee: 2500 },
            { name: 'Zainab Noor', fatherName: 'Noor Muhammad', cnic: '35201-1234567-6', phone: '0305-6789012', course: 'Graphic Design', address: 'Lahore', base_monthly_fee: 2500 },
            { name: 'Bilal Ahmed', fatherName: 'Ahmed Sahib', cnic: '35201-1234567-7', phone: '0306-7890123', course: 'Basic Computer', address: 'Karachi', base_monthly_fee: 2000 },
            { name: 'Sana Tariq', fatherName: 'Tariq Sahib', cnic: '35201-1234567-8', phone: '0307-8901234', course: 'Web Development', address: 'Lahore', base_monthly_fee: 3000 },
            { name: 'Imran Abbas', fatherName: 'Abbas Ali', cnic: '35201-1234567-9', phone: '0308-9012345', course: 'Video Editing', address: 'Rawalpindi', base_monthly_fee: 2500 },
            { name: 'Maryam Iqbal', fatherName: 'Iqbal Sahib', cnic: '35201-1234568-0', phone: '0309-0123456', course: 'Graphic Design', address: 'Sialkot', base_monthly_fee: 2500 },
        ];

        let addedCount = 0;

        for (const student of demoStudents) {
            await pool.execute(`
                INSERT INTO students (
                    name, fatherName, cnic, phone, course, address,
                    admissionFeeAmount, admissionFeePaid, admissionFeeStatus,
                    monthlyFeeAmount, monthlyFeePaid, monthlyFeeStatus,
                    base_monthly_fee, admissionDate, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                student.name, student.fatherName, student.cnic, student.phone,
                student.course, student.address,
                5000, 5000, 'Paid', // Admission fee paid
                student.base_monthly_fee, 0, 'Unpaid', // Monthly fee unpaid
                student.base_monthly_fee,
                '2025-12-01',
                'active'
            ]);
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Added ${addedCount} demo students`,
            added: addedCount
        });
    } catch (error) {
        console.error('Add demo students error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
