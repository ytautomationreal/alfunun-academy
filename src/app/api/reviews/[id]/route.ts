import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM reviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Review deleted' });
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
        const { name, rating, reviewText, timeAgo, reviewLink, imageUrl } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE reviews SET name = ?, rating = ?, reviewText = ?, timeAgo = ?, reviewLink = ?, imageUrl = ? WHERE id = ?',
            [
                name,
                rating || 5,
                reviewText || '',
                timeAgo || '1 month ago',
                reviewLink || '#',
                imageUrl || 'https://placehold.co/100x100/1e293b/06b6d4?text=User',
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Review updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
