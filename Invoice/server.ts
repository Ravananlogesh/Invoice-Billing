import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { InvoiceController } from './services/invoice.controller';
import { BackupService } from './services/backup.service';

class Server {
    private app: express.Application;
    private port: string | number;
    private invoiceController: InvoiceController;
    private backupService: BackupService;
    private upload: multer.Multer;
    private startTime: number;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.invoiceController = new InvoiceController();
        this.backupService = new BackupService();
        this.upload = multer({ dest: '.uploads/' });
        this.startTime = Date.now();
        this.config();
        this.routes();
        
        // Run background tasks
        this.backupService.initialize();
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(express.json());
        // Serve static files using process.cwd() - disabled cache for dev stability
        this.app.use(express.static(path.join(process.cwd(), 'web'), {
            etag: false,
            lastModified: false,
            setHeaders: (res) => {
                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            }
        }));
        this.app.use('/data', express.static(path.join(process.cwd(), 'data')));
    }

    private routes(): void {
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

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

const server = new Server();
server.start();