const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    if (file.includes('node_modules') || file.includes('.next') || file.includes('.git') || file.includes('.agent')) {
                        if (!--pending) callback(null);
                        return;
                    }
                    walk(file, function(err, res) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.match(/\.(ts|tsx|md|json|sql)$/)) {
                        let content = fs.readFileSync(file, 'utf8');
                        let newContent = content
                            .replace(/templeId/g, 'tenantId')
                            .replace(/temple_id/g, 'tenant_id')
                            .replace(/temple-sidebar/g, 'business-sidebar')
                            .replace(/TempleSidebar/g, 'BusinessSidebar');
                        if (content !== newContent) {
                            fs.writeFileSync(file, newContent, 'utf8');
                            console.log('Updated', file);
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk('./', function(err) {
    if (err) throw err;
    console.log('Replacement complete');
});
