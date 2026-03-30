import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // YYYY-MM

        let query = 'SELECT *, id as _id FROM expenses';
        const params: any[] = [];

        if (month) {
            query += ' WHERE DATE_FORMAT(date, "%Y-%m") = ?';
            params.push(month);
        }

        query += ' ORDER BY date DESC';

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, amount, category, date, description } = body;

        if (!title || !amount || !date) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO expenses (title, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
            [title, amount, category || 'General', date, description || '']
        );

        return NextResponse.json({ success: true, data: { ...body, id: result.insertId } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
