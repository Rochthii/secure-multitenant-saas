const fs = require('fs');
const files = fs.readdirSync('components/layout/headers').filter(f => f.endsWith('.tsx'));

const requiredImports = `import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { SearchModal } from '@/components/search/search-modal';
import { UserMenu } from '@/components/layout/user-menu';`;

for (const file of files) {
    let content = fs.readFileSync('components/layout/headers/' + file, 'utf-8');
    
    // Check if it's missing cn
    if (!content.includes('import { cn }')) {
        let inserted = false;
        if (content.includes('// NavLink component')) {
            content = content.replace('// NavLink component', requiredImports + '\n\n// NavLink component');
            inserted = true;
        } else if (content.includes('// Sub-Components')) {
            content = content.replace('// Sub-Components', requiredImports + '\n\n// Sub-Components');
            inserted = true;
        } else if (content.includes('// Ink NavLink')) {
            content = content.replace('// Ink NavLink', requiredImports + '\n\n// Ink NavLink');
            inserted = true;
        } else {
            // Find a place to inject. e.g. after the last import
            const lastImportIndex = content.lastIndexOf('import ');
            const endOfImport = content.indexOf('\n', lastImportIndex);
            if (endOfImport !== -1) {
                content = content.slice(0, endOfImport + 1) + requiredImports + '\n' + content.slice(endOfImport + 1);
                inserted = true;
            }
        }
        
        if (inserted) {
            fs.writeFileSync('components/layout/headers/' + file, content);
            console.log('Fixed imports:', file);
        }
    }
}
