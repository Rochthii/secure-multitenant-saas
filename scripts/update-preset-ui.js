const fs = require('fs');
const filePath = 'e:/MULTITENANT_TEMPLES/components/admin/live-theme-editor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldRegex = /\{\/\* ── Presets ─────────────────────────── \*\/\}([\s\S]*?)<div className="grid grid-cols-1 xl:grid-cols-\[1fr_320px\] gap-6">/;

const newContent = `{/* ── Presets ─────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <span>🎨</span> Bộ màu Phật giáo Premium
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                        {PRESETS.length} Themes nghiên cứu
                    </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {/* Fixed Presets */}
                    {PRESETS.map(preset => {
                        const isActive = activePreset === preset.name;
                        return (
                            <button
                                key={\`fixed_\${preset.name}\`}
                                type="button"
                                onClick={() => applyPreset(preset, false)}
                                className={\`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-300 bg-white \${isActive
                                    ? 'border-amber-400 shadow-md scale-105 ring-4 ring-amber-50'
                                    : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow hover:scale-105'
                                    }\`}
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <span className="w-7 h-7 rounded-full shadow-sm z-30" style={{ backgroundColor: preset.colors.primary }} />
                                    <span className="w-7 h-7 rounded-full shadow-sm z-20 -ml-2.5" style={{ backgroundColor: preset.colors.secondary }} />
                                    <span className="w-7 h-7 rounded-full shadow-sm z-10 -ml-2.5 border border-gray-100" style={{ backgroundColor: preset.colors.surface || preset.colors.bgStart }} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-500 truncate w-full text-center">
                                    {preset.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* Custom Presets */}
                    {customPresets.map(preset => {
                        const isActive = activePreset === \`custom_\${preset.name}\`;
                        return (
                            <div key={\`custom_\${preset.name}\`} className="relative group flex">
                                <button
                                    type="button"
                                    onClick={() => applyPreset(preset, true)}
                                    className={\`flex flex-col flex-1 items-center justify-center p-3.5 rounded-2xl border-2 border-dashed transition-all duration-300 bg-gray-50 \${isActive
                                        ? 'border-amber-400 shadow-md scale-105 ring-4 ring-amber-50'
                                        : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow hover:scale-105'
                                        }\`}
                                >
                                    <div className="flex items-center justify-center mb-3">
                                        <span className="w-7 h-7 rounded-full shadow-sm z-30" style={{ backgroundColor: preset.colors.primary }} />
                                        <span className="w-7 h-7 rounded-full shadow-sm z-20 -ml-2.5" style={{ backgroundColor: preset.colors.secondary }} />
                                        <span className="w-7 h-7 rounded-full shadow-sm z-10 -ml-2.5 border border-gray-100" style={{ backgroundColor: preset.colors.surface || preset.colors.bgStart }} />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 truncate w-full text-center">
                                        {preset.name}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomPreset(preset.name); }}
                                    className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200 z-40"
                                    title="Xóa preset này"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}

                    {/* Add New Custom Preset Button */}
                    <div className="relative flex items-center justify-center">
                        {!isAddingPreset ? (
                            <button
                                type="button"
                                onClick={() => setIsAddingPreset(true)}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all w-full h-full min-h-[90px]"
                                title="Lưu bộ màu hiện tại thành một Preset mới"
                            >
                                <span className="text-2xl mb-1">+</span>
                                <span className="text-[10px] font-medium text-center text-gray-500">Lưu Preset</span>
                            </button>
                        ) : (
                            <div className="absolute top-0 left-0 flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-amber-300 shadow-xl z-50" style={{ width: '220px' }}>
                                <p className="text-xs font-semibold text-gray-700">Lưu bộ màu mới</p>
                                <input
                                    type="text"
                                    placeholder="Tên preset (VD: Mùa An Cư)"
                                    value={newPresetName}
                                    onChange={e => setNewPresetName(e.target.value)}
                                    className="text-xs px-2.5 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveAsPreset())}
                                />
                                <div className="flex gap-1.5 mt-1">
                                    <button
                                        type="button"
                                        onClick={handleSaveAsPreset}
                                        disabled={!newPresetName.trim()}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded text-[11px] font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddingPreset(false); setNewPresetName(''); }}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 rounded text-[11px] font-semibold transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Color Pickers + Live Preview ─────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">`;

if (oldRegex.test(content)) {
    content = content.replace(oldRegex, newContent);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated the presets UI');
} else {
    console.log('Regex did not match');
    process.exit(1);
}
