/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE — JOINT INTELLECTUAL PROPERTY
 *
 * Hook: use-web-quiz
 * Mục đích: Quản lý phiên luyện tập trắc nghiệm Phật học cho người dùng web
 * Chiến lược: AI sinh câu hỏi từ RAG → Người dùng trả lời → Xem giải thích
 */
'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  bloom_level: string | null;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  explanation: string;
  source_citation: string | null;
  tradition_id: string | null;
  category_id: string | null;
}

export interface QuizAnswer {
  questionId: string;
  selected: string;
  isCorrect: boolean;
}

export type QuizPhase = 'setup' | 'quiz' | 'result';

export function useWebQuiz(tenantId: string) {
  const [phase, setPhase]             = useState<QuizPhase>('setup');
  const [questions, setQuestions]     = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]         = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [categories, setCategories]   = useState<{id: string, name: string}[]>([]);
  const [isCategoriLoading, setIsCategoryLoading] = useState(false);

  // Tham số phiên luyện tập
  const [tradition, setTradition]     = useState<string>('');
  const [category, setCategory]       = useState<string>('');
  const [difficulty, setDifficulty]   = useState<string>('MEDIUM');
  const [count, setCount]             = useState<number>(5);

  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion  = currentIndex === questions.length - 1;
  const score           = answers.filter(a => a.isCorrect).length;

  // ── Fetch danh sách chủ đề theo hệ phái ───────────────────
  const fetchCategories = useCallback(async (tradId: string) => {
    setIsCategoryLoading(true);
    try {
      let query = `${SUPABASE_URL}/rest/v1/dharma_categories?select=id,name&order=name`;
      if (tradId) {
        query += `&tradition_id=eq.${tradId}`;
      }
      
      const res = await fetch(query, {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setIsCategoryLoading(false);
    }
  }, []);

  // Khi tradition thay đổi, reset category và fetch mới
  const handleTraditionChange = useCallback((id: string) => {
    setTradition(id);
    setCategory(''); // reset selection
    fetchCategories(id);
  }, [fetchCategories]);

  // Khởi tạo lấy categories lần đầu
  useState(() => {
    fetchCategories('');
  });

  // ── Bắt đầu phiên luyện tập ─────────────────────────────
  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Lấy session token thật nếu user đã đăng nhập, không thì dùng anon key
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tradition_id: tradition || null,
          category_id:  category  || null,
          difficulty,
          count,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Lỗi hệ thống (HTTP ${res.status}). Vui lòng thử lại.`);
      }

      if (data.error) throw new Error(data.error);

      // ── C3 FIX: Cho phép sinh viên chơi ngay các câu vừa tạo ──
      // "Tạo câu hỏi có thể lưu câu hỏi lại để áp dụng cho người khác luôn, đỡ tốn"
      const playableQuestions = (data.questions || []).filter(
        (q: QuizQuestion & { status?: string }) =>
          data.source === 'approved_db' || !q.status || q.status === 'APPROVED' || q.status === 'PENDING'
      );

      if (playableQuestions.length === 0) {
        setErrorMsg(data.message || 'Chưa có đủ kinh điển cho chủ đề này. Vui lòng nhập chủ đề khác!');
        return;
      }

      setQuestions(playableQuestions);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setPhase('quiz');
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [tradition, category, difficulty, count]);


  // ── Chọn đáp án ─────────────────────────────────────────
  const selectAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return; // Không cho chọn lại
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correct_answer;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selected:   answer,
      isCorrect,
    }]);
  }, [selectedAnswer, currentQuestion]);

  // ── Câu tiếp theo ────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (isLastQuestion) {
      setPhase('result');
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [isLastQuestion]);

  // ── Làm lại từ đầu ──────────────────────────────────────
  const resetQuiz = useCallback(() => {
    setPhase('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setErrorMsg(null);
  }, []);

  return {
    // State
    phase, questions, currentIndex, currentQuestion,
    answers, selectedAnswer, showExplanation,
    isLoading, errorMsg, score, isLastQuestion,
    // Config
    tradition, setTradition: handleTraditionChange,
    category, setCategory,
    categories, isCategoriLoading,
    difficulty, setDifficulty,
    count, setCount,
    // Actions
    startQuiz, selectAnswer, nextQuestion, resetQuiz,
  };
}
