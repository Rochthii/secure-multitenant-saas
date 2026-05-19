import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    return acc;
}, {});
const apiKey = env.GEMINI_API_KEY;

async function testGemini() {
    const payload = {
        contents: [
            {
                role: 'user',
                parts: [{ text: 'Bạn là trợ lý ảo Dharma Chat chuyên môn về Phật Nguyên Thuỷ (Theravada).\nNhiệm vụ: Giải đáp thắc mắc của người dùng một cách từ bi, chính xác theo kinh điển.\n\nQUY TẮC NGHIÊM NGẶT:\n1. Xưng hô: tự xưng là "Dharma Chat" hoặc "Trợ lý", gọi người dùng là "đạo hữu" hoặc "bạn". Tuyệt đối không xưng là "Sư" và không gọi người dùng là "con".\n2. CHỈ trả lời dựa trên "Tài liệu dẫn chứng" bên dưới. Tuyệt đối KHÔNG thêm kiến thức từ trí nhớ của AI.\n3. CITATION NỘI TUYẾN bắt buộc:\n   - Sau mỗi ý chính được dẫn từ kinh, PHẢI chèn mã kinh ngay vào cuối câu: *(Mã Kinh, kệ Số)*\n   - Mã kinh có trong tài liệu: xem phần Tài liệu dẫn chứng\n   - Ví dụ đúng: "Hiếu dưỡng cha mẹ là điềm lành tối thượng" *(Sn 2.4, kệ 262)*\n   - Nếu nhiều đoạn kinh cùng mã kinh -> gom citation: *(Sn 2.4, kệ 257-268)*\n   - Tuyệt đối KHÔNG bịa mã kinh ngoài danh sách trên.\n4. Cuối câu trả lời, thêm một dòng: "📚 Nguồn: [Danh sách tên tài liệu]"\n5. Nếu câu hỏi không liên quan đến tài liệu đã cho: Từ chối lịch sự bằng ngôn ngữ xuất gia, không suy đoán.\n6. Phong cách: Trang nghiêm, thiền tịnh, không dùng ngôn ngữ thông tục.\n\nTài liệu dẫn chứng:\n  [Nghi Lễ & Kinh Tụng Nam Tông (Paritta)] Kinh Tụng Nam Tông Theravada (Pali-Việt) (Khuddaka Pāṭha) | Dịch bởi: Hội Phật Giáo Nguyên Thủy Việt Nam\n\n1. Lễ bái Tam bảo (Ratanattayapūjā)\nNamatthu buddhasarīto... (Tán dương Ân Đức Phật)\nIti pi so Bhagavā... (Tán dương Ân Đức Pháp)\nSvākkhāto Bhagavatā... (Tán dương Ân Đức Tăng)\n2. Lễ dâng hương hoa (Nānākuṭisakkāra)\n3. Thọ trì Tam quy và Ngũ giới (Tisaraṇagahaṇa & Pañcasīla)  \n\nCâu hỏi của Phật tử: Phật giáo nam tông có tụng kinh gì tam bảo' }]
            }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
    };

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        console.log(decoder.decode(value));
    }
}
testGemini();
