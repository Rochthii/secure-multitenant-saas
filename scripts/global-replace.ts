import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filePath: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else {
            if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
                callback(dirPath);
            }
        }
    });
}

function replaceInFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Simple textual replacements
    content = content.replace(/Phước điền/g, 'Thanh toán');
    content = content.replace(/Phước Điền/g, 'Thanh toán');
    content = content.replace(/phước điền/g, 'thanh toán');
    
    content = content.replace(/Cúng dường/g, 'Đóng góp');
    content = content.replace(/Cúng Dường/g, 'Đóng góp');
    content = content.replace(/cúng dường/g, 'đóng góp');
    
    content = content.replace(/Quyên góp/g, 'Đóng góp Quỹ');
    content = content.replace(/Quyên Góp/g, 'Đóng góp Quỹ');
    content = content.replace(/quyên góp/g, 'đóng góp quỹ');
    
    content = content.replace(/Công đức/g, 'Thành tích');
    content = content.replace(/Công Đức/g, 'Thành tích');
    content = content.replace(/công đức/g, 'thành tích');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

walk('./app', replaceInFile);
walk('./components', replaceInFile);
