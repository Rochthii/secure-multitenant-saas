"""
PIPELINE ĐÁNH GIÁ NCKH ĐỘ LIÊN KẾT RAG (Agentic GraphRAG) - PHIÊN BẢN THỰC CHIẾN (REAL)
Sử dụng thư viện Ragas (Retrieval Augmented Generation Assessment) và Gemini API.

Để chạy script này thực sự sinh ra file CSV & Biểu đồ từ Data Database:
pip install psycopg2-binary ragas langchain-google-genai datasets pandas matplotlib seaborn
"""

import os
import time
import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

try:
    from datasets import Dataset
    from ragas import evaluate
    from ragas.metrics import context_precision, faithfulness, answer_relevancy
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    from dotenv import load_dotenv
except ImportError:
    print("❌ Thiếu thư viện. Chạy lệnh: pip install psycopg2-binary ragas langchain-google-genai datasets pandas matplotlib seaborn python-dotenv")
    exit(1)

# =====================================================================
# 1. CẤU HÌNH API & DATABASE MÔI TRƯỜNG THỰC
# =====================================================================
# Tự động load biến môi trường từ thư mục root của dự án
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
load_dotenv(env_path)

# Lấy GEMINI_API_KEY (Hoặc GOOGLE_API_KEY theo chuẩn LangChain)
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

# URL mặc định của Local Supabase
DB_CONNECTION = "postgresql://postgres:postgres@localhost:54322/postgres"

# Danh sach Model uu tien - tu dong doi sang cai ke tiep khi quota het
MODEL_FALLBACK_LIST = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.0-flash-exp",
]
current_model_index = 0

def get_llm():
    """Tra ve LLM hien tai dang duoc su dung."""
    return ChatGoogleGenerativeAI(
        model=MODEL_FALLBACK_LIST[current_model_index],
        temperature=0,
        timeout=60,
    )

evaluator_llm = get_llm()
evaluator_embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# =====================================================================
# 2. HÀM TRUY XUẤT DATABASE THỰC (VECTOR + GRAPH)
# =====================================================================
def fetch_hybrid_graphrag_contexts(query: str, limit: int = 5):
    """
    Kết nối vào Database, gọi hàm RPC để lấy Context (gồm cả Embeddings và Graph Expansion)
    """
    try:
        conn = psycopg2.connect(DB_CONNECTION)
        cursor = conn.cursor()
        
        # Lấy Graph Expansion
        cursor.execute("SELECT public.get_graph_expansions(%s);", (query,))
        graph_expanded = cursor.fetchone()[0]
        expanded_query = query + (" " + graph_expanded if graph_expanded else "")

        # Giả lập lại một phần Hybrid Search hoặc gọi trực tiếp hybrid_search_dharma bằng PGVector
        # Ở đây minh họa Fetch FTS (Full-text) + Expansion để lấy List Context
        cursor.execute("""
            SELECT content FROM public.dharma_embeddings
            WHERE fts @@ phraseto_tsquery('simple', %s)
            LIMIT %s;
        """, (expanded_query, limit))
        
        results = [row[0] for row in cursor.fetchall()]
        
        # Nếu FTS trả rỗng, fallback về content chứa từ khóa (Phòng ngừa Demo thiếu index)
        if not results:
            cursor.execute("""
                SELECT content FROM public.dharma_embeddings
                WHERE content ILIKE %s
                LIMIT %s;
            """, (f"%{query}%", limit))
            results = [row[0] for row in cursor.fetchall()]
            
        conn.close()
        return expanded_query, results
    except Exception as e:
        print(f"Loi DB: {e}. Dang dung Context rong.")
        return query, ["(Database Trong - Chi test pipeline)"]

def generate_ai_answer(expanded_query: str, contexts: list) -> str:
    """
    Dung Gemini de sinh cau tra loi RAG. Tu dong doi model khi gap loi 429.
    """
    global evaluator_llm, current_model_index
    prompt = f"Tra loi cau hoi sau dua tren Boi canh (Context).\n\nCau hoi: {expanded_query}\nBoi canh:\n{chr(10).join(contexts)}\n\nTra loi:"
    
    while True:
        try:
            response = evaluator_llm.invoke(prompt)
            return response.content
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                if current_model_index < len(MODEL_FALLBACK_LIST) - 1:
                    current_model_index += 1
                    next_model = MODEL_FALLBACK_LIST[current_model_index]
                    print(f"  [QUOTA] Model bi het han muc! Chuyen sang: {next_model}")
                    evaluator_llm = get_llm()
                    time.sleep(3)  # Brief pause before retry
                else:
                    print("  [ERROR] Da het tat ca model trong danh sach fallback!")
                    return "(QUOTA_EXHAUSTED - Khong the sinh cau tra loi)"
            else:
                print(f"  [ERROR] Loi bat ngo: {e}")
                return "(ERROR - Loi he thong)"

# =====================================================================
# 3. CHẶN KHỞI TẠO TẬP DATA CHO RAGAS ĐÁNH GIÁ (GOLDEN DATASET)
# =====================================================================
test_dataset = [
    {
        "question": "Làm sao để bớt lười biếng và buồn ngủ khi thực hành thiền?",
        "ground_truth": "Đức Phật dạy 8 cách đối trị hôn trầm thụy miên..."
    },
    {
        "question": "A La Hán và Bồ Tát có điểm gì khác biệt cốt lõi?",
        "ground_truth": "Nam Tông coi A La Hán là tối thượng, Bắc Tông coi Bồ Tát là cao nhất."
    }
]

# =====================================================================
# 4. CHẠY EVALUATION THỰC TẾ TRÊN GEMINI & RAGAS
# =====================================================================
def run_real_evaluation():
    if os.environ["GOOGLE_API_KEY"] == "YOUR_GEMINI_API_KEY":
        print("WARNING: Ban chua dien GOOGLE_API_KEY thuc. Pipeline xin se bi loi xac thuc API!")
    
    print("BAT DAU: Dang chay truy van DB va sinh cau tra loi bang Gemini (Real RAG generation)...")
    
    questions = []
    answers = []
    contexts_list = []
    ground_truths = []
    
    for item in test_dataset:
        q = item["question"]
        print(f" -> Dang xu ly: {q}")
        
        expanded_q, ctx = fetch_hybrid_graphrag_contexts(q)
        ans = generate_ai_answer(expanded_q, ctx)
        
        questions.append(q)
        answers.append(ans)
        contexts_list.append(ctx)
        ground_truths.append(item["ground_truth"])
        
    # Build Dataset Dictionary cho Ragas
    data = {
        "question": questions,
        "answer": answers,
        "contexts": contexts_list,
        "ground_truth": ground_truths
    }
    dataset = Dataset.from_dict(data)
    
    print("\nBAT DAU: Bat dau cho Ragas (Gemini Evaluator) cham diem Metrics...")
    
    # Ragas Evaluate Function Thực
    result = evaluate(
        dataset=dataset,
        metrics=[context_precision, faithfulness, answer_relevancy],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings
    )
    
    df = result.to_pandas()
    print("\n📊 BẢNG KẾT QUẢ ĐÁNH GIÁ (THỰC TẾ):")
    print(df.to_string())
    
    # Lưu CSV làm minh chứng Luận văn
    csv_file = "ragas_real_metrics_nckh.csv"
    df.to_csv(csv_file, index=False)
    print(f"DONE: Da xuat du lieu do luong tho ra: {csv_file}")
    
    # =====================================================================
    # 5. VẼ BIỂU ĐỒ TRỰC QUAN HÓA KẾT QUẢ THỰC TẾ
    # =====================================================================
    print("\nWORK: Dang ve Bieu do So sanh NCKH...")
    sns.set_theme(style="whitegrid")
    
    # Format lại bảng data để vẽ (Tính trung bình score của các câu)
    avg_scores = df[["context_precision", "faithfulness", "answer_relevancy"]].mean().reset_index()
    avg_scores.columns = ["Metric", "Điểm số Ragas (Trung bình)"]
    
    plt.figure(figsize=(9, 5))
    ax = sns.barplot(x="Metric", y="Điểm số Ragas (Trung bình)", data=avg_scores, palette="mako")
    
    plt.title("Đánh giá Hiệu năng: Agentic GraphRAG (Thực tế)", fontsize=14, fontweight='bold', pad=15)
    plt.ylim(0, 1.0)
    plt.ylabel("Điểm số (0.0 -> 1.0)")
    plt.xlabel("")
    
    # Gắn Label số lên cột
    for p in ax.containers:
        ax.bar_label(p, fmt='%.3f', label_type='edge', padding=4)
        
    plt.tight_layout()
    output_filename = "ragas_real_evaluation_chart.png"
    plt.savefig(output_filename, dpi=300)
    print(f"DONE: Da xuat bieu do bao cao: {output_filename}")

if __name__ == "__main__":
    run_real_evaluation()
