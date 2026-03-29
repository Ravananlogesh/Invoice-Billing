import puppeteer, { PDFOptions } from 'puppeteer';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

export class PdfService {
    /**
     * Generates a PDF document from HTML content using Puppeteer.
     * @param htmlContent The HTML content to render.
     * @param outputPath Optional path where the PDF will be saved.
     */
    public async generatePdf(htmlContent: string, outputPath?: string): Promise<Buffer> {
        console.log('[PdfService] Launching browser...');
        const browser = await puppeteer.launch({ 
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        
        try {
            console.log('[PdfService] Creating new page...');
            const page = await browser.newPage();

            console.log('[PdfService] Setting HTML content...');
            await page.setContent(htmlContent, { 
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            const pdfOptions: PDFOptions = {
                format: 'A4',
                printBackground: true,
                margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
            };

            console.log('[PdfService] Generating PDF buffer...');
            const pdfBuffer = await page.pdf(pdfOptions);
            const buffer = Buffer.from(pdfBuffer);
            
            if (outputPath) {
                console.log('[PdfService] Writing PDF to disk:', outputPath);
                await fs.writeFile(outputPath, buffer);
            }
            
            return buffer;
        } catch (error: any) {
            console.error('[PdfService] Error in generatePdf:', error);
            throw new Error(`Puppeteer failed: ${error.message}`);
        } finally {
            await browser.close();
        }
    }

    /**
     * Merges multiple PDF buffers into a single PDF.
     */
    public async mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
        console.log(`[PdfService] Merging ${pdfBuffers.length} PDFs...`);
        const mergedPdf = await PDFDocument.create();
        for (const buffer of pdfBuffers) {
            const pdf = await PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        return Buffer.from(pdfBytes);
    }
}