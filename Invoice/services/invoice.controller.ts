import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { DbService } from './db.service';
import { DocService } from './doc.service';
import { InvoiceData } from '../invoice.types';

export class InvoiceController {
    private pdfService: PdfService;
    private excelService: ExcelService;
    private dbService: DbService;

    private docService: DocService;

    constructor() {
        this.pdfService = new PdfService();
        this.excelService = new ExcelService();
        this.dbService = new DbService();
        this.docService = new DocService();
        
        this.upload = this.upload.bind(this);
        this.generate = this.generate.bind(this);
        this.generateCombined = this.generateCombined.bind(this);
        this.generateWord = this.generateWord.bind(this);
        this.getHistory = this.getHistory.bind(this);
    }

    /**
     * Handles Excel file upload and returns the parsed data for preview.
     */
    public async upload(req: Request, res: Response): Promise<void> {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            const excelPath = file.path;
            console.log(`[InvoiceController] Parsing file: ${excelPath}`);
            const data = this.excelService.parseExcel(excelPath);
            console.log(`[InvoiceController] Successfully parsed ${data.length} rows.`);
            
            // Move file to permanent storage
            const permanentUploadDir = path.join(process.cwd(), 'data/uploads');
            await fs.mkdir(permanentUploadDir, { recursive: true });
            const permanentPath = path.join(permanentUploadDir, `${Date.now()}-${file.originalname}`);
            
            // Using rename and logging path
            console.log(`[InvoiceController] Storing file permanently at: ${permanentPath}`);
            await fs.rename(excelPath, permanentPath);

            res.status(200).json(data);
        } catch (error) {
            console.error('Error uploading excel:', error);
            res.status(500).json({ error: 'Error parsing Excel file' });
        }
    }

    /**
     * Generates a signed PDF for a specific row of data.
     */
    public async generate(req: Request, res: Response): Promise<void> {
        try {
            const rowData = req.body;
            console.log('[Generate] Request data:', rowData);

            const invoiceData: InvoiceData = this.excelService.mapRowToInvoiceData(rowData);
            console.log('[Generate] Mapped invoice data:', JSON.stringify(invoiceData, null, 2));

            // 1. Read the HTML template
            const templatePath = path.join(process.cwd(), 'templates', 'invoice.html');
            console.log('[Generate] Reading template from:', templatePath);
            const templateHtml = await fs.readFile(templatePath, 'utf8');

            // 2. Compile and render
            console.log('[Generate] Compiling template with Handlebars');
            const template = handlebars.compile(templateHtml);
            const htmlContent = template(invoiceData);

            // 3. Generate PDF Buffer
            const outputDir = path.join(process.cwd(), 'data/invoices');
            await fs.mkdir(outputDir, { recursive: true });
            
            const baseFileName = `INV-${invoiceData.invoice.number || Date.now()}`;
            const pdfPath = path.join(outputDir, `${baseFileName}.pdf`);
            
            console.log('[Generate] Generating PDF at:', pdfPath);
            const pdfBuffer = await this.pdfService.generatePdf(htmlContent, pdfPath);

            // 4. Store in DB
            console.log('[Generate] Saving to History Vault');
            await this.dbService.saveInvoice({
                bill_no: invoiceData.invoice.number,
                customer: invoiceData.client.name,
                amount: parseFloat(invoiceData.totalAmount),
                pdf_link: `/data/invoices/${baseFileName}.pdf`,
                sign_status: 'UNSIGNED'
            });

            console.log(`[Generate] Success: ${pdfPath}`);
            
            res.download(pdfPath);
        } catch (error: any) {
            console.error('[Generate] FATAL ERROR:', error);
            res.status(500).json({ 
                error: 'Error generating PDF', 
                message: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Generates a merged PDF for multiple rows of data.
     */
    public async generateCombined(req: Request, res: Response): Promise<void> {
        try {
            const rows = req.body.rows;
            const pdfBuffers: Buffer[] = [];

            const templatePath = path.join(process.cwd(), 'templates', 'invoice.html');
            const templateHtml = await fs.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateHtml);

            for (const row of rows) {
                const invoiceData = this.excelService.mapRowToInvoiceData(row);
                const htmlContent = template(invoiceData);
                const buffer = await this.pdfService.generatePdf(htmlContent);
                pdfBuffers.push(buffer);
            }

            const mergedBuffer = await this.pdfService.mergePdfs(pdfBuffers);
            
            const baseFileName = `Combined-${Date.now()}.pdf`;
            const outputPath = path.join(process.cwd(), 'data/invoices', baseFileName);
            await fs.writeFile(outputPath, mergedBuffer);

            await this.dbService.saveInvoice({
                bill_no: "MULTIPLE",
                customer: rows[0].customer + " (Combined)",
                amount: rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0),
                pdf_link: `/data/invoices/${baseFileName}`,
                sign_status: 'UNSIGNED'
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${baseFileName}`);
            res.send(mergedBuffer);
        } catch (error: any) {
            res.status(500).json({ error: 'Error merging PDFs', message: error.message });
        }
    }

    /**
     * Generates a Word document for a specific row.
     */
    public async generateWord(req: Request, res: Response): Promise<void> {
        try {
            const rowData = req.body;
            const invoiceData = this.excelService.mapRowToInvoiceData(rowData);
            const buffer = await this.docService.generateDoc(invoiceData);

            const fileName = `INV-${invoiceData.invoice.number || Date.now()}.docx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(buffer);
        } catch (error: any) {
            res.status(500).json({ error: 'Error generating Word doc', message: error.message });
        }
    }

    /**
     * Retrieves the history of generated invoices.
     */
    public async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const history = await this.dbService.getHistory();
            res.status(200).json(history);
        } catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).json({ error: 'Error fetching history' });
        }
    }
}