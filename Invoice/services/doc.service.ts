import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx';
import { InvoiceData } from '../invoice.types';

export class DocService {
    /**
     * Generates a Word document from invoice data.
     */
    public async generateDoc(data: InvoiceData): Promise<Buffer> {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Header
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "SHRI DHURGAI trans",
                                bold: true,
                                size: 32,
                                color: "002D62",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "No.33, Nellipattai High Road, Jamin Royapettai, Chromepet, Chennai - 600 044.",
                                size: 20,
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Ph: Cell: 9789012373 email: ravikalai1975@gmail.com",
                                size: 20,
                            }),
                        ],
                    }),
                    new Paragraph({ text: "" }), // Spacing

                    // Invoice Info Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: "Invoice cum Bill", alignment: AlignmentType.CENTER })],
                                        columnSpan: 2,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: "Original / Duplicate", alignment: AlignmentType.CENTER })],
                                        columnSpan: 2,
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: `M/s. ${data.client.name}`, bold: true })] }),
                                            new Paragraph({ text: data.client.address }),
                                            new Paragraph({ text: `GST No. ${data.client.gstNo}` }),
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: `Bill No. ${data.invoice.number}`, bold: true })] }),
                                            new Paragraph({ children: [new TextRun({ text: `Date: ${data.invoice.date}`, bold: true })] }),
                                        ],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ text: `Job No & Date: ${data.invoice.jobNumberAndDate}` }),
                                            new Paragraph({ text: `Exp Inv No: ${data.invoice.exportInvoiceNumber}` }),
                                        ],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ text: "" }), // Spacing

                    // Items Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Sl.no", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Details of Transport", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Quantity", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Rate", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Per", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Amount", alignment: AlignmentType.CENTER })] }),
                                ],
                            }),
                            ...data.items.map(item => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: item.sNo.toString(), alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: item.details }), new Paragraph({ children: [new TextRun({ text: `CONTRNO: ${item.containerNo}`, bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ text: item.quantity, alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: item.rate, alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: item.per, alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.amount, bold: true })], alignment: AlignmentType.RIGHT })] }),
                                ],
                            })),
                            // Total Row
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true })] })], columnSpan: 5 }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.totalAmount, bold: true })], alignment: AlignmentType.RIGHT })] }),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: `Rs. ${data.totalAmountInWords}`, bold: true })] }),

                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "PAN NO. AFNPR2251J", size: 20 })] }),
                    new Paragraph({ children: [new TextRun({ text: "GSTN No. 33AFNPR2251J1ZA", size: 20 })] }),
                    
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "For Shri Dhurgai Trans", bold: true })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.signatoryName, bold: true })] }),
                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Authorised Signatory" })] }),
                ],
            }],
        });

        return await Packer.toBuffer(doc);
    }
}
