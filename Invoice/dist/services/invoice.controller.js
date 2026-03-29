"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const handlebars_1 = __importDefault(require("handlebars"));
const pdf_service_1 = require("./pdf.service");
const excel_service_1 = require("./excel.service");
const db_service_1 = require("./db.service");
const doc_service_1 = require("./doc.service");
class InvoiceController {
    constructor() {
        this.pdfService = new pdf_service_1.PdfService();
        this.excelService = new excel_service_1.ExcelService();
        this.dbService = new db_service_1.DbService();
        this.docService = new doc_service_1.DocService();
        this.upload = this.upload.bind(this);
        this.generate = this.generate.bind(this);
        this.generateCombined = this.generateCombined.bind(this);
        this.generateWord = this.generateWord.bind(this);
        this.getHistory = this.getHistory.bind(this);
    }
    /**
     * Handles Excel file upload and returns the parsed data for preview.
     */
    async upload(req, res) {
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
            const permanentUploadDir = path_1.default.join(process.cwd(), 'data/uploads');
            await promises_1.default.mkdir(permanentUploadDir, { recursive: true });
            const permanentPath = path_1.default.join(permanentUploadDir, `${Date.now()}-${file.originalname}`);
            // Using rename and logging path
            console.log(`[InvoiceController] Storing file permanently at: ${permanentPath}`);
            await promises_1.default.rename(excelPath, permanentPath);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error uploading excel:', error);
            res.status(500).json({ error: 'Error parsing Excel file' });
        }
    }
    /**
     * Generates a signed PDF for a specific row of data.
     */
    async generate(req, res) {
        try {
            const rowData = req.body;
            console.log('[Generate] Request data:', rowData);
            const invoiceData = this.excelService.mapRowToInvoiceData(rowData);
            console.log('[Generate] Mapped invoice data:', JSON.stringify(invoiceData, null, 2));
            // 1. Read the HTML template
            const templatePath = path_1.default.join(process.cwd(), 'templates', 'invoice.html');
            console.log('[Generate] Reading template from:', templatePath);
            const templateHtml = await promises_1.default.readFile(templatePath, 'utf8');
            // 2. Compile and render
            console.log('[Generate] Compiling template with Handlebars');
            const template = handlebars_1.default.compile(templateHtml);
            const htmlContent = template(invoiceData);
            // 3. Generate PDF Buffer
            const outputDir = path_1.default.join(process.cwd(), 'data/invoices');
            await promises_1.default.mkdir(outputDir, { recursive: true });
            const baseFileName = `INV-${invoiceData.invoice.number || Date.now()}`;
            const pdfPath = path_1.default.join(outputDir, `${baseFileName}.pdf`);
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
        }
        catch (error) {
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
    async generateCombined(req, res) {
        try {
            const rows = req.body.rows;
            const pdfBuffers = [];
            const templatePath = path_1.default.join(process.cwd(), 'templates', 'invoice.html');
            const templateHtml = await promises_1.default.readFile(templatePath, 'utf8');
            const template = handlebars_1.default.compile(templateHtml);
            for (const row of rows) {
                const invoiceData = this.excelService.mapRowToInvoiceData(row);
                const htmlContent = template(invoiceData);
                const buffer = await this.pdfService.generatePdf(htmlContent);
                pdfBuffers.push(buffer);
            }
            const mergedBuffer = await this.pdfService.mergePdfs(pdfBuffers);
            const baseFileName = `Combined-${Date.now()}.pdf`;
            const outputPath = path_1.default.join(process.cwd(), 'data/invoices', baseFileName);
            await promises_1.default.writeFile(outputPath, mergedBuffer);
            await this.dbService.saveInvoice({
                bill_no: "MULTIPLE",
                customer: rows[0].customer + " (Combined)",
                amount: rows.reduce((sum, r) => sum + parseFloat(r.amount), 0),
                pdf_link: `/data/invoices/${baseFileName}`,
                sign_status: 'UNSIGNED'
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${baseFileName}`);
            res.send(mergedBuffer);
        }
        catch (error) {
            res.status(500).json({ error: 'Error merging PDFs', message: error.message });
        }
    }
    /**
     * Generates a Word document for a specific row.
     */
    async generateWord(req, res) {
        try {
            const rowData = req.body;
            const invoiceData = this.excelService.mapRowToInvoiceData(rowData);
            const buffer = await this.docService.generateDoc(invoiceData);
            const fileName = `INV-${invoiceData.invoice.number || Date.now()}.docx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(buffer);
        }
        catch (error) {
            res.status(500).json({ error: 'Error generating Word doc', message: error.message });
        }
    }
    /**
     * Retrieves the history of generated invoices.
     */
    async getHistory(req, res) {
        try {
            const history = await this.dbService.getHistory();
            res.status(200).json(history);
        }
        catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).json({ error: 'Error fetching history' });
        }
    }
}
exports.InvoiceController = InvoiceController;
