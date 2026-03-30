import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY sort_order ASC, id DESC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, duration, price, icon, color, category, sort_order } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO courses (title, description, duration, price, icon, color, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, duration, price, icon || 'Code2', color || 'text-cyan-400', category || 'Development', sort_order || 0]
        );

        return NextResponse.json({ success: true, data: { id: result.insertId, ...body } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
