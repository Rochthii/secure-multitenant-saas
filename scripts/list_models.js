import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    return acc;
}, {});
const apiKey = env.GEMINI_API_KEY;

async function listModels() {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    const data = await res.json();
    if (data.models) {
        data.models.forEach(m => console.log(m.name, '-', m.version, m.supportedGenerationMethods.join(', ')));
    } else {
        console.log(data);
    }
}
listModels();
