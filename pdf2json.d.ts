declare module 'pdf2json' {
    export default class PDFParser {
        constructor(context: any, needRawText: boolean);
        on(event: string, callback: (data: any) => void): void;
        parseBuffer(buffer: Buffer): void;
        getRawTextContent(): string;
    }
}
