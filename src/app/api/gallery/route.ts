import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM gallery_images ORDER BY createdAt DESC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const text = await request.text();
        console.log("Gallery POST Raw Body:", text);

        let body;
        try {
            body = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return NextResponse.json({ success: false, error: "Invalid JSON body: " + (e as Error).message }, { status: 400 });
        }

        const { title, category, imageUrl, video_url } = body;
        console.log("Parsed Data:", { title, category, imageUrl, video_url });

        if (!imageUrl) {
            return NextResponse.json({ success: false, error: 'Image URL is required' }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO gallery_images (title, category, imageUrl, video_url) VALUES (?, ?, ?, ?)',
            [title || 'Untitled', category || 'Academy', imageUrl, video_url || null]
        );

        return NextResponse.json({ success: true, data: { id: result.insertId, title, category, imageUrl, video_url } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
