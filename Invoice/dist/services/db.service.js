"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
class DbService {
    constructor() {
        this.db = null;
        // Use process.cwd() to ensure we point to the project root's data folder
        this.dbPath = path_1.default.join(process.cwd(), 'data/vault.db');
    }
    async backupDb() {
        try {
            const backupDir = path_1.default.join(process.cwd(), 'data/backups');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path_1.default.join(backupDir, `vault-${timestamp}.db`);
            const fs = require('fs/promises');
            await fs.mkdir(backupDir, { recursive: true });
            await fs.copyFile(this.dbPath, backupPath);
            console.log(`Database backup created: ${backupPath}`);
        }
        catch (error) {
            console.error('Backup failed:', error);
        }
    }
    async init() {
        if (this.db)
            return;
        this.db = await (0, sqlite_1.open)({
            filename: this.dbPath,
            driver: sqlite3_1.default.Database
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
    async saveInvoice(data) {
        await this.init();
        const gen_date = new Date().toISOString();
        const result = await this.db.run(`INSERT INTO invoice_history (bill_no, customer, amount, gen_date, pdf_link, sign_status) 
             VALUES (?, ?, ?, ?, ?, ?)`, [data.bill_no, data.customer, data.amount, gen_date, data.pdf_link, data.sign_status]);
        // Proactive backup after save
        await this.backupDb();
        return result.lastID;
    }
    async getHistory() {
        await this.init();
        return this.db.all('SELECT * FROM invoice_history ORDER BY id DESC');
    }
    /**
     * Deletes a specific invoice record.
     */
    async deleteInvoice(id) {
        await this.init();
        await this.db.run('DELETE FROM invoice_history WHERE id = ?', [id]);
    }
}
exports.DbService = DbService;
