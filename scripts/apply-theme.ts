import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTheme() {
    const themeSettings = {
        'theme_color_primary': '#F5A623',
        'theme_color_secondary': '#1E5631',
        'theme_color_accent': '#8E3200',
        'theme_color_text': '#1A3622',
        'theme_background_start': '#F4F9F5',
        'theme_background_end': '#E8F1EA',
        'theme_pattern_opacity': '0.05'
    };

    console.log('Applying Bodhi Green Theme to database...');

    for (const [key, value] of Object.entries(themeSettings)) {
        const { error } = await supabase.from('site_settings').upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        });

        if (error) {
            console.error(`Error updating ${key}:`, error);
        } else {
            console.log(`Updated ${key} to ${value}`);
        }
    }
    console.log('Theme applied successfully!');
}

applyTheme();
