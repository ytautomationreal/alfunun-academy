import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM features ORDER BY sort_order ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, icon, col_span, bg_class, sort_order } = body;

        await pool.execute(
            'INSERT INTO features (title, description, icon, col_span, bg_class, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, icon, col_span || 'md:col-span-1', bg_class || 'bg-zinc-900/50', sort_order || 0]
        );

        return NextResponse.json({ success: true, message: "Feature added" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
