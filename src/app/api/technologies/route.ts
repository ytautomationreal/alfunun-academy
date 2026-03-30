import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM technologies');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, icon, image_url } = body;

        await pool.execute(
            'INSERT INTO technologies (name, icon, image_url) VALUES (?, ?, ?)',
            [name, icon, image_url || null]
        );

        return NextResponse.json({ success: true, message: "Technology added" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
