import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[Gallery Delete] Request received for ID: ${id}`);

        // 1. Get the image URL first to delete the file
        const [rows] = await pool.query<RowDataPacket[]>('SELECT imageUrl FROM gallery_images WHERE id = ?', [id]);
        console.log(`[Gallery Delete] Found image record:`, rows[0]);

        if (rows.length > 0) {
            const imageUrl = rows[0].imageUrl;
            console.log(`[Gallery Delete] Image URL: ${imageUrl}`);

            // Only delete if it's a local upload (starts with /uploads/)
            if (imageUrl.startsWith('/uploads/')) {
                const filepath = path.join(process.cwd(), 'public', imageUrl);
                console.log(`[Gallery Delete] Attempting to delete file at: ${filepath}`);
                try {
                    await unlink(filepath);
                    console.log(`[Gallery Delete] File deleted successfully`);
                } catch (fsError) {
                    console.error('[Gallery Delete] Error deleting file:', fsError);
                    // Continue to delete from DB even if file delete fails
                }
            } else {
                console.log(`[Gallery Delete] Skipping file deletion (not a local upload)`);
            }
        } else {
            console.warn(`[Gallery Delete] No record found for ID: ${id}`);
        }

        // 2. Delete from DB
        console.log(`[Gallery Delete] Executing DB DELETE for ID: ${id}`);
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM gallery_images WHERE id = ?', [id]);
        console.log(`[Gallery Delete] DB Delete Result:`, result);

        if (result.affectedRows === 0) {
            console.warn(`[Gallery Delete] No rows affected in DB`);
            return NextResponse.json({ success: false, error: 'Image not found or already deleted' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('[Gallery Delete] Exception:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
