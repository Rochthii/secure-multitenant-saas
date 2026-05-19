const fs = require('fs');
const filePath = 'e:/MULTITENANT_TEMPLES/components/admin/live-theme-editor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldFunc = `function ColorField({ label, id, value, onChange, hint, compact }: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    compact?: boolean;
}) {
    return (
        <div className={compact ? '' : ''}>
            <label htmlFor={\`cf_\${id}\`} className="block text-xs font-medium text-gray-700 mb-1 leading-tight">{label}</label>
            <div className="flex gap-2 items-center">
                <div className="relative flex-shrink-0">
                    <input
                        type="color"
                        id={\`cf_\${id}\`}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-10 h-10 cursor-pointer rounded-md border border-gray-200 p-0.5 bg-white"
                        style={{ appearance: 'auto' }}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                    }}
                    className="flex-1 h-10 px-2 text-xs font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                    placeholder="#000000"
                    maxLength={7}
                />
            </div>
            {hint && <p className="text-[10px] text-gray-400 mt-1 leading-tight">{hint}</p>}
        </div>
    );
}`;

const newFunc = `function ColorField({ label, id, value, onChange, hint }: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    compact?: boolean;
}) {
    return (
        <div>
            <ColorPicker 
                label={label} 
                color={value} 
                onChange={onChange} 
            />
            {hint && <p className="text-[10px] text-gray-400 mt-1.5 leading-tight italic text-balance">{hint}</p>}
        </div>
    );
}`;

// Use split/join for replacement to avoid regex escaping issues
if (content.includes(oldFunc)) {
    content = content.replace(oldFunc, newFunc);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully replaced ColorField with ColorPicker wrapper');
} else {
    console.error('Could not find the target function in the file');
    // Try a more flexible approach if exact match fails
    const regex = /function ColorField[\s\S]*?\}\n\}/;
    if (regex.test(content)) {
        content = content.replace(regex, newFunc);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully replaced ColorField using regex');
    } else {
        process.exit(1);
    }
}
