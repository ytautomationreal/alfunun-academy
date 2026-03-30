import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, message } = body;

        if (!name || !phone || !email || !message) {
            return NextResponse.json(
                { success: false, error: 'All fields are required.' },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            'INSERT INTO contact_messages (name, phone, email, message) VALUES (?, ?, ?, ?)',
            [name, phone, email, message]
        );

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send message.' },
            { status: 500 }
        );
    }
}
