import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        let query = 'SELECT * FROM site_settings';
        let params: string[] = [];

        if (section) {
            query += ' WHERE section = ?';
            params.push(section);
        }

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        // Transform array to object { key: value } for easier frontend usage
        const settings: Record<string, string> = {};
        rows.forEach((row: any) => {
            settings[row.setting_key] = row.setting_value;
        });

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { settings, section } = body; // Expects { settings: { key: value }, section: 'hero' }

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ success: false, error: 'Invalid settings data' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const [key, value] of Object.entries(settings)) {
                await connection.query(
                    'INSERT INTO site_settings (setting_key, setting_value, section) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, section = ?',
                    [key, value, section || 'general', value, section || 'general']
                );
            }

            await connection.commit();
            return NextResponse.json({ success: true, message: 'Settings updated successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
