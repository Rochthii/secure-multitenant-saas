import os
import json
import random
from datetime import datetime, timezone
import requests

# Cấu hình môi trường
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY]):
    print("❌ Thiếu biến môi trường. Vui lòng thiết lập SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY")
    exit(1)

def fetch_recent_queries(limit=50):
    """Lấy mẫu ngẫu nhiên các câu hỏi chưa được approve trong tuần qua"""
    url = f"{SUPABASE_URL}/rest/v1/ai_query_cache?select=id,user_query,llm_answer,citations&is_approved=eq.false&limit={limit}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Range-Unit": "items"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        random.shuffle(data)
        return data[:20] # Lấy mẫu 20 câu ngẫu nhiên để đánh giá
    print(f"Lỗi truy vấn DB: {response.text}")
    return []

def evaluate_with_llm(query, answer, citations):
    """
    Sử dụng Gemini để đóng vai trò 'Giám khảo' (LLM-as-a-Judge) 
    chấm điểm độ chính xác dựa trên Ragas (Faithfulness & Relevancy).
    """
    prompt = f"""
    Bạn là một vị Giám khảo am tường Phật học. 
    Nhiệm vụ của bạn là đánh giá chất lượng câu trả lời của một AI RAG theo 2 tiêu chí (0.0 đến 1.0):
    1. Faithfulness (Trung thực): Câu trả lời có bám sát nguồn trích dẫn không, hay là tỰ bịa ra (hallucination)?
    2. Answer_Relevancy (Sát đề): Câu trả lời có giải quyết trực tiếp câu hỏi không?

    [Câu hỏi người dùng]: {query}
    [Câu trả lời AI]: {answer}
    [Trích dẫn đính kèm]: {json.dumps(citations, ensure_ascii=False)}

    Vui lòng chỉ trả về ĐÚNG MỘT khối JSON với định dạng sau (không giải thích thêm):
    {{
       "faithfulness_score": 0.9,
       "relevancy_score": 0.8,
       "reasoning": "Lý do chấm điểm..."
    }}
    """
    
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    
    res = requests.post(api_url, json=payload, headers={"Content-Type": "application/json"})
    try:
        data = res.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        return json.loads(text)
    except Exception as e:
        print(f"Lỗi khi gọi Giám khảo LLM: {str(e)}")
        return None

def main():
    print("=============================================")
    print("DHARMA AI - AUTOMATED QUALITY AUDIT (NCKH)")
    print("=============================================")
    
    queries = fetch_recent_queries()
    if not queries:
        print("Không có câu hỏi mới nào cần đánh giá.")
        return

    print(f"Bắt đầu đánh giá {len(queries)} mẫu ngẫu nhiên...")
    
    # Ở bản production thực tế, ta sẽ insert kết quả này vào bảng `ai_quality_evaluation`.
    # Hiện tại sẽ xuất ra log/báo cáo.
    
    reports = []
    
    for i, item in enumerate(queries):
        print(f"\n[{i+1}/{len(queries)}] Đang chấm điểm ID: {item['id']}")
        eval_result = evaluate_with_llm(item['user_query'], item['llm_answer'], item['citations'])
        
        if eval_result:
            p_faith = eval_result.get('faithfulness_score', 0)
            p_relev = eval_result.get('relevancy_score', 0)
            
            avg_score = (p_faith + p_relev) / 2
            status = "✅ TỐT" if avg_score >= 0.8 else "⚠️ CẦN XEM LẠI !!"
            
            print(f"-> Question: {item['user_query']}")
            print(f"-> Average Score: {avg_score:.2f} ({status})")
            print(f"-> Reasoning: {eval_result.get('reasoning', '')}")
            
            if avg_score < 0.7:
                reports.append({
                    "id": item['id'],
                    "query": item['user_query'],
                    "score": avg_score,
                    "reason": eval_result.get('reasoning', '')
                })

    print("\n=============================================")
    print("TỔNG KẾT TUẦN:")
    if reports:
        print(f"CẢNH BÁO: Phát hiện {len(reports)} câu trả lời có dấu hiệu ảo giác (Score < 0.7).")
        print("Ban Tu Thư cần mở bảng `ai_query_cache` kiểm tra và hiệu đính các ID sau:")
        for r in reports:
            print(f"- ID: {r['id']} | Query: {r['query']}")
    else:
        print("Xuất sắc! Không phát hiện câu trả lời nào dưới chuẩn.")
        
if __name__ == "__main__":
    main()
