import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'site-settings.json');

// Ensure file exists
if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({ headerDesign: 1 }));
}

export async function GET() {
    try {
        const data = fs.readFileSync(settingsPath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ headerDesign: 1 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const current = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const updated = { ...current, ...body };

        fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));

        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
    }
}
