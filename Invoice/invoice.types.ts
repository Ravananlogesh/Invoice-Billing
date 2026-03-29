export interface Client {
    name: string;
    address: string;
    gstNo: string;
}

export interface InvoiceInfo {
    number: string;
    date: string;
    jobNumberAndDate: string;
    exportInvoiceNumber: string;
}

export interface Item {
    sNo: number;
    details: string;
    containerNo: string;
    quantity: string;
    rate: string;
    per: string;
    amount: string;
}

export interface InvoiceData {
    client: Client;
    invoice: InvoiceInfo;
    items: Item[];
    totalAmount: string;
    totalAmountInWords: string;
    signatoryName: string;
    signatureDate: string;
    isDuplicate: boolean;
}