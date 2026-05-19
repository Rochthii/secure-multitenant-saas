const fs = require('fs');

function checkFile(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Convert PageNode to imports
    if (content.includes('export type PageNode')) {
        let patternToReplace = /export type PageNode = \{[\s\S]*?const getLabel = [^]*?\n\}/;
        if (file.includes('festival-header.tsx')) {
            patternToReplace = /export type PageNode = \{[\s\S]*?const getLabel = [^]*?\n\}/;
        }
        
        let startIdx = content.indexOf('export type PageNode');
        let iconIdx = content.indexOf('const getIconForNavItem');
        let navLinkIdx = content.indexOf('// NavLink component');
        
        if (startIdx !== -1) {
            let endIdx = iconIdx !== -1 ? iconIdx : navLinkIdx;
            
            // Backtrack if there's comments before endIdx
            let backtrack = content.substring(0, endIdx).lastIndexOf('\n// ──');
            if (backtrack !== -1 && endIdx - backtrack < 150) {
                endIdx = backtrack;
            }
            
            if (endIdx > startIdx) {
                content = content.substring(0, startIdx) + content.substring(endIdx);
            }
        }
    }

    if (!content.includes('import { PageNode')) {
        content = content.replace("import type { CategoryNode } from '@/lib/cache/queries';", "import type { CategoryNode } from '@/lib/cache/queries';\nimport { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';");
    }
    content = content.replace(/getLabel\(/g, 'getNavLabel(');
    
    content = content.replace(/hasProjects\?: boolean\n\}/g, "hasProjects?: boolean,\n    navVisibility?: Record<string, boolean>\n}");
    content = content.replace(/hasProjects\?: boolean\r\n\}/g, "hasProjects?: boolean,\n    navVisibility?: Record<string, boolean>\n}");
    content = content.replace(/hasProjects\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects\r\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects,\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    content = content.replace(/hasProjects,\r\n\s*}: (\{|any\))/g, "hasProjects,\n    navVisibility = {}\n}: $1");
    
    content = content.replace(/const navigation = React\.useMemo\([\s\S]*?\]\);/g, 
    "const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);");

    fs.writeFileSync(file, content);
    console.log('Fixed', file);
}

checkFile('components/layout/headers/festival-header.tsx');
checkFile('components/layout/headers/lotus-header.tsx');
checkFile('components/layout/headers/mcaaron-header.tsx');

// Also remove duplicate BlockConfig in mcaaron-header
let mcaaron = fs.readFileSync('components/layout/headers/mcaaron-header.tsx', 'utf-8');
let mcCount = mcaaron.split('import { BlockConfig').length - 1;
if (mcCount > 1) {
    mcaaron = mcaaron.replace("import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';\nimport { SECTION_REGISTRY } from '@/lib/blocks-registry';\n", "");
    fs.writeFileSync('components/layout/headers/mcaaron-header.tsx', mcaaron);
    console.log('Removed duplicate BlockConfig in mcaaron');
}
