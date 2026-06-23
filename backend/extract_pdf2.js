const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function main() {
  const buf = fs.readFileSync('C:/Users/VITUS/Downloads/nhiệm vụ - Bang_Phan_Cong_Jira_Moi.pdf');
  const parser = new PDFParse({ verbosity: 0, data: buf });
  await parser.load();
  
  const result = await parser.getText();
  result.pages.forEach((page, i) => {
    console.log(`\n====== PAGE ${i+1} ======\n`);
    console.log(page.text);
  });
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
