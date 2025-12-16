import { NextResponse } from 'next/server';
const pdf = require('pdf-parse');

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        // Split by new lines and filter empty or short strings
        const lines = data.text.split(/\n+/).map((l: string) => l.trim()).filter((l: string) => l.length > 2);

        // Basic cleanup: remove common headers if possible, but for MVP just return all lines
        // Users can edit before confirming ideally, but request asked for automation.
        // We'll return the list and let the frontend decide.

        return NextResponse.json({ names: lines });
    } catch (error) {
        console.error("PDF Parse Error:", error);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }
}
