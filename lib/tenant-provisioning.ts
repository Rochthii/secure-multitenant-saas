import { createClient } from '@/lib/supabase/server';

// ID của Chi nhánh Chantarangsay được lấy làm hệ quy chiếu (Master Template)
const MASTER_TENANT_ID = '55555555-5555-5555-5555-555555555555';

export async function provisionDefaultCategoriesForNewTenant(newTenantId: string) {
    const supabase = await createClient() as any;

    try {
        // 1. Fetch toàn bộ danh mục của Master Tenant
        const { data: masterCategories, error: fetchError } = await supabase
            .from('categories')
            .select('*')
            .eq('tenant_id', MASTER_TENANT_ID)
            .order('created_at', { ascending: true }); // Giữ thứ tự tạo để đảm bảo Parent luôn có trước Child

        if (fetchError || !masterCategories || masterCategories.length === 0) {
            console.error('[Provisioning] Error fetching master categories:', fetchError);
            return { success: false, error: 'Cannot fetch Master Categories' };
        }

        // 2. Thuật toán Map ID cũ -> ID mới
        // Vì Supabase uuid được generate mặc định từ DB hoặc client, ta sẽ tự sinh UUID ở client 
        // để tạo ánh xạ (mapping) trước khi insert, bảo toàn Parent-Child Tree.
        const idMapping: Record<string, string> = {}; // { old_id: new_uuid }

        const newCategoriesToInsert = masterCategories.map((cat: any) => {
            const newId = crypto.randomUUID();
            idMapping[cat.id] = newId;

            return {
                id: newId,
                tenant_id: newTenantId,
                name_vi: cat.name_vi,
                name_km: cat.name_km,
                name_en: cat.name_en,
                slug: `${cat.slug}-${newTenantId.split('-')[0]}`,
                description_vi: cat.description_vi,
                description_km: cat.description_km,
                description_en: cat.description_en,
                image_url: cat.image_url,
                module: cat.module,
                type: cat.type,
                // parent_id sẽ được update trong pass thứ 2
                parent_id: cat.parent_id,
                created_at: new Date().toISOString(),
            };
        });

        // 3. Pass thứ 2: Gắn lại Parent ID mới
        newCategoriesToInsert.forEach((newCat: any) => {
            if (newCat.parent_id && idMapping[newCat.parent_id]) {
                newCat.parent_id = idMapping[newCat.parent_id];
            } else if (newCat.parent_id && !idMapping[newCat.parent_id]) {
                // Trường hợp parent_id trỏ về một Global Category (tenant_id = null)
                // Giữ nguyên parent_id cũ vì nó trỏ đến Category dùng chung
            }
        });

        // 4. Chunk insert để tránh quá tải payload (chia nhỏ 50 recs / batch)
        const chunkSize = 50;
        for (let i = 0; i < newCategoriesToInsert.length; i += chunkSize) {
            const chunk = newCategoriesToInsert.slice(i, i + chunkSize);
            const { error: insertError } = await supabase
                .from('categories')
                .insert(chunk);

            if (insertError) {
                console.error(`[Provisioning] Error inserting category chunk ${i}:`, insertError);
                return { success: false, error: 'Failed to insert cloned categories' };
            }
        }

        return { success: true };

    } catch (error) {
        console.error('[Provisioning] Unexpected error during category cloning:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
