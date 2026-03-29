# Invoice System - Go Backend

A high-performance invoice generation system built with Go, featuring:
- **DuckDB** for in-memory SQL processing of Excel data
- **Go-Rod** (Headless Chrome) for pixel-perfect PDF generation
- **Web UI** for easy Excel file uploads
- **Digital signing** support (placeholder for PEM-based signing)

## Prerequisites

- **Go 1.22+**
- **Google Chrome** (required for PDF generation via go-rod)

## Quick Start

### 1. Install Dependencies
```bash
go mod tidy
```

### 2. Build the Server
```bash
go build -o invoice-server ./cmd/invoice-server
```

### 3. Run the Server
```bash
./invoice-server
```

The server will start at `http://localhost:3000`

### 4. Generate an Invoice

1. Open `http://localhost:3000` in your browser
2. Upload your Excel file (`.xlsx`)
3. (Optional) Enter a Bill No to filter specific invoices
4. Click "Generate PDF"
5. The signed PDF will download automatically

## Project Structure

```
invoice-system/
├── cmd/
│   └── invoice-server/     # Main entry point
├── internal/
│   ├── db/                 # DuckDB connection & SQL queries
│   ├── models/             # Data structures
│   ├── handlers/           # HTTP request handlers
│   ├── ingestion/          # Excel → DuckDB loader
│   ├── pdf/                # PDF generation & templating
│   └── signer/             # PDF signing (placeholder)
├── web/
│   ├── index.html          # Upload interface
│   └── static/             # CSS/JS assets
├── templates/
│   └── invoice.html        # Invoice template
├── cert.pem                # Certificate for signing
├── key.pem                 # Private key for signing
└── go.mod
```

## How It Works

1. **Upload**: User uploads Excel file via web interface
2. **Ingest**: Excel data is parsed and loaded into in-memory DuckDB
3. **Query**: SQL aggregates invoice data by Bill No
4. **Render**: Go templates generate HTML from invoice data
5. **Generate**: Headless Chrome converts HTML to PDF
6. **Sign**: PDF is digitally signed (placeholder implementation)
7. **Download**: Signed PDF is returned to user

## Excel Format

Your Excel file should contain columns matching the shipment data structure:
- Date
- Customer Name
- Container No
- Size (20'/40')
- Bill No
- TPT Hire
- Halt charges
- etc.

## Notes

- **PDF Signing**: Currently uses a placeholder. To implement real signing, integrate a PDF signing library.
- **DuckDB**: In-memory database is cleared on each request for simplicity.
- **Chrome**: Ensure Chrome is installed and accessible in your PATH.

## Troubleshooting

**Build Errors**: Run `go mod tidy` to sync dependencies

**Chrome Not Found**: Install Chrome or configure go-rod to find your Chrome installation

**Port Already in Use**: Change the port in `cmd/invoice-server/main.go`
