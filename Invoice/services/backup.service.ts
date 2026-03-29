import fs from 'fs/promises';
import path from 'path';
import { DbService } from './db.service';

export class BackupService {
    private dbService: DbService;
    private backupDir: string;

    constructor() {
        this.dbService = new DbService();
        this.backupDir = path.join(process.cwd(), 'backup');
    }

    /**
     * Initializes the backup service and runs a check.
     */
    public async initialize(): Promise<void> {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('[BackupService] Initialized. Checking for old records...');
            await this.runBackup();
        } catch (error) {
            console.error('[BackupService] Initialization error:', error);
        }
    }

    /**
     * Identifies records older than 30 days and moves them to backup.
     */
    public async runBackup(): Promise<void> {
        try {
            const history = await this.dbService.getHistory();
            const now = Date.now();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

            const oldRecords = history.filter((item: any) => {
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
            const targetDir = path.join(this.backupDir, currentMonthDir);
            await fs.mkdir(targetDir, { recursive: true });

            const backupFile = path.join(targetDir, `archive-${Date.now()}.json`);
            await fs.writeFile(backupFile, JSON.stringify(oldRecords, null, 2));

            console.log(`[BackupService] Archive saved at: ${backupFile}`);

            // Remove from main DB
            for (const record of oldRecords) {
                await this.dbService.deleteInvoice(record.id);
            }

            console.log('[BackupService] Archived records removed from main database.');
        } catch (error) {
            console.error('[BackupService] Backup process failed:', error);
        }
    }
}
