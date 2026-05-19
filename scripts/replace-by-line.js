const fs = require('fs');
const filePath = 'e:/MULTITENANT_TEMPLES/components/admin/live-theme-editor.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const startLine = 530; // 0-indexed would be 529, but let's be careful
const endLine = 568; 

const newFunc = `function ColorField({ label, id, value, onChange, hint }: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    compact?: boolean;
}) {
    return (
        <div className="mb-1">
            <ColorPicker 
                label={label} 
                color={value} 
                onChange={onChange} 
            />
            {hint && <p className="text-[10px] text-gray-400 mt-1.5 leading-tight italic">{hint}</p>}
        </div>
    );
}`;

// Replace lines from 531 to 568 (1-indexed)
// lines[530] is line 531
const head = lines.slice(0, 530);
const tail = lines.slice(568);
const newContent = [...head, newFunc, ...tail].join('\n');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully replaced ColorField by line numbers');
