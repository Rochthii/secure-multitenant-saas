/**
 * Công cụ bóc tách văn bản từ PDF (Dharma PDF Parser)
 * 
 * Yêu cầu cài đặt: 
 * npm install pdf-parse
 * 
 * Cách dùng:
 * node scripts/pdf_to_text.js path/to/kinhsach.pdf
 * (Sẽ tạo ra một file .txt cùng tên, dùng file .txt này để ingest)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Do dùng ES Module nên cần dynamic import pdf-parse
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function parsePDF() {
    const filePath = process.argv[2];

    if (!filePath) {
        console.log('📌 Hướng dẫn: node scripts/pdf_to_text.js <path/to/file.pdf>');
        return;
    }

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Không tìm thấy file: ${filePath}`);
        return;
    }

    if (path.extname(filePath).toLowerCase() !== '.pdf') {
        console.error(`❌ Không phải file PDF: ${filePath}`);
        return;
    }

    try {
        console.log(`\n📄 Đang đọc file PDF: ${filePath}...`);
        let dataBuffer = fs.readFileSync(filePath);
        
        // Khởi tạo Parser (pdf-parse v2.4.5 dùng Class)
        const parser = new pdfParse.PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        
        let text = data.text;
        text = text.replace(/\n\s*\n/g, '\n\n'); // Dọn dẹp dòng trống thừa

        const outputFileName = path.basename(filePath, '.pdf') + '.txt';
        const outputPath = path.join(path.dirname(filePath), outputFileName);

        fs.writeFileSync(outputPath, text, 'utf8');

        console.log(`✅ Thành công!`);
        console.log(`📝 File text đã lưu tại: ${outputPath}`);
        console.log(`📊 Số trang: ${data.pages.length}`);
        console.log(`🔤 Độ dài văn bản: ${text.length} ký tự`);

        // Hủy parser để giải phóng bộ nhớ
        await parser.destroy();
    } catch (e) {
        if (e.code === 'ERR_MODULE_NOT_FOUND' || e.message.includes('pdf-parse')) {
            console.error('\n❌ Thiếu thư viện pdf-parse. Vui lòng chạy lệnh:');
            console.error('npm install pdf-parse');
        } else {
            console.error('❌ Lỗi xử lý PDF:', e);
        }
    }
}

parsePDF();
