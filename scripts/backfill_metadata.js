/**
 * backfill_metadata.js
 * Mục tiêu: Cập nhật metadata học thuật cho các tài liệu đã nạp trước đây.
 * 
 * Cách dùng:
 *   node scripts/backfill_metadata.js
 * 
 * Script sẽ hiển thị danh sách tài liệu hiện có, sau đó cho phép
 * nhập metadata cho từng tài liệu.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

// ============================================================
// Metadata đã biết — cập nhật tại đây để không cần nhập thủ công
// ============================================================
const KNOWN_METADATA = {
    'Kinh Tụng Nam Tông Theravada (Pali-Việt)': {
        source_metadata: {
            translator: 'Hội Phật Giáo Nguyên Thủy Việt Nam',
            publisher: 'Thư Viện Hoa Sen',
            language: 'Pali-Việt',
            book_name: 'Khuddaka Nikāya (Tiểu Bộ Kinh)',
        },
        // Metadata cho từng chunk — áp dụng chung cho tài liệu này
        chunk_metadata: {
            sutta_code: 'Khuddaka Pāṭha',
            book_name: 'Tiểu Bộ — Kinh Tụng (Paritta)',
        },
    },
    'Kinh Tụng Nam Tông': {
        source_metadata: {
            translator: 'Không rõ nguồn gốc',
            language: 'Tiếng Việt',
        },
        chunk_metadata: {},
    },
};

async function backfillMetadata() {
    console.log('\n=== 🔄 BACKFILL METADATA HỌC THUẬT ===\n');

    // Lấy danh sách tài liệu
    const { data: docs, error } = await supabase
        .from('dharma_documents')
        .select('id, title, source_metadata, dharma_categories(name)')
        .order('created_at', { ascending: true });

    if (error) { console.error('❌ Lỗi:', error.message); rl.close(); return; }

    console.log(`Tìm thấy ${docs.length} tài liệu:\n`);
    docs.forEach((d, i) => {
        const cat = d.dharma_categories?.name || 'Chưa phân loại';
        const hasMeta = d.source_metadata && Object.keys(d.source_metadata).length > 0;
        console.log(`${i + 1}. ${d.title} [${cat}] ${hasMeta ? '✅ Có metadata' : '❌ Chưa có metadata'}`);
    });

    console.log('\n--- BẮT ĐẦU CẬP NHẬT TỰ ĐỘNG ---\n');

    for (const doc of docs) {
        const knownMeta = KNOWN_METADATA[doc.title];
        if (!knownMeta) {
            console.log(`⏭️  Bỏ qua "${doc.title}" — Chưa có metadata đã biết.`);
            continue;
        }

        console.log(`\n📖 Cập nhật: "${doc.title}"`);

        // 1. Cập nhật source_metadata cho document
        const { error: docErr } = await supabase
            .from('dharma_documents')
            .update({ source_metadata: knownMeta.source_metadata })
            .eq('id', doc.id);

        if (docErr) {
            console.error(`  ❌ Lỗi cập nhật document: ${docErr.message}`);
            continue;
        }
        console.log(`  ✅ Cập nhật source_metadata thành công.`);

        // 2. Cập nhật chunk_metadata cho tất cả embeddings của tài liệu này
        if (knownMeta.chunk_metadata && Object.keys(knownMeta.chunk_metadata).length > 0) {
            const { data: chunks, error: chunkFetchErr } = await supabase
                .from('dharma_embeddings')
                .select('id')
                .eq('document_id', doc.id);

            if (chunkFetchErr) {
                console.error(`  ❌ Lỗi lấy chunks: ${chunkFetchErr.message}`);
                continue;
            }

            const { error: chunkUpdateErr } = await supabase
                .from('dharma_embeddings')
                .update({ metadata: knownMeta.chunk_metadata })
                .eq('document_id', doc.id);

            if (chunkUpdateErr) {
                console.error(`  ❌ Lỗi cập nhật chunks: ${chunkUpdateErr.message}`);
            } else {
                console.log(`  ✅ Cập nhật metadata cho ${chunks.length} chunks.`);
            }
        }
    }

    console.log('\n=== ✅ BACKFILL HOÀN TẤT ===');
    console.log('Từ giờ, khi hỏi về Kinh Tụng, AI sẽ biết trích dẫn đúng nguồn.\n');
    rl.close();
}

backfillMetadata();
