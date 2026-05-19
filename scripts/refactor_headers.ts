import fs from 'fs';
import path from 'path';

const headersDir = path.join(process.cwd(), 'components/layout/headers');

const files = fs.readdirSync(headersDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    if (file === 'minimal-header.tsx' || file === 'traditional-header.tsx' || file === 'thera-header.tsx') {
        // Skip those we already touched or might be slightly different. We'll do them manually if needed.
        // Wait, NO, we should do ALL files that have getNavigation. traditional and thera were updated in the previous task, maybe they don't have the exactly same structure?
        // Actually, we can process all if they match the pattern.
    }
    const filePath = path.join(headersDir, file);
    let originalContent = fs.readFileSync(filePath, 'utf-8');
    let content = originalContent;

    // Check if it has export type PageNode
    if (!content.includes('export type PageNode')) continue;

    // 1. Remove export type PageNode = { ... };
    const pageNodeRegex = /export type PageNode = \{[\s\S]*?\};\n+/;
    content = content.replace(pageNodeRegex, '');

    // 2. Remove export type NavItem = { ... };
    const navItemRegex = /export type NavItem = \{[\s\S]*?\};\n+/;
    content = content.replace(navItemRegex, '');

    // 3. Remove mapCategoryToNavItem
    const mapCatRegex = /\/\/\s*Hàm tiện ích chuyển[\s\S]*?const mapCategoryToNavItem = [\s\S]*?\};\n+/;
    content = content.replace(mapCatRegex, '');

    // 4. Remove getNavigation
    // It is a big function. Let's find "const getNavigation =" and the first "const getLabel =" or "const NavLink ="
    // Since getNavigation returns NavItem[], we can use a more robust split.
    const startStr = 'const getNavigation = (';
    const endStrOptions = ['// Hàm lấy tên hiển thị', 'const getLabel', 'const getNavLabel', '// NavLink', 'const NavLink'];

    const startIndex = content.indexOf(startStr);
    if (startIndex !== -1) {
        let endIndex = -1;
        for (const opt of endStrOptions) {
            const idx = content.indexOf(opt, startIndex);
            if (idx !== -1) {
                if (endIndex === -1 || idx < endIndex) {
                    endIndex = idx;
                }
            }
        }
        if (endIndex !== -1) {
            // Also remove the "─────────────────────────────────────────────────\n// Navigation data structure builder\n// ─────────────────────────────────────────────────\n" if exists before startStr
            const chunkToRemove = content.substring(startIndex, endIndex);
            content = content.replace(chunkToRemove, '');
        }
    }

    // 5. Remove getLabel if exists
    const getLabelStart = content.indexOf('const getLabel = (');
    if (getLabelStart !== -1) {
        let endIndex = content.indexOf('// ─────────────────────────────────────────────────', getLabelStart);
        if (endIndex === -1) endIndex = content.indexOf('const NavLink', getLabelStart);
        if (endIndex !== -1) {
            content = content.replace(content.substring(getLabelStart, endIndex), '');
        }
    }

    // 6. Replace getLabel( with getNavLabel(
    content = content.replace(/getLabel\(/g, 'getNavLabel(');

    // 7. Add Imports
    // Find import { Button } or import type { CategoryNode } to insert after
    const importRegex = /import type \{ CategoryNode \} from '@\/lib\/cache\/queries';/;
    if (content.match(importRegex)) {
        content = content.replace(importRegex, "import type { CategoryNode } from '@/lib/cache/queries';\nimport { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';");
    } else {
        // Fallback
        content = content.replace(/import { cn } from '@\/lib\/utils';/, "import { cn } from '@/lib/utils';\nimport { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';");
    }

    // 8. Add navVisibility to props
    content = content.replace(/hasProjects\?: boolean\n\}\)/g, "hasProjects?: boolean,\n    navVisibility?: Record<string, boolean>\n})");
    content = content.replace(/hasProjects\n\}: \{/g, "hasProjects,\n    navVisibility = {}\n}: {");

    // 9. Update useMemo
    const useMemoRegex = /const navigation = React\.useMemo[\s\S]*?\]\);/;
    if (content.match(useMemoRegex)) {
        content = content.replace(useMemoRegex, "const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);");
    }

    if (originalContent !== content) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Refactored:', file);
    }
}
