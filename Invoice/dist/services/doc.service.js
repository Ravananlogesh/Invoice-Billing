"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocService = void 0;
const docx_1 = require("docx");
class DocService {
    /**
     * Generates a Word document from invoice data.
     */
    async generateDoc(data) {
        const doc = new docx_1.Document({
            sections: [{
                    properties: {},
                    children: [
                        // Header
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: "SHRI DHURGAI trans",
                                    bold: true,
                                    size: 32,
                                    color: "002D62",
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: "No.33, Nellipattai High Road, Jamin Royapettai, Chromepet, Chennai - 600 044.",
                                    size: 20,
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: "Ph: Cell: 9789012373 email: ravikalai1975@gmail.com",
                                    size: 20,
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({ text: "" }), // Spacing
                        // Invoice Info Table
                        new docx_1.Table({
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: "Invoice cum Bill", alignment: docx_1.AlignmentType.CENTER })],
                                            columnSpan: 2,
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: "Original / Duplicate", alignment: docx_1.AlignmentType.CENTER })],
                                            columnSpan: 2,
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `M/s. ${data.client.name}`, bold: true })] }),
                                                new docx_1.Paragraph({ text: data.client.address }),
                                                new docx_1.Paragraph({ text: `GST No. ${data.client.gstNo}` }),
                                            ],
                                            width: { size: 50, type: docx_1.WidthType.PERCENTAGE },
                                        }),
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Bill No. ${data.invoice.number}`, bold: true })] }),
                                                new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Date: ${data.invoice.date}`, bold: true })] }),
                                            ],
                                            width: { size: 25, type: docx_1.WidthType.PERCENTAGE },
                                        }),
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({ text: `Job No & Date: ${data.invoice.jobNumberAndDate}` }),
                                                new docx_1.Paragraph({ text: `Exp Inv No: ${data.invoice.exportInvoiceNumber}` }),
                                            ],
                                            width: { size: 25, type: docx_1.WidthType.PERCENTAGE },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({ text: "" }), // Spacing
                        // Items Table
                        new docx_1.Table({
                            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Sl.no", alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Details of Transport", alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Quantity", alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Rate", alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Per", alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: "Amount", alignment: docx_1.AlignmentType.CENTER })] }),
                                    ],
                                }),
                                ...data.items.map(item => new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: item.sNo.toString(), alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: item.details }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `CONTRNO: ${item.containerNo}`, bold: true })] })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: item.quantity, alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: item.rate, alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: item.per, alignment: docx_1.AlignmentType.CENTER })] }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: item.amount, bold: true })], alignment: docx_1.AlignmentType.RIGHT })] }),
                                    ],
                                })),
                                // Total Row
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "TOTAL", bold: true })] })], columnSpan: 5 }),
                                        new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: data.totalAmount, bold: true })], alignment: docx_1.AlignmentType.RIGHT })] }),
                                    ],
                                }),
                            ],
                        }),
                        new docx_1.Paragraph({ text: "" }),
                        new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Rs. ${data.totalAmountInWords}`, bold: true })] }),
                        new docx_1.Paragraph({ text: "" }),
                        new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "PAN NO. AFNPR2251J", size: 20 })] }),
                        new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "GSTN No. 33AFNPR2251J1ZA", size: 20 })] }),
                        new docx_1.Paragraph({ text: "" }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.RIGHT, children: [new docx_1.TextRun({ text: "For Shri Dhurgai Trans", bold: true })] }),
                        new docx_1.Paragraph({ text: "" }),
                        new docx_1.Paragraph({ text: "" }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.RIGHT, children: [new docx_1.TextRun({ text: data.signatoryName, bold: true })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.RIGHT, children: [new docx_1.TextRun({ text: "Authorised Signatory" })] }),
                    ],
                }],
        });
        return await docx_1.Packer.toBuffer(doc);
    }
}
exports.DocService = DocService;
