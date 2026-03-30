import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM reviews ORDER BY createdAt DESC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, rating, reviewText, timeAgo, reviewLink, imageUrl } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO reviews (name, rating, reviewText, timeAgo, reviewLink, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
            [
                name,
                rating || 5,
                reviewText,
                timeAgo || '1 month ago',
                reviewLink || '#',
                imageUrl || 'https://placehold.co/100x100/1e293b/06b6d4?text=User'
            ]
        );

        return NextResponse.json({ success: true, data: { id: result.insertId, ...body } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
