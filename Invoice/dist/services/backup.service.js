"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_service_1 = require("./db.service");
class BackupService {
    constructor() {
        this.dbService = new db_service_1.DbService();
        this.backupDir = path_1.default.join(process.cwd(), 'backup');
    }
    /**
     * Initializes the backup service and runs a check.
     */
    async initialize() {
        try {
            await promises_1.default.mkdir(this.backupDir, { recursive: true });
            console.log('[BackupService] Initialized. Checking for old records...');
            await this.runBackup();
        }
        catch (error) {
            console.error('[BackupService] Initialization error:', error);
        }
    }
    /**
     * Identifies records older than 30 days and moves them to backup.
     */
    async runBackup() {
        try {
            const history = await this.dbService.getHistory();
            const now = Date.now();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const oldRecords = history.filter((item) => {
                const genDate = new Date(item.gen_date).getTime();
                return (now - genDate) > thirtyDaysMs;
            });
            if (oldRecords.length === 0) {
                console.log('[BackupService] No old records found for archiving.');
                return;
            }
            console.log(`[BackupService] Found ${oldRecords.length} old records. Archiving...`);
            // Group by Year-Month for folder structure
            const currentMonthDir = new Date().toISOString().substring(0, 7); // e.g., "2026-03"
            const targetDir = path_1.default.join(this.backupDir, currentMonthDir);
            await promises_1.default.mkdir(targetDir, { recursive: true });
            const backupFile = path_1.default.join(targetDir, `archive-${Date.now()}.json`);
            await promises_1.default.writeFile(backupFile, JSON.stringify(oldRecords, null, 2));
            console.log(`[BackupService] Archive saved at: ${backupFile}`);
            // Remove from main DB
            for (const record of oldRecords) {
                await this.dbService.deleteInvoice(record.id);
            }
            console.log('[BackupService] Archived records removed from main database.');
        }
        catch (error) {
            console.error('[BackupService] Backup process failed:', error);
        }
    }
}
exports.BackupService = BackupService;
