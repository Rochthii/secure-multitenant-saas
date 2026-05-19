import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const sUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testRAG() {
    if (!sUrl || !sKey) {
        console.error('❌ Thiếu biến môi trường (URL hoặc Key).');
        return;
    }

    console.log(`🚀 Đang kết nối tới: ${sUrl}`);
    console.log(`📝 Đang gửi câu hỏi: "Pháp cú câu 1 là gì?"...`);

    try {
        const response = await fetch(`${sUrl.replace(/\/$/, '')}/functions/v1/rag-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': sKey,
                'Authorization': `Bearer ${sKey}`
            },
            body: JSON.stringify({
                query: "Pháp cú câu 1 là gì?",
                tenant_id: "GLOBAL",
                session_id: null
            })
        });

        if (!response.ok) {
            console.error(`❌ Lỗi API (${response.status}):`, await response.text());
            return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
            console.error('❌ Không thể đọc stream.');
            return;
        }

        console.log('✅ Đang nhận phản hồi:\n' + '-'.repeat(40));

        let fullText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            process.stdout.write(parsed.text);
                            fullText += parsed.text;
                        }
                    } catch (e) {
                        // Bỏ qua lỗi parse JSON cho các chunk không hoàn chỉnh
                    }
                }
            }
        }
        
        console.log('\n' + '-'.repeat(40));
        console.log('✨ Kiểm tra hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi thực thi:', error);
    }
}

testRAG();
