import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const batch = searchParams.get('batch');
        const showAll = searchParams.get('all') === 'true';

        let query = 'SELECT *, id as _id FROM students';
        const params: any[] = [];
        const whereConditions: string[] = [];

        if (batch && batch !== 'All') {
            whereConditions.push('batch = ?');
            params.push(batch);
        }

        if (showAll) {
            whereConditions.push("(status = 'active' OR status IS NULL)");
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        if (batch || showAll) {
            query += ' ORDER BY pc_number ASC';
        } else {
            query += ' ORDER BY admissionDate DESC';
        }

        if (!showAll && !batch) {
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        // Fetch total count
        const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM students');
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                total,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}


