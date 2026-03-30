import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.execute('DELETE FROM features WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: "Feature deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, icon, col_span, bg_class, sort_order } = body;

        await pool.execute(
            'UPDATE features SET title = ?, description = ?, icon = ?, col_span = ?, bg_class = ?, sort_order = ? WHERE id = ?',
            [title, description, icon, col_span, bg_class, sort_order, id]
        );

        return NextResponse.json({ success: true, message: "Feature updated" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
