const fs = require('fs');
const filePath = 'e:/MULTITENANT_TEMPLES/components/admin/live-theme-editor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the presets by adding headerBg: '', footerBg: '' to all of them
content = content.replace(/patternOpacity: '[^']+',/g, match => `${match} headerBg: '', footerBg: '',`);

// Inject UI fields for Header and Footer Background
const uiInjection = `
                    {/* Row 5: Custom Header & Footer Background */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">📐 Tùy chỉnh Nền Header & Footer</p>
                        <p className="text-[10px] text-gray-400 mb-3">Chỉ đặt khi bạn không muốn dùng màu nền mặc định của Giao diện (Theme).</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorField label="Nền Header" id="headerBg" value={colors.headerBg} onChange={v => setColor('headerBg', v)}
                                hint="Ví dụ: #000000 hoặc để trống" />
                            <ColorField label="Nền Footer" id="footerBg" value={colors.footerBg} onChange={v => setColor('footerBg', v)}
                                hint="Ví dụ: #FFFFFF hoặc để trống" />
                        </div>
                    </div>
`;

content = content.replace('{/* Auto-derived display */}', uiInjection + '\n                    {/* Auto-derived display */}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed lints and added UI in live-theme-editor.tsx');
