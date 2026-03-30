import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const catboxData = new FormData();
        catboxData.append('reqtype', 'fileupload');
        catboxData.append('userhash', '');
        catboxData.append('fileToUpload', file);

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: catboxData,
            // Header is auto-set by FormData
        });

        if (!response.ok) {
            throw new Error(`Catbox upload failed: ${response.statusText}`);
        }

        const url = await response.text();
        return NextResponse.json({ url });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
