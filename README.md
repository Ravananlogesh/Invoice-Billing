# 📑 PROJECT MASTER: SHRI DHURGAI TRANS - INTELLIGENT BILLING AGENT

## 1️⃣ PROJECT MISSION

Build a self-hosted Node.js application that automates the transition from raw Excel transport data to a professionally branded, USB-digitally-signed A4 PDF invoice. The system must maintain a permanent history of all generated bills in a SQLite database.

---

## 2️⃣ SYSTEM ARCHITECTURE

### A. Data Input (Excel Mapping)

- **Logic:** The system must accept any `.xlsx` file and read specific columns (Date, Customer, Bill No, Container No, Amount).
- **Dynamic Mapping:** Map these headers to the `invoice.html` template variables regardless of the row count.

### B. Storage (History Vault)

- **Database:** SQLite (`vault.db`).
- **Persistence:** Every "Generate" action must append data to a `history` table.
- **Columns:** `id`, `bill_no`, `customer`, `amount`, `gen_date`, `pdf_link`, `sign_status`.

### C. PDF Engine (Puppeteer)

- **Template:** Use the provided A4 `invoice.html`.
- **Formatting:** Maintain the #002D62 (Navy Blue) and #E31E24 (Red) branding.

### D. USB Digital Signature (PKCS#11)

- **Hardware:** Interface with a physical USB Token (eMudhra/VSign).
- **Integration:** Use `node-signpdf` or a bridge to sign the PDF bytes before saving to disk.

---

## 3️⃣ USER INTERFACE (UI) SPECIFICATIONS

- **Dynamic List View:** A clean, searchable table showing data from the uploaded Excel.
- **History Tab:** A separate view to see and re-download previously generated invoices from the SQLite database.
- **Signatory Action:** A primary button for "Generate & Sign via USB".

---

## 4️⃣ COMPREHENSIVE AGENT PROMPTS (Use Step-by-Step)

### PROMPT 1: Environment & Database Setup

> "Agent, initialize a Node.js project. Create a SQLite database called `vault.db` with a table named `invoice_history`. Set up an Express server and install dependencies: `puppeteer`, `xlsx`, `sqlite3`, `handlebars`, and `node-signpdf`."

### PROMPT 2: Dynamic Excel-to-UI Logic

> "Agent, write a service to read an Excel file. Display the data in a responsive HTML table. When a row is selected, populate my `invoice.html` template with that row's data. Ensure the headers remain fixed while the content is dynamic."

### PROMPT 3: USB Signature & Persistence

> "Agent, create a function that takes the generated PDF buffer and signs it using a physical USB token (via PKCS#11). Once signed, save the file to `/output` and append the record (Bill No, Customer, Date) into the SQLite database for history tracking."

---

## 5️⃣ BRANDING RECAP

- **Company:** SHRI DHURGAI trans
- **Address:** No.33, Nellipattai High Road, Jamin Royapettai, Chromepet, Chennai - 600 044
- **Signature:** RAVI PALANI
- **Colors:** Navy Blue (#002D62), Red (#E31E24)
