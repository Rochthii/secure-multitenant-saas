filepath = r'e:\MULTITENANT_TEMPLES\supabase\functions\rag-chat\index.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the problematic TypeScript cast which may confuse Deno bundler
old = '              if (typeof (globalThis as any).EdgeRuntime !== "undefined") {\n                (globalThis as any).EdgeRuntime.waitUntil(dbSavePromise);\n              }'

new = '              if (typeof globalThis.EdgeRuntime !== "undefined") {\n                globalThis.EdgeRuntime.waitUntil(dbSavePromise);\n              }'

# Try CRLF version too
old_crlf = old.replace('\n', '\r\n')
new_crlf = new.replace('\n', '\r\n')

if old in content:
    content = content.replace(old, new, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS LF: Removed TypeScript cast from EdgeRuntime check")
elif old_crlf in content:
    content = content.replace(old_crlf, new_crlf, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS CRLF: Removed TypeScript cast from EdgeRuntime check")
else:
    print("Pattern not found - checking file")
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if 'EdgeRuntime' in line:
            with open(r'e:\MULTITENANT_TEMPLES\scripts\debug_output.txt', 'w', encoding='utf-8') as f:
                f.write(f"Line {i+1}: {repr(line)}\n")
            print(f"Found EdgeRuntime at line {i+1}: {repr(line[:80])}")
