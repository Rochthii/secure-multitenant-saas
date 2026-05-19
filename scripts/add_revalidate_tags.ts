import { Project, SyntaxKind, Block, CallExpression } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('app/actions/admin/*.ts');

function ensureRequireModule(sourceFile: any, moduleName: string, namedImport: string) {
    const importDecls = sourceFile.getImportDeclarations();
    const targetImport = importDecls.find((decl: any) => decl.getModuleSpecifierValue() === moduleName);

    if (!targetImport) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: moduleName,
            namedImports: [namedImport]
        });
    } else {
        const hasNamed = targetImport.getNamedImports().some((n: any) => n.getName() === namedImport);
        if (!hasNamed) {
            targetImport.addNamedImport(namedImport);
        }
    }
}

for (const sourceFile of project.getSourceFiles()) {
    const fileName = sourceFile.getBaseName();
    let modified = false;

    // Define cache tags mapping
    const TAG_MAP: Record<string, string[]> = {
        'about-sections.ts': ['about-sections'],
        'dharma-talks.ts': ['dharma-talks', 'media'],
        'transaction-projects.ts': ['transaction_projects'],
        'transaction-purposes.ts': ['transaction_purposes'],
        'transactions.ts': ['transaction_projects', 'recent_transactions', 'confirmed_transactions'],
        'events.ts': ['events', 'events-list'],
        'hero-slides.ts': ['hero-slides'],
        'news.ts': ['news', 'news-list'],
        'pages.ts': ['pages'],
        'settings.ts': ['site_settings', 'tenant-config'],
        'site-settings.ts': ['site_settings'],
    };

    const tags = TAG_MAP[fileName];
    if (!tags) continue;

    ensureRequireModule(sourceFile, 'next/cache', 'revalidateTag');

    const functions = sourceFile.getFunctions();
    for (const func of functions) {
        if (!func.isExported() || !func.isAsync()) continue;

        const body = func.getBody();
        if (body && body.isKind(SyntaxKind.Block)) {

            // FIND ALL revalidateTag calls. If they are just typical exact string matches of the general tags, REPLACE the block.
            const callExprs = body.getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter(c => c.getExpression().getText() === 'revalidateTag');

            // If it already has our template snippet, skip
            if (body.getText().includes('--- SURGICAL REVALIDATION ---')) {
                continue;
            }

            if (callExprs.length > 0) {
                // Remove existing `revalidateTag` Statements
                const statementsToRemove = new Set();
                callExprs.forEach(c => {
                    const stmt = c.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
                    if (stmt) statementsToRemove.add(stmt);
                });

                // Get insertion index and block from the LAST existing revalidateTag call
                const lastCall = callExprs[callExprs.length - 1];
                const targetStmt = lastCall.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);

                if (targetStmt) {
                    const parentBlock = targetStmt.getParent();
                    if (parentBlock && parentBlock.isKind(SyntaxKind.Block)) {
                        const stmtIndex = parentBlock.getStatements().indexOf(targetStmt);

                        // Now remove existing statements
                        Array.from(statementsToRemove).forEach((stmt: any) => stmt.remove());

                        // Re-calculate since elements shifted, but we can just append after `revalidatePath` if we find it.
                        // Actually, removing shifts the indices. So let's find `revalidatePath`.
                        const pathCallExprs = parentBlock.getDescendantsOfKind(SyntaxKind.CallExpression)
                            .filter(c => c.getExpression().getText() === 'revalidatePath');

                        let newStmtIndex = parentBlock.getStatements().length - 1; // Fallback to end
                        if (pathCallExprs.length > 0) {
                            const lastPathCall = pathCallExprs[pathCallExprs.length - 1];
                            const pathStmt = lastPathCall.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
                            if (pathStmt) {
                                newStmtIndex = parentBlock.getStatements().indexOf(pathStmt) + 1;
                            }
                        }

                        const injectLines = [];
                        if (['settings.ts', 'site-settings.ts'].includes(fileName)) {
                            tags.forEach(t => {
                                injectLines.push(`        revalidateTag('${t}');`);
                            });
                        } else {
                            injectLines.push(`        // --- SURGICAL REVALIDATION ---`);
                            // ignore lines and const declaration inside a block
                            injectLines.push(`        {`);
                            injectLines.push(`          // @ts-ignore`);
                            injectLines.push(`          const _tId = typeof newsData !== 'undefined' ? (newsData as any)?.tenant_id : `);
                            injectLines.push(`                       typeof updateData !== 'undefined' ? (updateData as any)?.tenant_id : `);
                            injectLines.push(`                       typeof oldData !== 'undefined' && oldData ? (oldData as any)?.tenant_id : `);
                            injectLines.push(`                       typeof data !== 'undefined' && data ? (data as any)?.tenant_id : `);
                            injectLines.push(`                       typeof payload !== 'undefined' && payload ? (payload as any)?.tenant_id : null;`);
                            injectLines.push(`          if (_tId) {`);
                            tags.forEach(t => {
                                injectLines.push(`              revalidateTag(\`${t}-\${_tId}\`);`);
                            });
                            injectLines.push(`              revalidateTag('dashboard-stats');`);
                            injectLines.push(`          } else {`);
                            tags.forEach(t => {
                                injectLines.push(`              revalidateTag('${t}-all');`);
                            });
                            injectLines.push(`              revalidateTag('dashboard-stats');`);
                            injectLines.push(`          }`);
                            injectLines.push(`        }`);
                        }

                        parentBlock.insertStatements(newStmtIndex, injectLines.join('\n'));
                        modified = true;
                    }
                }
            } else {
                // Try inserting after revalidatePath if no revalidateTag calls found earlier.
                const pathCallExprs = body.getDescendantsOfKind(SyntaxKind.CallExpression)
                    .filter(c => c.getExpression().getText() === 'revalidatePath');
                if (pathCallExprs.length > 0) {
                    const lastCall = pathCallExprs[pathCallExprs.length - 1];
                    const stmt = lastCall.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);

                    if (stmt) {
                        const parentBlock = stmt.getParent();
                        if (parentBlock && parentBlock.isKind(SyntaxKind.Block)) {
                            const stmtIndex = parentBlock.getStatements().indexOf(stmt);
                            const injectLines = [];

                            if (['settings.ts', 'site-settings.ts'].includes(fileName)) {
                                tags.forEach(t => {
                                    injectLines.push(`        revalidateTag('${t}');`);
                                });
                            } else {
                                injectLines.push(`        // --- SURGICAL REVALIDATION ---`);
                                injectLines.push(`        {`);
                                injectLines.push(`          // @ts-ignore`);
                                injectLines.push(`          const _tId = typeof newsData !== 'undefined' ? (newsData as any)?.tenant_id : `);
                                injectLines.push(`                       typeof updateData !== 'undefined' ? (updateData as any)?.tenant_id : `);
                                injectLines.push(`                       typeof oldData !== 'undefined' && oldData ? (oldData as any)?.tenant_id : `);
                                injectLines.push(`                       typeof data !== 'undefined' && data ? (data as any)?.tenant_id : `);
                                injectLines.push(`                       typeof payload !== 'undefined' && payload ? (payload as any)?.tenant_id : null;`);
                                injectLines.push(`          if (_tId) {`);
                                tags.forEach(t => {
                                    injectLines.push(`              revalidateTag(\`${t}-\${_tId}\`);`);
                                });
                                injectLines.push(`              revalidateTag('dashboard-stats');`);
                                injectLines.push(`          } else {`);
                                tags.forEach(t => {
                                    injectLines.push(`              revalidateTag('${t}-all');`);
                                });
                                // Dashboard cache revalidates the generic stat, although probably tenant specific inside.
                                injectLines.push(`              revalidateTag('dashboard-stats');`);
                                injectLines.push(`          }`);
                                injectLines.push(`        }`);
                            }

                            parentBlock.insertStatements(stmtIndex + 1, injectLines.join('\n'));
                            modified = true;
                        }
                    }
                }
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
        console.log(`Updated ${fileName}`);
    }
}
