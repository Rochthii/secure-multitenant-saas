/**
 * ĐỀ CƯƠNG ĐÁNH GIÁ (EVALUATION DATASET) - DỰ ÁN NCKH AGENTIC GRAPHRAG
 * 
 * Mô tả: Phục vụ cho Task-06 (Xây dựng Tập dữ liệu kiểm thử Ragas).
 * Bộ dữ liệu này tập trung vào 4 trục: Semantics, Deep Context, Language, và Agentic Synthesis.
 */

export const NCKH_RAGAS_EVALUATION_DATASET = [
  // ==========================================
  // NHÓM 1: SEMANTIC AMBIGUITY (Ngữ nghĩa & Ontology)
  // ==========================================
  {
    question: "Làm sao để 'không' còn khổ?",
    expected_ontology_trigger: "Nirodha (Diệt Đế/Sự chấm dứt khổ)",
    ground_truth: "Để chấm dứt khổ, người tu tập cần thực hành Bát Chánh Đạo, đoạn tận tham ái (Tanha) và lậu hoặc. Đây là trạng thái Diệt Đế (Nirodha).",
    category: "SEMANTIC",
    difficulty: "EASY"
  },
  {
    question: "Tánh 'Không' trong kinh Bát Nhã có giống với sự 'không có gì' không?",
    expected_ontology_trigger: "Shunyata (Tánh Không)",
    ground_truth: "Tánh Không (Shunyata) không phải là hư vô hay sự không có gì. Đó là sự vắng mặt của tự tính độc lập (Svabhava) trong mọi hiện tượng do duyên sinh. Vạn vật hiện hữu nhưng không có cốt lõi bất biến.",
    category: "SEMANTIC",
    difficulty: "HARD"
  },
  {
    question: "Phân biệt 'Pháp' (Dharma) là lời dạy và 'pháp' (dharmas) là các hiện tượng.",
    expected_ontology_trigger: "Dharma vs Dharmas",
    ground_truth: "Viết hoa 'Pháp' thường chỉ Giáo pháp của Phật. Viết thường 'pháp' chỉ các pháp hữu vi và vô vi, tức các hiện tượng tâm - vật lý đang vận hành.",
    category: "SEMANTIC",
    difficulty: "EXPERT"
  },

  // ==========================================
  // NHÓM 2: DEEP CONTEXT & MULTI-TURN (Ngữ cảnh đa tầng)
  // ==========================================
  {
    context_chain: ["Tứ Diệu Đế là gì?"],
    question: "Vậy mắt xích thứ ba trong đó có ý nghĩa gì đối với người tại gia?",
    expected_memory_recall: "Third Truth = Nirodha (Diệt Đế)",
    ground_truth: "Mắt xích thứ ba là Diệt Đế (Nirodha) - sự hứa hẹn về giải thoát. Đối với người tại gia, nó mang lại hy vọng và niềm tin rằng khổ đau có thể chấm dứt bằng sự tu tập đúng đắn ngay trong đời sống hàng ngày.",
    category: "CONTEXT",
    difficulty: "MEDIUM"
  },
  {
    context_chain: ["Tứ Diệu Đế là gì?", "Diệt đế là mắt xích thứ 3"],
    question: "Làm sao để thực hành nó ngay bây giờ?",
    expected_memory_recall: "It = Nirodha / Path to it",
    ground_truth: "Thực hành 'nó' (Diệt Đế) thực chất là thực hành Đạo Đế (Bát Chánh Đạo). Người tại gia có thể bắt đầu bằng việc giữ Ngũ giới và thực hành Chánh niệm trong công việc.",
    category: "CONTEXT",
    difficulty: "HARD"
  },

  // ==========================================
  // NHÓM 3: CROSS-TRADITION SYNTHESIS (Tổng hợp hệ phái)
  // ==========================================
  {
    question: "So sánh quan niệm về việc ăn chay giữa Nam tông và Bắc tông.",
    expected_router_trigger: "COMPARATIVE",
    ground_truth: "Nam tông (Theravada) giữ quy tắc 'Tam tịnh nhục', không bắt buộc ăn chay trường. Bắc tông (Mahayana) đề cao lòng từ bi với chúng sinh nên khuyến khích hoặc bắt buộc ăn chay trường (theo Kinh Phạm Võng).",
    category: "AGENTIC",
    difficulty: "MEDIUM"
  },
  {
    question: "Địa vị của A-la-hán trong Kinh Tạng Nikaya có thấp hơn Bồ Tát không?",
    expected_router_trigger: "THERAVADA vs MAHAYANA",
    ground_truth: "Trong Nikaya, A-la-hán là mục tiêu tối thượng của sự giải thoát lậu hoặc. Tuy nhiên, trong tư tưởng Mahayana, quả vị A-la-hán đôi khi được xem là 'Hóa thành' để khuyến khích hành giả hướng tới trí tuệ toàn giác của Bồ Tát (Bảo thành).",
    category: "AGENTIC",
    difficulty: "EXPERT"
  },

  // ==========================================
  // NHÓM 4: LANGUAGE & SLANG (Sắc thái ngôn ngữ)
  // ==========================================
  {
    question: "Sống sao cho 'chill' mà vẫn đúng đạo hả sư?",
    expected_style: "CASUAL TO DHARMA",
    ground_truth: "Sống 'chill' trong đạo Phật chính là sống với tâm 'Xả' (Upekkha) và 'Chánh niệm' (Sati). Không dính mắc vào kết quả, trân trọng giây phút hiện tại chính là cách chill đích thực của bậc thức giả.",
    category: "LANGUAGE",
    difficulty: "EASY"
  },
  {
    question: "Phương pháp đối trị lậu hoặc để chứng đắc vô sinh?",
    expected_style: "FORMAL/CLASSICAL",
    ground_truth: "Để đối trị lậu hoặc (Asava), hành giả cần thực hành Minh (Vija) thông qua Tứ Niệm Xứ, quán chiếu Vô thường, Khổ, Vô ngã để đoạn tận gốc rễ của Vô minh.",
    category: "LANGUAGE",
    difficulty: "HARD"
  },

  // ==========================================
  // NHÓM 5: LOGICAL PARADOX (Nghịch lý & Lý luận)
  // ==========================================
  {
    question: "Nếu vạn vật là vô ngã, thì ai là người đi luân hồi và chịu quả báo?",
    expected_reasoning: "Continuity without permanent self",
    ground_truth: "Không có một cái 'Tôi' bất biến đi luân hồi, mà chỉ có dòng tiếp nối của tâm thức (Citta-santana) và nghiệp lực. Giống như ngọn lửa truyền từ cây nến này sang cây nến khác, không phải là một ngọn lửa nhưng cũng không phải là hai.",
    category: "LOGIC",
    difficulty: "EXPERT"
  }
];
