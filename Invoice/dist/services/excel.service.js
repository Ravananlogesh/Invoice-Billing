"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const xlsx = __importStar(require("xlsx"));
class ExcelService {
    /**
     * Parses an Excel file and converts it to a structured invoice data array.
     * Expected columns: Date, Customer, Bill No, Container No, Amount
     */
    parseExcel(filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Get raw data as array of arrays
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('[ExcelService] Raw first 10 rows:', rawData.slice(0, 10));
        // Find the header row (the first row that contains common keywords)
        const keywords = ['date', 'bill', 'customer', 'party', 'amount', 'container'];
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawData.length, 10); i++) {
            const row = rawData[i];
            if (row && row.some(cell => typeof cell === 'string' && keywords.some(k => cell.toLowerCase().includes(k)))) {
                headerRowIndex = i;
                break;
            }
        }
        const headers = rawData[headerRowIndex];
        const dataRows = rawData.slice(headerRowIndex + 1);
        console.log('[ExcelService] Detected headers:', headers);
        return dataRows.map((row) => {
            const getVal = (searchKeys) => {
                // First pass: look for exact matches (case-insensitive)
                let colIndex = headers.findIndex(h => h && typeof h === 'string' && searchKeys.some(sk => h.toLowerCase().trim() === sk.toLowerCase().trim()));
                // Second pass: look for partial matches if no exact match found
                if (colIndex === -1) {
                    colIndex = headers.findIndex(h => h && typeof h === 'string' && searchKeys.some(sk => h.toLowerCase().trim().includes(sk.toLowerCase().trim())));
                }
                return colIndex !== -1 ? row[colIndex] : '';
            };
            const rawDate = getVal(['date']);
            let formattedDate = rawDate;
            // Handle Excel serial numbers (numbers)
            if (typeof rawDate === 'number') {
                const dateObj = xlsx.utils.format_cell({ v: rawDate, t: 'd' });
                formattedDate = dateObj; // This usually returns MM/DD/YY or similar
                // Convert to YYYY-MM-DD for stability
                const d = new Date((rawDate - 25569) * 86400 * 1000);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toISOString().split('T')[0];
                }
            }
            else if (typeof rawDate === 'string' && rawDate.includes('.')) {
                // Handle DD.MM.YYYY format
                const parts = rawDate.split('.');
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            else if (rawDate instanceof Date) {
                formattedDate = rawDate.toISOString().split('T')[0];
            }
            return {
                date: formattedDate || '---',
                customer: getVal(['name of the customer', 'account customer', 'party name', 'customer']),
                billNo: getVal(['bill no', 'bill number', 'invoice no', 'invoice number']),
                containerNo: getVal(['container no', 'container number', 'contr no']),
                amount: getVal(['tpt hire', 'hire charges', 'amount', 'total']),
                gstNo: getVal(['gst no', 'gst number', 'gstin']),
                expInvNo: getVal(['exp inv no', 'export invoice no', 'job no'])
            };
        }).filter(item => item.billNo !== '' || item.customer !== '');
    }
    /**
     * Maps a single row from Excel to the complex InvoiceData structure for the template.
     */
    mapRowToInvoiceData(row) {
        const amount = this.cleanAmount(row.amount);
        return {
            client: {
                name: row.customer || 'Standard Customer',
                address: "As per records",
                gstNo: row.gstNo || ""
            },
            invoice: {
                number: row.billNo || `INV-${Date.now()}`,
                date: (row.date && row.date !== '---') ? row.date : new Date().toLocaleDateString(),
                jobNumberAndDate: "",
                exportInvoiceNumber: row.expInvNo || ""
            },
            items: [
                {
                    sNo: 1,
                    details: "TRANSPORT CHARGES",
                    containerNo: row.containerNo || "",
                    quantity: "1",
                    rate: amount.toFixed(2),
                    per: "Job",
                    amount: amount.toFixed(2)
                }
            ],
            totalAmount: amount.toFixed(2),
            totalAmountInWords: this.numberToWords(amount),
            signatoryName: "RAVI PALANI",
            signatureDate: new Date().toLocaleDateString(),
            isDuplicate: false
        };
    }
    cleanAmount(val) {
        if (typeof val === 'number')
            return val;
        if (typeof val === 'string') {
            // Remove everything except numbers and dots
            const cleaned = val.replace(/[^\d.]/g, '');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }
    numberToWords(num) {
        // Simple mock for now, can be replaced with a real library like 'number-to-words'
        return `Rupees ${num.toLocaleString()} Only`;
    }
}
exports.ExcelService = ExcelService;
