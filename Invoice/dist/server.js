"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const invoice_controller_1 = require("./services/invoice.controller");
const backup_service_1 = require("./services/backup.service");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.invoiceController = new invoice_controller_1.InvoiceController();
        this.backupService = new backup_service_1.BackupService();
        this.upload = (0, multer_1.default)({ dest: '.uploads/' });
        this.startTime = Date.now();
        this.config();
        this.routes();
        // Run background tasks
        this.backupService.initialize();
    }
    config() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // Serve static files using process.cwd() - disabled cache for dev stability
        this.app.use(express_1.default.static(path_1.default.join(process.cwd(), 'web'), {
            etag: false,
            lastModified: false,
            setHeaders: (res) => {
                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            }
        }));
        this.app.use('/data', express_1.default.static(path_1.default.join(process.cwd(), 'data')));
    }
    routes() {
        this.app.get('/ping', (req, res) => res.json({
            status: 'ok',
            version: '1.3.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000) + 's',
            time: new Date().toISOString()
        }));
        this.app.post('/upload', this.upload.single('excelFile'), this.invoiceController.upload);
        this.app.post('/generate-invoice', this.invoiceController.generate);
        this.app.post('/generate-combined', this.invoiceController.generateCombined);
        this.app.post('/generate-word', this.invoiceController.generateWord);
        this.app.get('/history', this.invoiceController.getHistory);
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}
const server = new Server();
server.start();
