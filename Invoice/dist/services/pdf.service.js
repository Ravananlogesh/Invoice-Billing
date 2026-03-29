"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const promises_1 = __importDefault(require("fs/promises"));
const pdf_lib_1 = require("pdf-lib");
class PdfService {
    /**
     * Generates a PDF document from HTML content using Puppeteer.
     * @param htmlContent The HTML content to render.
     * @param outputPath Optional path where the PDF will be saved.
     */
    async generatePdf(htmlContent, outputPath) {
        console.log('[PdfService] Launching browser...');
        const browser = await puppeteer_1.default.launch({
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
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
                margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
            };
            console.log('[PdfService] Generating PDF buffer...');
            const pdfBuffer = await page.pdf(pdfOptions);
            const buffer = Buffer.from(pdfBuffer);
            if (outputPath) {
                console.log('[PdfService] Writing PDF to disk:', outputPath);
                await promises_1.default.writeFile(outputPath, buffer);
            }
            return buffer;
        }
        catch (error) {
            console.error('[PdfService] Error in generatePdf:', error);
            throw new Error(`Puppeteer failed: ${error.message}`);
        }
        finally {
            await browser.close();
        }
    }
    /**
     * Merges multiple PDF buffers into a single PDF.
     */
    async mergePdfs(pdfBuffers) {
        console.log(`[PdfService] Merging ${pdfBuffers.length} PDFs...`);
        const mergedPdf = await pdf_lib_1.PDFDocument.create();
        for (const buffer of pdfBuffers) {
            const pdf = await pdf_lib_1.PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        return Buffer.from(pdfBytes);
    }
}
exports.PdfService = PdfService;
