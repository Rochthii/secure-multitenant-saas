const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSectionContent() {
    const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .or('key.ilike.%truyen-thua%,title_vi.ilike.%Truyền thừa%')
        .limit(10);

    if (error) {
        console.error('Error fetching about_sections:', error);
        return;
    }

    if (data.length === 0) {
        console.log('No matching sections found.');
        return;
    }

    data.forEach(section => {
        console.log('--- SECTION ---');
        console.log('ID:', section.id);
        console.log('Key:', section.key);
        console.log('Title (VI):', section.title_vi);
        
        const content = section.content_vi || '';
        const hasTable = content.includes('<table');
        const hasFixedImg = content.includes('width="') || content.includes('style="width');
        const longWords = content.match(/[^\s]{30,}/g);
        const hasIframe = content.includes('<iframe');

        console.log('Has Table:', hasTable);
        console.log('Has Fixed-width Image:', hasFixedImg);
        console.log('Has Iframe:', hasIframe);
        console.log('Long Words (>30 chars):', longWords);
        
        if (hasTable || hasFixedImg || longWords || hasIframe) {
            console.log('POTENTIAL OVERFLOW CONTENT DETECTED:');
            // Look for specific pixel widths
            const pixelWidths = content.match(/\d+px/g);
            console.log('Pixel widths found:', pixelWidths);
        }
    });
}

checkSectionContent();
