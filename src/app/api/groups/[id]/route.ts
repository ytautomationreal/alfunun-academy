import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, pc_count, sort_order } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE groups SET name = ?, pc_count = ?, sort_order = ? WHERE id = ?',
            [name, pc_count, sort_order || 999, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { id, name, pc_count, sort_order } });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM groups WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { message: 'Group deleted' } });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
