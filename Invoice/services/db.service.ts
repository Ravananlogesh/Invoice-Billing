import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

export class DbService {
    private db: Database | null = null;
    private dbPath: string;

    constructor() {
        // Use process.cwd() to ensure we point to the project root's data folder
        this.dbPath = path.join(process.cwd(), 'data/vault.db');
    }

    public async backupDb(): Promise<void> {
        try {
            const backupDir = path.join(process.cwd(), 'data/backups');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `vault-${timestamp}.db`);
            
            const fs = require('fs/promises');
            await fs.mkdir(backupDir, { recursive: true });
            await fs.copyFile(this.dbPath, backupPath);
            console.log(`Database backup created: ${backupPath}`);
        } catch (error) {
            console.error('Backup failed:', error);
        }
    }

    public async init(): Promise<void> {
        if (this.db) return;

        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoice_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_no TEXT,
                customer TEXT,
                amount REAL,
                gen_date TEXT,
                pdf_link TEXT,
                sign_status TEXT
            )
        `);
    }

    public async saveInvoice(data: {
        bill_no: string;
        customer: string;
        amount: number;
        pdf_link: string;
        sign_status: string;
    }): Promise<number> {
        await this.init();
        const gen_date = new Date().toISOString();
        const result = await this.db!.run(
            `INSERT INTO invoice_history (bill_no, customer, amount, gen_date, pdf_link, sign_status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [data.bill_no, data.customer, data.amount, gen_date, data.pdf_link, data.sign_status]
        );
        
        // Proactive backup after save
        await this.backupDb();
        
        return result.lastID!;
    }

    public async getHistory(): Promise<any[]> {
        await this.init();
        return this.db!.all('SELECT * FROM invoice_history ORDER BY id DESC');
    }

    /**
     * Deletes a specific invoice record.
     */
    public async deleteInvoice(id: number): Promise<void> {
        await this.init();
        await this.db!.run('DELETE FROM invoice_history WHERE id = ?', [id]);
    }
}
