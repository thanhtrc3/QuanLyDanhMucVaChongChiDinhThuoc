const fs = require('fs');
const buf = fs.readFileSync('C:/Users/VITUS/Downloads/nhiệm vụ - Bang_Phan_Cong_Jira_Moi.pdf');
const str = buf.toString('latin1');

// Extract text between parentheses in PDF streams (basic approach)
const lines = [];
const regex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
let m;
while ((m = regex.exec(str)) !== null) {
  const text = m[1]
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
  if (text.trim()) lines.push(text);
}

// Also try TJ operator
const regexTJ = /\[((?:[^[\]]*|\[[^\]]*\])*)\]\s*TJ/g;
while ((m = regexTJ.exec(str)) !== null) {
  const inner = m[1];
  const textParts = [];
  const partRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
  let pm;
  while ((pm = partRegex.exec(inner)) !== null) {
    textParts.push(pm[1]);
  }
  if (textParts.length) lines.push(textParts.join(''));
}

console.log(lines.join('\n'));
