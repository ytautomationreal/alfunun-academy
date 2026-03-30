import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, role, imageUrl, bio, facebook, twitter, linkedin, instagram, youtube, github, sort_order } = body;

        await pool.execute(
            `UPDATE teachers SET 
            name = ?, role = ?, imageUrl = ?, bio = ?, 
            facebook = ?, twitter = ?, linkedin = ?, instagram = ?, youtube = ?, github = ?, sort_order = ?
            WHERE id = ?`,
            [
                name, role, imageUrl, bio,
                facebook, twitter, linkedin, instagram, youtube, github, sort_order || 0,
                id
            ]
        );

        return NextResponse.json({ success: true, message: "Teacher updated" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.execute('DELETE FROM teachers WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: "Teacher deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
