import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parsedText = await new Promise<string[]>((resolve, reject) => {
            const pdfParser = new PDFParser(null, true); // true = enable text directly

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                reject(errData.parserError);
            });

            pdfParser.on("pdfParser_dataReady", () => {
                // pdfParser has a method getRawTextContent() which returns the text
                const raw = pdfParser.getRawTextContent();
                // Split by logical lines
                const lines = raw.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 2);
                resolve(lines);
            });

            pdfParser.parseBuffer(buffer);
        });

        // Basic clean up of artifacts if any (pdf2json sometimes leaves dashes or page breaks)
        // For MVP, we pass the cleaned lines.
        // decodeURIComponent might be needed if pdf2json returns encoded strings, but getRawTextContent usually is plain text.

        return NextResponse.json({ names: parsedText });
    } catch (error) {
        console.error("PDF Parse Error:", error);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }
}
