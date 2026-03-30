import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic params
) {
    try {
        const { id } = await params;
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, duration, price, icon, color, category, sort_order } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE courses SET title = ?, description = ?, duration = ?, price = ?, icon = ?, color = ?, category = ?, sort_order = ? WHERE id = ?',
            [title, description, duration, price, icon, color, category, sort_order || 0, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Course updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
