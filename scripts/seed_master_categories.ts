import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // must use service key for raw db writes
const supabase = createClient(supabaseUrl, supabaseKey);

const MASTER_TENANT_ID = '55555555-5555-5555-5555-555555555555';

interface SeedNode {
    name_vi: string;
    slug: string;
    children?: SeedNode[];
}

const newsTree: SeedNode[] = [
    { name_vi: 'Phật Sự & Hoằng Pháp', slug: 'phat-su-hoang-phap' },
    { name_vi: 'Văn Hóa Truyền Thống Khmer', slug: 'van-hoa-truyen-thong-khmer' },
    { name_vi: 'An Sinh Xã Hội', slug: 'an-sinh-xa-hoi' },
    { name_vi: 'Giáo Dục & Học Thuật', slug: 'giao-duc-hoc-thuat' },
    { name_vi: 'Thông Báo & Chỉ Dẫn', slug: 'thong-bao-chi-dan' },
];

const dharmaTree: SeedNode[] = [
    {
        name_vi: 'Ký Sự Truyền Hình', slug: 'ky-su-truyen-hinh', children: [
            { name_vi: 'Hành Trình Hoằng Pháp', slug: 'hanh-trinh-hoang-phap' },
            { name_vi: 'Đời Sống Thiền Môn', slug: 'doi-song-thien-mon' },
            { name_vi: 'Phóng Sự Văn Hóa Khmer', slug: 'phong-su-van-hoa-khmer' },
            { name_vi: 'Talkshow & Tọa Đàm Truyền Hình', slug: 'talkshow-toa-dam-truyen-hinh' },
        ]
    },
    { name_vi: 'Phật Giáo & Đời Sống', slug: 'phat-giao-doi-song' },
    { name_vi: 'Kinh Nhật Tụng', slug: 'kinh-nhat-tung' },
    {
        name_vi: 'Giảng Giải Phật Học', slug: 'giang-giai-phat-hoc', children: [
            { name_vi: 'Khám Phá Tam Tạng Kinh', slug: 'kham-pha-tam-tang-kinh' },
            { name_vi: 'Ý Nghĩa Kinh Nhật Tụng', slug: 'y-nghia-kinh-nhat-tung' },
            { name_vi: 'Thiền Vipassana', slug: 'thien-vipassana' },
            { name_vi: 'Từ Điển Phật Học', slug: 'tu-dien-phat-hoc' },
        ]
    },
];

const documentsTree: SeedNode[] = [
    {
        name_vi: 'Kinh Tạng Số', slug: 'kinh-tang-so', children: [
            { name_vi: 'Tam Tạng Kinh', slug: 'tam-tang-kinh' },
            { name_vi: 'Từ Liệu Ngôn Ngữ', slug: 'tu-lieu-ngon-ngu' },
            { name_vi: 'Kinh Tụng & Nghi Thức', slug: 'kinh-tung-nghi-thuc' },
            { name_vi: 'Sơ Giải Thuật Ngữ', slug: 'so-giai-thuat-ngu' },
        ]
    },
    {
        name_vi: 'Tri Thức Khmer', slug: 'tri-thuc-khmer', children: [
            { name_vi: 'Ngôn Ngữ & Chữ Viết', slug: 'ngon-ngu-chu-viet' },
            { name_vi: 'Di Sản Văn Hóa', slug: 'di-san-van-hoa' },
            { name_vi: 'Nghi Lễ & Phong Tục', slug: 'nghi-le-phong-tuc' },
            { name_vi: 'Nghệ Thuật & Kiến Trúc', slug: 'nghe-thuat-kien-truc' },
        ]
    },
    { name_vi: 'Văn Kiện Học Thuật', slug: 'van-kien-hoc-thuat' },
    { name_vi: 'Văn Kiện Chính Sử', slug: 'van-kien-chinh-su' },
    { name_vi: 'Kỷ Yếu', slug: 'ky-yeu' },
];

async function seedModule(moduleName: string, tree: SeedNode[]) {
    console.log(`\n--- Seeding module: ${moduleName} ---`);

    // First delete old categories for this module from the master tenant to avoid duplicates and ensure perfect mapping
    const { error: delError } = await supabase
        .from('categories')
        .delete()
        .eq('tenant_id', MASTER_TENANT_ID)
        .eq('module', moduleName);

    if (delError) {
        console.error(`Error deleting old categories for ${moduleName}:`, delError);
    } else {
        console.log(`Deleted existing categories for ${moduleName}`);
    }

    async function insertNode(node: SeedNode, parentId: string | null) {
        const id = crypto.randomUUID();
        const typeMap: Record<string, string> = {
            'news': 'article',
            'dharma': 'video',
            'documents': 'document',
        };

        const { error } = await supabase.from('categories').insert({
            id,
            tenant_id: MASTER_TENANT_ID,
            module: moduleName,
            type: typeMap[moduleName] || 'post',
            name_vi: node.name_vi,
            slug: node.slug,
            parent_id: parentId,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(`Failed to insert ${node.name_vi}:`, error.message);
        } else {
            console.log(`Inserted: ${node.name_vi}`);
        }

        if (node.children) {
            // small delay to preserve chronological order for insertion sorting
            for (const child of node.children) {
                await new Promise(r => setTimeout(r, 100));
                await insertNode(child, id);
            }
        }
    }

    for (const node of tree) {
        await new Promise(r => setTimeout(r, 100));
        await insertNode(node, null);
    }
}

async function run() {
    console.log('Starting seed for Master Tenant...');
    await seedModule('news', newsTree);
    await seedModule('dharma', dharmaTree);
    await seedModule('documents', documentsTree);
    console.log('\nSeed completed successfully!');
}

run();
