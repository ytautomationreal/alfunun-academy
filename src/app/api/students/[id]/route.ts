import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [rows] = await pool.query<any[]>('SELECT *, id as _id FROM students WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: rows[0] });
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
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM students WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { message: 'Student deleted' } });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // If status is changing to something other than 'active' (e.g. 'left', 'completed'), free the PC slot
        if (body.status && body.status.toLowerCase() !== 'active') {
            body.pc_number = null;
            // Optional: body.group_batch = null; // If you want to remove them from the batch entirely
        }

        // Dynamically build SET clause
        const keys = Object.keys(body).filter(k => k !== 'id' && k !== '_id');
        if (keys.length === 0) return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });

        // Round fee-related numeric fields to avoid decimals
        const feeFields = ['admissionFeeAmount', 'admissionFeePaid', 'monthlyFeeAmount', 'monthlyFeePaid', 'base_monthly_fee'];
        for (const field of feeFields) {
            if (body[field] !== undefined) {
                body[field] = Math.round(Number(body[field]));
            }
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...keys.map(k => body[k]), id];

        const [result] = await pool.execute<ResultSetHeader>(`UPDATE students SET ${setClause} WHERE id = ?`, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { ...body, id } });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
