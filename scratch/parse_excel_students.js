const XLSX = require('xlsx');

const workbook = XLSX.readFile('2026.xls');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  const joined = row.join(' ').trim();
  if (joined.length > 0) {
    // If row doesn't start with a number in col 2 or if col 0 or 1 has text
    const col2 = String(row[2] || '').trim();
    if (isNaN(Number(col2)) || row[0] || row[1] || i < 10) {
      console.log(`Line ${i+1}:`, row.slice(0, 6).join(' | '));
    }
  }
}
