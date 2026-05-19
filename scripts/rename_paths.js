const fs = require('fs');
const cp = require('child_process');

try {
    fs.renameSync('e:/PTIT_THESIS_SAAS/components/admin/temple-sidebar.tsx', 'e:/PTIT_THESIS_SAAS/components/admin/business-sidebar.tsx');
    console.log('Renamed temple-sidebar.tsx to business-sidebar.tsx');
} catch (e) {
    console.error('Failed to rename sidebar:', e.message);
}

try {
    cp.execSync('xcopy e:\\PTIT_THESIS_SAAS\\app\\admin\\t\\[temple_id] e:\\PTIT_THESIS_SAAS\\app\\admin\\t\\[tenant_id] /E /I');
    console.log('Copied to [tenant_id].');
    // cp.execSync('rmdir /S /Q e:\\PTIT_THESIS_SAAS\\app\\admin\\t\\[temple_id]'); // leave deletion manual if locked
} catch (e2) {
    console.error('Copy failed:', e2.message);
}
