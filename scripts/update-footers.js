const fs = require('fs');
const path = require('path');

const footersDir = 'e:/MULTITENANT_TEMPLES/components/layout/footers';
const files = fs.readdirSync(footersDir).filter(f => f.endsWith('.tsx'));

const bgMap = {
    'angkor-footer.tsx': '#2A2118',
    'festival-footer.tsx': '#12023A',
    'ink-footer.tsx': '#ffffff',
    'lotus-footer.tsx': 'linear-gradient(to bottom right, #7f1d1d, #450a0a, #000000)',
    'mcaaron-footer.tsx': '#050A14',
    'minimal-footer.tsx': '#ffffff',
    'modern-footer.tsx': 'linear-gradient(to bottom, #111827, #000000)',
    'sunrise-footer.tsx': 'linear-gradient(to bottom, #FFF5E4, #ffffff)',
    'thera-footer.tsx': '#5C432A',
    'zen-footer.tsx': '#F9FAF9'
};

for (const file of files) {
    if (!bgMap[file]) continue;
    
    const filePath = path.join(footersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find <footer className="...">
    const footerRegex = /<footer className="([^"]+)"( *)/g;
    
    content = content.replace(footerRegex, (match, classNames, spaces) => {
        // If it already has style, don't replace
        if (content.includes('var(--theme-footer-bg')) return match;
        
        const fallback = bgMap[file];
        const isGradient = fallback.includes('gradient');
        const styleProp = isGradient ? 'background' : 'backgroundColor';
        
        return `<footer className="${classNames}" style={{ ${styleProp}: 'var(--theme-footer-bg, ${fallback})' }}${spaces}`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
