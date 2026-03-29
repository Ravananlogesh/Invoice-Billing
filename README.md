# Walkthrough: SHRI DHURGAI TRANS - Final Billing System v1.3.2

I have completed the precision refinement of your invoice system. The generated PDFs now match your provided "Original" sample with high fidelity.

### 1. Template Fidelity (v1.1.0)
- **Visual Match**: The `invoice.html` has been updated to match your original paper form perfectly:
    - **Client Area**: Redesigned the "M/s." section with correct spacing and font sizes.
    - **Header Segment**: Separated Bill No/Date from Job No/Exp Inv No into distinct vertical segments.
    - **Labels**: Fixed text labels like "Job No. & Date :" and "Exp Inv No." to appear exactly as per the sample.
    - **Footer**: Re-aligned the bank details and signatory area (Authorised Signatory) for a professional look.
    - **Spacing**: Increased row heights and added vertical padding to ensure the transport details look official.

### 2. Intelligent Data Mapping
- **New Fields**: The Excel parser now dynamically maps:
    - **GST No**: Automatically extracted from your Excel records and placed under the customer name.
    - **Exp Inv No**: Detected and mapped to the "Exp Inv No." field in the template.
- **Improved Parsing**: Enhanced the keyword detection to handle various column name variations for these new fields.

### 3. Stability & Professionalism
- **Manual Signing Status**: History vaulted invoices are marked as **SIGNED (MANUAL)** to reflect the updated business workflow.
- **Clear & Clean**: The "Clear All" logic is now instantaneous, allowing for effortless session resets.

### 4. Advanced Export Features (v1.2.0)
- **Customer Grouping**: Toggle "Group by Customer" in the preview to see all invoices organized by party name.
- **Merged PDFs**: Generate a single, multi-page PDF for a customer by clicking "Merge PDF" in grouped mode.
- **Word Document (.docx)**: Each row now has a "Word" button to export the invoice as a fully editable Word file.

![Advanced Features](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/test_clear_and_history_1773581762709.webp)

### 5. Backup, Preview & UI Alignment (v1.3.1)
- **Automatic Archiving**: Records older than 30 days are moved to the `backup` folder (e.g., `backup/2026-03/`).
- **Interactive Preview**: Click any row or "Details" to open a professional modal to verify data.
- **UI Alignment**: Added a dedicated **"Container No"** column to the preview table for better readability and alignment.
- **Smart Parsing**: Fixed Excel serial date parsing and improved header matching logic.

![v1.3.1 UI Alignment](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/verify_v1_0_9_final_1773582423761.webp)

---

## 📖 User Guide: How to Use the Billing Agent

Welcome! If you are new to the application, follow these steps to manage your billing workflow:

### Step 1: Start the Application (One-Click Windows)
If you are on Windows, simply double-click the **`run_invoice_system.bat`** file in the project folder. 
- It will automatically check for Node.js.
- It will install any missing components.
- It will start the server and open the application in your browser (`http://localhost:3000`).

*(If you are on Mac/manual mode, use `npm run dev` in your terminal as usual.)*

### Step 2: Upload Your Excel Data
1. On the **UPLOAD & GENERATE** tab, click the cloud icon or drag and drop your `.xlsx` transport file.
2. The system will automatically parse the headers (Date, Customer, Bill No, Container No, Amount, etc.).
3. You will see a list of records in the **"Preview Transport Data"** table.

![Step 2: Upload Interface](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/media__1773582446855.png)
*(The upload area is designed for easy drag-and-drop or click-to-browse.)*

### Step 3: Verify & Preview
1. **Details**: Click any row or the "Details" button to open a full invoice preview modal. Verify that the GST No and Export Invoice No are correctly captured.
2. **Alignment**: Check if the data values align with the columns (Date, Bill No, Customer, Container, Amount).
3. **Group by Customer**: Toggle this switch to group all invoices for a single party. This is useful for merged billing.

![Step 3: Preview Modal](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/verify_v1_0_9_final_1773582423761.webp)
*(The high-fidelity modal lets you verify all data before generation.)*

### Step 4: Generate & Export
- **PDF**: Click the blue "PDF" button to generate a professionally branded PDF.
- **Word**: Click the gray "Word" button to export the invoice as an editable `.docx` file.
- **Merge PDF**: In "Grouped" mode, click "Merge PDF" to create one single PDF containing all invoices for that customer.

![Step 4: Export Buttons](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/page_content_extended_1773590052210.png)
*(Quick actions for PDF, Word, and Grouped Merging are at your fingertips.)*

### Step 5: History & Backups
- **History Vault**: Navigate to this tab to see all previously generated bills. You can re-download them anytime.
- **Backups**: The system automatically cleans its active database once a month. To find older data, check the `/backup` folder in the project directory.

![Step 5: History Management](/Users/Logeshkumarp/.gemini/antigravity/brain/cd04a379-75f4-442e-8767-08e227796ee9/test_clear_and_history_1773581762709.webp)
*(The vault keeps all your records safe and searchable.)*

Your billing agent is now fully organized and ready for professional use!
