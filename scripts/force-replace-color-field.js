const fs = require('fs');
const filePath = 'e:/MULTITENANT_TEMPLES/components/admin/live-theme-editor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Use a more robust regex to match the ColorField function after signature was partially updated
const regex = /function ColorField\(\{ label, id, value, onChange, hint \}: \{[\s\S]*?\}\n\}/;

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

if (regex.test(content)) {
    content = content.replace(regex, newFunc);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully replaced ColorField using regex script');
} else {
    // Try without specific parameters in signature if it changed slightly
    const flexibleRegex = /function ColorField[\s\S]*?\}\n\}/;
    if (flexibleRegex.test(content)) {
        content = content.replace(flexibleRegex, newFunc);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully replaced ColorField using flexible regex script');
    } else {
        console.error('FAILED: Could not find ColorField function with any regex');
        process.exit(1);
    }
}
