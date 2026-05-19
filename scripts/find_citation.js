const fs = require('fs');
const content = fs.readFileSync('e:\\MULTITENANT_TEMPLES\\supabase\\functions\\rag-chat\\index.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('buildAcademicCitation')) {
    console.log(`Line ${i + 1}: ${line}`);
  }
});
