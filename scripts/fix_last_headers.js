const fs = require('fs');

function fixHeader(filePath, hasGetIcon) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Add imports if missing
    if (!content.includes('import { PageNode, NavItem, buildNavigation, getNavLabel } from')) {
        content = content.replace(
            "import type { CategoryNode } from '@/lib/cache/queries';",
            "import type { CategoryNode } from '@/lib/cache/queries';\nimport { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';"
        );
    }

    // Slice out the old definitions
    const startIdx = content.indexOf('export type PageNode = {');
    // If MCAaron or something that doesn't have PageNode, we fall back to something else
    let endIdx = -1;
    
    if (hasGetIcon) {
        endIdx = content.indexOf('const getIconForNavItem');
    } else {
        endIdx = content.indexOf('// ─────────────────────────────────────────────────\n// NavLink component');
        if (endIdx === -1) {
            endIdx = content.indexOf('const NavLink = React.memo(');
        }
    }

    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + content.substring(endIdx);
    } else if (startIdx === -1) {
        // Fallback for files that don't export PageNode but still have getNavigation
        const getNavStart = content.indexOf('const getNavigation = (');
        if (getNavStart !== -1 && endIdx !== -1) {
            content = content.substring(0, getNavStart) + content.substring(endIdx);
        }
    }

    // Replace getLabel with getNavLabel
    content = content.replace(/getLabel\(/g, 'getNavLabel(');

    // Update props in the component definition
    content = content.replace(/hasProjects\?: boolean\n\}/g, "hasProjects?: boolean,\n    navVisibility?: Record<string, boolean>\n}");
    content = content.replace(/hasProjects\?: boolean\r\n\}/g, "hasProjects?: boolean,\n    navVisibility?: Record<string, boolean>\n}");
    content = content.replace(/hasProjects\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects\r\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects,\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects,\r\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");

    // Replace useMemo
    content = content.replace(
        /const navigation = React\.useMemo\([\s\S]*?\]\);/g,
        "const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);"
    );

    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath);
}

fixHeader('components/layout/headers/festival-header.tsx', true);
fixHeader('components/layout/headers/lotus-header.tsx', false);
fixHeader('components/layout/headers/mcaaron-header.tsx', false);

// Also remove duplicate BlockConfig in mcaaron-header if it exists
let mcaaron = fs.readFileSync('components/layout/headers/mcaaron-header.tsx', 'utf-8');
const searchStr = "import { BlockConfig";
let firstIdx = mcaaron.indexOf(searchStr);
if (firstIdx !== -1) {
    let secondIdx = mcaaron.indexOf(searchStr, firstIdx + 1);
    if (secondIdx !== -1) {
        // Find the end of the second import block
        let endImport = mcaaron.indexOf(';', secondIdx);
        if (endImport !== -1) {
            mcaaron = mcaaron.substring(0, secondIdx) + mcaaron.substring(endImport + 1);
            fs.writeFileSync('components/layout/headers/mcaaron-header.tsx', mcaaron);
            console.log('Removed duplicate import in mcaaron');
        }
    }
}
