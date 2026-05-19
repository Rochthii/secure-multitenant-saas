
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function cleanupAndFix() {
    const tenants = [
        '55555555-5555-5555-5555-555555555555', // Chantarangsay
        '22222222-2222-2222-2222-222222222222', // Phù Ly
        '44444444-4444-4444-4444-444444444444', // Hộ Phòng Cũ
        '33333333-3333-3333-3333-333333333333'  // Kh'leang
    ];

    console.log('🧹 Bắt đầu đồng bộ ĐA MODULE (Bản chuẩn xác nhất)...');

    const modules = ['news', 'dharma', 'documents', 'transactions'];

    const masterTree: any[] = [
        // --- NEWS (Theo schema trước đó) ---
        {
            name: 'Phật Sự & Hoằng Pháp',
            module: 'news',
            children: [
                {
                    name: 'Phật Sự Đối Ngoại',
                    children: [
                        { name: 'Quan hệ quốc tế' },
                        { name: 'Đạo Pháp & Dân Tộc' },
                        { name: 'Giáo Hội & Hệ Phái' },
                        { name: 'Giao Lưu Văn Hóa - Học Thuật' }
                    ]
                },
                {
                    name: 'Tăng Sự Thống Nhất',
                    children: [
                        { name: 'Thời Khóa Tụng Kinh' },
                        { name: 'Nghi Lễ Định Kỳ' },
                        { name: 'Tăng Sự Nội Viện' },
                        { name: ' Tiếp Đón & Tư Vấn Tâm Linh' }
                    ]
                }
            ]
        },
        {
            name: 'Văn Hóa Truyền Thống Khmer',
            module: 'news',
            children: [
                { name: 'Tin Tức Lễ Hội' },
                { name: 'Hoạt Động Nghệ Thuật & Ngôn Ngữ' },
                { name: 'Đời Sống Cộng Đồng' },
                { name: 'Người Giữ Hồn Văn Hóa' }
            ]
        },
        { name: 'An Sinh Xã Hội', module: 'news' },
        {
            name: 'Giáo Dục & Học Thuật',
            module: 'news',
            children: [
                { name: 'Giáo Dục Tự Viện - Dạy Chữ Khmer' },
                { name: 'Hội Nghị & Tham Luận' },
                { name: 'Sách & Ấn Phẩm' }
            ]
        },
        { name: 'Thông Báo & Chỉ Dẫn', module: 'news' },

        // --- DHARMA (Pháp thoại) - NEW PRECISE STRUCTURE ---
        {
            name: 'Ký sự Truyền hình',
            module: 'dharma',
            children: [
                { name: 'Hành trình Hoằng pháp' },
                { name: 'Đời sống Thiền môn' },
                { name: 'Phóng sự Văn hóa Khmer' },
                { name: 'Talkshow & Tọa đàm Truyền hình' }
            ]
        },
        { name: 'Phật giáo & Đời sống', module: 'dharma' },
        { name: 'Kinh Nhật tụng', module: 'dharma' },
        {
            name: 'Quảng giải Phật học',
            module: 'dharma',
            children: [
                { name: 'Khám phá Tam tạng Kinh' },
                { name: 'Ý nghĩa Kinh Nhật tụng' },
                { name: 'Thiền Vipassana' }
            ]
        },

        // --- DOCUMENTS (Tài liệu số) - NEW PRECISE STRUCTURE ---
        {
            name: 'Kinh Tạng Số',
            module: 'documents',
            children: [
                { name: 'Tam Tạng Kinh' },
                { name: 'Tư Liệu Ngôn Ngữ' },
                { name: 'Kinh Tụng & Nghi Thức' },
                { name: 'Sơ Giải Thuật Ngữ' }
            ]
        },
        {
            name: 'Tri Thức Khmer',
            module: 'documents',
            children: [
                { name: 'Ngôn Ngữ & Chữ Viết' },
                { name: 'Di Sản Văn Hóa' },
                { name: 'Nghi Lễ & Phong Tục' },
                { name: 'Nghệ Thuật & Kiến Trúc' }
            ]
        },
        { name: 'Văn Kiện Học Thuật', module: 'documents' },
        { name: 'Văn Kiện Chính Sử', module: 'documents' },
        { name: 'Kỷ Yếu', module: 'documents' },

        // --- DONATIONS ---
        {
            name: 'Cúng Dường',
            module: 'transactions',
            children: [
                { name: 'Công Đức Ghi Danh' },
                { name: 'Hạng Mục Dự Án' },
                { name: 'Đang Triển Khai' },
                { name: 'Đã Hoàn Thành' }
            ]
        }
    ];

    function createSlug(text: string) {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    async function insertNode(tid: string, node: any, parentId: string | null = null, mod: string) {
        const currentMod = node.module || mod;
        const baseSlug = createSlug(node.name);
        const slug = `${baseSlug}-${tid.split('-')[0]}`;

        const { data, error } = await supabase.from('categories').insert({
            tenant_id: tid,
            name_vi: node.name,
            name_km: node.name,
            name_en: node.name,
            slug: slug,
            module: currentMod,
            type: currentMod === 'transactions' ? 'news' : (currentMod === 'documents' || currentMod === 'dharma' ? 'media' : 'news'),
            parent_id: parentId,
            order_position: 0
        }).select('id').single();

        if (error) {
            console.error(`Error ${node.name} for ${tid}:`, error.message);
            return;
        }

        if (node.children) {
            for (const child of node.children) {
                await insertNode(tid, child, data.id, currentMod);
            }
        }
    }

    for (const tid of tenants) {
        console.log(`🚀 Processing tenant: ${tid}`);
        await supabase.from('categories').delete().eq('tenant_id', tid).in('module', modules);
        for (const root of masterTree) {
            await insertNode(tid, root, null, root.module);
        }
    }

    console.log('🎉 Đã đồng bộ cấu trúc CHUẨN XÁC cho 4 chi nhánh!');
}

cleanupAndFix();
