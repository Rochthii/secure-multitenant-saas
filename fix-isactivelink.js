const fs = require('fs');
const path = require('path');

const dir = 'e:/MULTITENANT_TEMPLES/components/layout/headers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-header.tsx'));

files.forEach(file => {
    if (['traditional-header.tsx', 'thera-header.tsx', 'ink-header.tsx'].includes(file)) return;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace modern style
    const regex1 = /const (isActiveLink|isActive) = React\.useCallback\(\(href: string\) => \{\s*if \(href === '\/'\) \{\s*return pathname === '\/';\s*\}\s*return pathname === href;\s*\}, \[pathname\]\);/g;

    const replacement = `const $1 = React.useCallback((href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname === href || pathname.startsWith(href + '/');
    }, [pathname]);`;

    if (content.match(regex1)) {
        content = content.replace(regex1, replacement);
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + file);
    } else {
        console.log('Could not match regex in ' + file);
    }
});
