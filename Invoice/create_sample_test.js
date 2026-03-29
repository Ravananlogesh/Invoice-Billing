const xlsx = require('xlsx');

const data = [
  ['DATE', 'NAME OF THE CUSTOMER', 'ACCOUNT CUSTOMER', 'PICKUP FROM', 'DE/ STUFFING AT', 'PURPOSE', 'LOAD / EMPTY DROP AT', 'VEHICLE NO', 'CONTAINER NO', 'SIZE', 'BILL NO', 'TPT HIRE', 'HALT', 'ADVANCE', 'BALANCE', 'REMARKS', 'PAYMENT RECD BY ON', 'AMOUNT', 'TDS', 'BALANCE', 'TRANSPORT NAME', 'HIRE \\ DSL', 'ADV / TRIP', 'BALANCE'],
  ['01.12.2025', 'Jetway Forwarders Pvt Ltd', 'Zen Linen International Pvt Ltd', 'ACT 2', 'MEPZ', 'Export', 'CITPL', 'TN04K6999', 'FSCU5043489', 40, 2512001, 12500, null, 6500, 6000, null, null, null, null, 2500, 'Gopal SDT 6999', 10000, 10000, 0],
  ['01.12.2025', 'Jetway Forwarders Pvt Ltd', 'Zen Linen International Pvt Ltd', 'ACT 2', 'MEPZ', 'Export', 'CITPL', 'TN88B6368', 'FSCU5038184', 40, 2512002, 12500, null, 6500, 6000, null, null, null, null, 2500, 'Velu SDT 6368', 10000, 10000, 0]
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet 1');
xlsx.writeFile(wb, 'sample_data.xlsx');
console.log('Sample data created: sample_data.xlsx');
