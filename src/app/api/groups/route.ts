import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM groups ORDER BY sort_order ASC, created_at ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, pc_count, sort_order } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO groups (name, pc_count, sort_order) VALUES (?, ?, ?)',
            [name, pc_count || 20, sort_order || 999]
        );

        return NextResponse.json({ success: true, data: { id: result.insertId, name, pc_count: pc_count || 20, sort_order: sort_order || 999 } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
