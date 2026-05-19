import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // SECURITY: Báº£o vá»‡ route seed báº±ng secret token
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || process.env.SEED_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const tenantId = '33333333-3333-3333-3333-333333333333';

        // 1. XÃ³a cÅ©
        await supabase.from('pages').delete().eq('tenant_id', tenantId);
        await supabase.from('about_sections').delete().eq('tenant_id', tenantId);

        // 2. Insert Sections
        const sectionLichSuId = crypto.randomUUID();
        const sectionTruyenThuaId = crypto.randomUUID();
        const sectionDiSanId = crypto.randomUUID();
        const sectionNoiQuyId = crypto.randomUUID();

        const { error: err1 } = await supabase.from('about_sections').insert([
            {
                id: sectionLichSuId,
                tenant_id: tenantId,
                key: 'dong-chay-lich-su',
                title_vi: 'DÃ’NG CHáº¢Y Lá»ŠCH Sá»¬',
                summary_vi: null,
                content_vi: `<p><b>Khá»Ÿi NguyÃªn â€” Dáº¥u áº¤n HÃ¬nh ThÃ nh (Tháº¿ ká»· XVI â€“ XVII)</b><br/>ChÃ¹a Khâ€™Leang lÃ  má»™t trong nhá»¯ng ngÃ´i chÃ¹a cá»• kÃ­nh nháº¥t cá»§a cá»™ng Ä‘á»“ng Khmer táº¡i SÃ³c TrÄƒng. Theo tÆ° liá»‡u dÃ¢n gian vÃ  cÃ¡c ghi chÃ©p Ä‘á»‹a phÆ°Æ¡ng, chÃ¹a Ä‘Æ°á»£c hÃ¬nh thÃ nh vÃ o khoáº£ng tháº¿ ká»· XVI â€“ XVII, gáº¯n liá»n vá»›i quÃ¡ trÃ¬nh Ä‘á»‹nh cÆ° cá»§a ngÆ°á»i Khmer táº¡i vÃ¹ng Ä‘áº¥t Ba XuyÃªn xÆ°a.</p><p>Ban Ä‘áº§u, chÃ¹a Ä‘Æ°á»£c dá»±ng báº±ng váº­t liá»‡u truyá»n thá»‘ng nhÆ° gá»—, tre vÃ  mÃ¡i lÃ¡. ÄÃ¢y khÃ´ng chá»‰ lÃ  nÆ¡i tu há»c cá»§a chÆ° TÄƒng mÃ  cÃ²n lÃ  trung tÃ¢m sinh hoáº¡t tÃ­n ngÆ°á»¡ng, giÃ¡o dá»¥c vÃ  vÄƒn hÃ³a cá»§a cá»™ng Ä‘á»“ng Khmer Ä‘á»‹a phÆ°Æ¡ng.</p><p><b>HÃ¬nh ThÃ nh Kiáº¿n TrÃºc Hiá»‡n Nay (Äáº§u tháº¿ ká»· XX)</b><br/>Qua nhiá»u láº§n trÃ¹ng tu vÃ  kiáº¿n táº¡o láº¡i, Ä‘áº¿n Ä‘áº§u tháº¿ ká»· XX, ngÃ´i chÃ¡nh Ä‘iá»‡n Ä‘Æ°á»£c xÃ¢y dá»±ng kiÃªn cá»‘ hÆ¡n vá»›i phong cÃ¡ch kiáº¿n trÃºc Ä‘áº·c trÆ°ng Pháº­t giÃ¡o Nam TÃ´ng Khmer. Nhá»¯ng hoa vÄƒn cháº¡m kháº¯c tinh xáº£o, mÃ¡i cong nhiá»u táº§ng vÃ  tÆ°á»£ng tháº§n Krud, ráº¯n Naga thá»ƒ hiá»‡n rÃµ áº£nh hÆ°á»Ÿng nghá»‡ thuáº­t Khmer truyá»n thá»‘ng.</p><p><b>Giai Äoáº¡n GÃ¬n Giá»¯ VÃ  PhÃ¡t Triá»ƒn</b><br/>Trong suá»‘t cÃ¡c biáº¿n Ä‘á»™ng lá»‹ch sá»­ cá»§a vÃ¹ng Ä‘áº¥t Nam Bá»™, chÃ¹a Khâ€™Leang váº«n giá»¯ vai trÃ² lÃ  trung tÃ¢m tÃ¢m linh quan trá»ng cá»§a Ä‘á»“ng bÃ o Khmer. ChÃ¹a lÃ  nÆ¡i tá»• chá»©c cÃ¡c lá»… há»™i truyá»n thá»‘ng nhÆ° Chol Chnam Thmay, Ok Om Bok vÃ  nhiá»u nghi lá»… Pháº­t giÃ¡o TheravÄda.</p><p><b>GiÃ¡ Trá»‹ Di Sáº£n</b><br/>Vá»›i giÃ¡ trá»‹ lá»‹ch sá»­, kiáº¿n trÃºc vÃ  vÄƒn hÃ³a Ä‘áº·c sáº¯c, chÃ¹a Khâ€™Leang Ä‘Ã£ Ä‘Æ°á»£c cÃ´ng nháº­n lÃ  Di tÃ­ch Kiáº¿n trÃºc Nghá»‡ thuáº­t cáº¥p Quá»‘c gia. ÄÃ¢y khÃ´ng chá»‰ lÃ  biá»ƒu tÆ°á»£ng tÃ´n giÃ¡o mÃ  cÃ²n lÃ  minh chá»©ng cho quÃ¡ trÃ¬nh giao thoa vÄƒn hÃ³a Viá»‡t â€“ Khmer táº¡i SÃ³c TrÄƒng.</p>`,
                is_active: true,
                display_order: 1
            },
            {
                id: sectionTruyenThuaId,
                tenant_id: tenantId,
                key: 'truyen-thua-tiep-noi',
                title_vi: 'TRUYá»€N THá»ªA & TIáº¾P Ná»I',
                summary_vi: 'Dáº«n dáº¯t cÃ¡c tháº¿ há»‡ Pháº­t tá»­ trÃªn con Ä‘Æ°á»ng hoáº±ng phÃ¡p vÃ  gÃ¬n giá»¯ vÄƒn hÃ³a tÃ­n ngÆ°á»¡ng cá»§a dÃ¢n tá»™c.',
                content_vi: `<p>ChÃ¹a Kh'leang tá»± hÃ o vá»›i dÃ²ng cháº£y truyá»n thá»«a kÃ©o dÃ i hÃ ng tháº¿ ká»·, Ä‘Æ°á»£c tiáº¿p ná»‘i bá»Ÿi cÃ¡c báº­c cao tÄƒng tháº¡c Ä‘á»©c. Má»—i vá»‹ sÆ° trá»¥ trÃ¬ Ä‘á»u Ä‘Ã³ng vai trÃ² quan trá»ng trong viá»‡c báº£o tá»“n ChÃ¡nh phÃ¡p Theravada vÃ  phÃ¡t triá»ƒn cá»™ng Ä‘á»“ng Pháº­t tá»­ SÃ³c TrÄƒng.</p>`,
                is_active: true,
                display_order: 2
            },
            {
                id: sectionDiSanId,
                tenant_id: tenantId,
                key: 'di-san-nghe-thuat',
                title_vi: 'DI Sáº¢N & NGHá»† THUáº¬T',
                summary_vi: 'Kiá»‡t tÃ¡c kiáº¿n trÃºc cá»• kÃ­nh hÃ²a quyá»‡n giá»¯a tinh hoa vÄƒn hoÃ¡ Khmer, Kinh vÃ  Hoa.',
                content_vi: `<p>KhuÃ´n viÃªn chÃ¹a rá»™ng lá»›n vá»›i nhiá»u cÃ¢y cá»• thá»¥ thá»‘t ná»‘t. ChÃ¡nh Ä‘iá»‡n lÃ  Ä‘á»‰nh cao cá»§a nghá»‡ thuáº­t Ä‘iÃªu kháº¯c gá»—, há»™i há»a vÃ  táº¡o hÃ¬nh Pháº­t giÃ¡o, nÆ¡i vÆ°Æ¡ng váº¥n nÃ©t Ä‘áº¹p cá»§a 3 há»‡ kiáº¿n trÃºc vÄƒn hoÃ¡ Ä‘áº·c thÃ¹.</p>`,
                is_active: true,
                display_order: 3
            },
            {
                id: sectionNoiQuyId,
                tenant_id: tenantId,
                key: 'noi-quy-tu-vien',
                title_vi: 'Ná»˜I QUY Tá»° VIá»†N',
                summary_vi: 'Nhá»¯ng quy Ä‘á»‹nh thanh quy Ä‘á»ƒ trang nghiÃªm tá»± viá»‡n',
                content_vi: `<p>Bá»•n tá»± xin thÃ´ng bÃ¡o cÃ¡c quy Ä‘á»‹nh thanh quy Ä‘áº¿n quÃ½ Pháº­t tá»­ vÃ  khÃ¡ch tháº­p phÆ°Æ¡ng...</p>`,
                is_active: true,
                display_order: 4
            }
        ]);
        if (err1) throw err1;

        // 3. Insert Pages
        const { error: err2 } = await supabase.from('pages').insert([
            {
                tenant_id: tenantId, title_vi: 'DÃ’NG CHáº¢Y Lá»ŠCH Sá»¬', slug: 'dong-chay-lich-su', content_vi: '', status: 'published', order_index: 1, show_in_menu: false
            },
            {
                tenant_id: tenantId, title_vi: 'Trá»¥ TrÃ¬ ÄÆ°Æ¡ng Nhiá»‡m', slug: 'tru-tri-duong-nhiem', content_vi: `<p>ThÃ´ng tin Trá»¥ trÃ¬ chÃ¹a Kh'leang...</p>`, status: 'published', order_index: 1, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Tá»• Chá»©c TÄƒng ÄoÃ n', slug: 'to-chuc-tang-doan', content_vi: `<p>ThÃ´ng tin TÄƒng Ä‘oÃ n chÃ¹a Kh'leang...</p>`, status: 'published', order_index: 2, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Ban ThÆ° KÃ½', slug: 'ban-thu-ky', content_vi: `<p>ThÃ´ng tin Ban thÆ° kÃ½ chÃ¹a Kh'leang...</p>`, status: 'published', order_index: 3, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Kiáº¿n TrÃºc & ÄiÃªu Kháº¯c', slug: 'kien-truc-dieu-khac', content_vi: `<p>ThÃ´ng tin Kiáº¿n trÃºc chÃ¹a Kh'leang...</p>`, status: 'published', order_index: 1, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Cá»• Váº­t & PhÃ¡p Báº£o', slug: 'co-vat-phap-bao', content_vi: `<p>Bá»™ sÆ°u táº­p Ká»¹ váº­t chÃ¹a Kh'leang...</p>`, status: 'published', order_index: 2, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Nghá»‡ Thuáº­t Truyá»n Thá»‘ng', slug: 'nghe-thuat-truyen-thong', content_vi: `<p>Nghá»‡ thuáº­t cháº¡m kháº¯c gá»—...</p>`, status: 'published', order_index: 3, show_in_menu: true
            },
            {
                tenant_id: tenantId, title_vi: 'Äá»i Sá»‘ng VÄƒn HÃ³a', slug: 'doi-song-van-hoa', content_vi: `<p>Sinh hoáº¡t MÃ¹a ChÃ´l ChnÄƒm ThmÃ¢y...</p>`, status: 'published', order_index: 4, show_in_menu: true
            }
        ]);
        if (err2) throw err2;

        return NextResponse.json({ success: true, message: 'Seeded Khleang Data successfully!' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
