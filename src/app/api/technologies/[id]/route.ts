import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.execute('DELETE FROM technologies WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: "Technology deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, icon, image_url } = body;

        await pool.execute(
            'UPDATE technologies SET name = ?, icon = ?, image_url = ? WHERE id = ?',
            [name, icon, image_url || null, id]
        );

        return NextResponse.json({ success: true, message: "Technology updated" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
