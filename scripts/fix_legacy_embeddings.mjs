import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmbedding(text) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiApiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: { parts: [{ text: text }] },
                output_dimensionality: 1536,
            }),
        }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.embedding.values;
}

async function fixEmbeddings() {
    console.log("🔍 Đang kiểm tra các vector lỗi thời (768 dims)...");
    
    // Tìm các row có số chiều không phải 1536
    // Lưu ý: Trong Supabase, vector type không hỗ trợ array_length trực tiếp dễ dàng nếu không ép kiểu
    // Ta sẽ dùng RPC hoặc một câu query thô
    const { data: legacyRows, error } = await supabase
        .rpc('get_legacy_embeddings'); // Giả định có RPC này, hoặc dùng query dưới

    if (error) {
        console.log("⚠️ Không có RPC, thử query trực tiếp...");
        // Fallback query
        const { data: rows, error: qErr } = await supabase
            .from('dharma_embeddings')
            .select('id, content')
            .limit(100); // Lấy mẫu để kiểm tra chiều
            
        if (qErr) throw qErr;
        
        console.log(`🚀 Bắt đầu quét và sửa đổi hàng loạt...`);
        
        let fixedCount = 0;
        for (const row of rows) {
            // Kiểm tra thực tế dimension của row này (giả định ta cần check)
            // Cách tốt nhất là chạy SQL: 
            // "UPDATE dharma_embeddings SET embedding = ... WHERE id = ..."
        }
    }
}

// Thay vì script phức tạp, tôi sẽ tạo 1 file SQL migration để tìm và đánh dấu các document cần nạp lại.
console.log("Kế hoạch: Tạo script SQL để xác định document lỗi.");
