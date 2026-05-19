import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const keyMap = {
        'lich-su': 'dong-chay-lich-su',
        'truyen-thua': 'truyen-thua-tiep-noi',
        'truyen-thua/tru-tri': 'truyen-thua-tiep-noi/tru-tri-duong-nhiem',
        'truyen-thua/tang-doan': 'truyen-thua-tiep-noi/to-chuc-tang-doan',
        'truyen-thua/thu-ky': 'truyen-thua-tiep-noi/ban-thu-ky',
        'di-san': 'di-san-nghe-thuat',
        'di-san/kien-truc': 'di-san-nghe-thuat/kien-truc-dieu-khac',
        'di-san/co-vat': 'di-san-nghe-thuat/co-vat-phap-bao',
        'di-san/nghe-thuat': 'di-san-nghe-thuat/nghe-thuat-truyen-thong',
        'di-san/van-hoa': 'di-san-nghe-thuat/doi-song-van-hoa',
    };

    for (const [oldKey, newKey] of Object.entries(keyMap)) {
        const { error } = await supabase
            .from('about_sections')
            .update({ key: newKey })
            .eq('key', oldKey);
        
        if (error) {
            console.error(`Error updating ${oldKey} to ${newKey}:`, error);
        } else {
            console.log(`Successfully updated ${oldKey} to ${newKey} globally`);
        }
    }
}

main();
