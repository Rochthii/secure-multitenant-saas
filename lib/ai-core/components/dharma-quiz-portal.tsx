/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE — JOINT INTELLECTUAL PROPERTY
 *
 * Component: DharmaQuizPortal  v2.0 (Redesigned)
 * Aesthetic: "Sắc Nâu Đất & Giấy Tranh Cổ" — Monastic Manuscript
 *
 * BUGS FIXED:
 *  1. Added AnimatePresence around QuizScreen content for slide transitions
 *  2. Explanation icon now reflects correct/wrong state
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWebQuiz } from '@/hooks/use-web-quiz';
import { CheckCircle2, XCircle, ChevronRight, RefreshCcw, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

interface DharmaQuizPortalProps {
  tenantId: string;
}

// ── Constants ────────────────────────────────────────────────────────────
const TRADITIONS = [
  { id: '',          label: 'Tất cả',          sub: 'Mọi hệ phái',            glyph: '☸' },
  { id: 'THERAVADA', label: 'Nam Tông',         sub: 'Theravāda · Pāli',       glyph: '𝛀' },
  { id: 'MAHAYANA',  label: 'Đại Thừa',         sub: 'Mahāyāna · Hán Tạng',    glyph: '莲' },
  { id: 'VAJRAYANA', label: 'Mật Tông',          sub: 'Vajrayāna · Tây Tạng',   glyph: 'ༀ' },
  { id: 'KHATTSI',   label: 'Khất Sĩ',          sub: 'Minh Đăng Quang · VN',   glyph: '⁜' },
  { id: 'GENERAL',   label: 'Phổ Thông',         sub: 'Nhập môn · Lịch sử',    glyph: '◎' },
];

const DIFFICULTIES = [
  { id: 'EASY',   vi: 'Nhập Môn',    en: 'Foundational',  accent: '#4A7C59' },
  { id: 'MEDIUM', vi: 'Trung Cấp',   en: 'Intermediate',  accent: '#8B6914' },
  { id: 'HARD',   vi: 'Cao Cấp',     en: 'Advanced',      accent: '#A0522D' },
  { id: 'EXPERT', vi: 'Chuyên Luận', en: 'Scholarly',     accent: '#6B2D2D' },
];

const COUNTS = [5, 10, 15, 20];
const ANSWER_KEYS = ['A', 'B', 'C', 'D'] as const;

// ── Design Tokens ─────────────────────────────────────────────────────────
const T = {
  ink:       '#1C140A',
  parchment: '#F5EDD9',
  sepia:     '#8B6914',
  saffron:   '#C47C2B',
  moss:      '#4A7C59',
  crimson:   '#8B2020',
  muted:     '#9C8464',
  border:    'rgba(139, 105, 20, 0.2)',
} as const;

// ── Decorative Divider ────────────────────────────────────────────────────
function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-700/20" />
      <span style={{ fontSize: 10, color: T.saffron, letterSpacing: 6 }}>✦ ✦ ✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-700/20" />
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────
function SetupScreen({ quiz }: { quiz: ReturnType<typeof useWebQuiz> }) {
  const { tradition, setTradition, difficulty, setDifficulty, count, setCount, startQuiz, isLoading, errorMsg } = quiz;

  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto px-5 py-8 flex flex-col gap-7"
    >
      {/* Header — Manuscript Title */}
      <div className="text-center space-y-2 pb-2">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
          style={{ background: 'radial-gradient(circle, rgba(196,124,43,0.15), rgba(196,124,43,0.04))', border: `1px solid ${T.border}` }}
        >
          <span style={{ fontSize: 22 }}>☸</span>
        </div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Lora', 'Playfair Display', Georgia, serif", color: T.ink }}
        >
          Pháp Vấn · Trắc Nghiệm
        </h2>
        <p style={{ fontSize: 12, color: T.muted, letterSpacing: 2 }} className="uppercase">
          AI sinh câu hỏi từ kho kinh điển
        </p>
      </div>

      <OrnamentDivider />

      {/* Tradition Grid */}
      <div className="space-y-2.5">
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase font-semibold">1. Chọn Hệ Phái</p>
        <div className="grid grid-cols-3 gap-2">
          {TRADITIONS.map(t => {
            const active = tradition === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTradition(t.id)}
                className="relative flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg transition-all duration-200"
                style={{
                  border: active ? `1.5px solid ${T.saffron}` : `1px solid ${T.border}`,
                  background: active ? `linear-gradient(135deg, rgba(196,124,43,0.12), rgba(196,124,43,0.04))` : 'rgba(255,255,255,0.4)',
                  boxShadow: active ? `0 2px 12px rgba(196,124,43,0.15), inset 0 1px 0 rgba(255,255,255,0.6)` : 'none',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, color: active ? T.saffron : T.muted }}>{t.glyph}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? T.ink : T.muted, marginTop: 2 }}>{t.label}</span>
                <span style={{ fontSize: 9, color: T.muted, lineHeight: 1.3, textAlign: 'center' }}>{t.sub}</span>
                {active && (
                  <motion.div
                    layoutId="tradition-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ border: `1.5px solid ${T.saffron}` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hybrid Topic Input — Suggestions + Free Text */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-end">
          <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase font-semibold">2. Chủ đề / Nội dung</p>
          {quiz.isCategoriLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-600 mb-1" />}
        </div>
        <div className="relative">
          <input
            list="dharma-categories"
            type="text"
            placeholder="Chọn hoặc nhập chủ đề (v.d: Lòng hiếu thảo...)"
            value={quiz.category}
            onChange={(e) => quiz.setCategory(e.target.value)}
            className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all duration-200 shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: `1px solid ${T.border}`,
              fontFamily: "'Lora', serif",
              color: T.ink,
            }}
          />
          <datalist id="dharma-categories">
            {quiz.categories.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
            <Sparkles className="w-4 h-4" style={{ color: T.saffron }} />
          </div>
        </div>
        <p style={{ fontSize: 9, color: T.muted }} className="italic px-1">
          * Bạn có thể chọn chuyên đề có sẵn hoặc gõ nội dung bất kỳ để AI tự tìm kinh điển liên quan.
        </p>
      </div>

      {/* Difficulty — Horizontal Tabs/Grid */}
      <div className="space-y-2.5">
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase font-semibold">3. Cấp Độ</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(139,105,20,0.07)' }}>
          {DIFFICULTIES.map(d => {
            const active = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className="relative flex flex-col items-center py-2.5 px-1 rounded-lg transition-all duration-200"
                style={{
                  background: active ? '#fff' : 'transparent',
                  boxShadow: active ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mb-1.5"
                  style={{ background: active ? d.accent : T.muted, opacity: active ? 1 : 0.4 }}
                />
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? d.accent : T.muted, lineHeight: 1 }}>{d.vi}</span>
                <span style={{ fontSize: 8.5, color: T.muted, marginTop: 1, lineHeight: 1 }}>{d.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Count — Pill Selector */}
      <div className="space-y-2.5">
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase font-semibold">
          Số câu: <span style={{ color: T.saffron, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
        </p>
        <div className="flex gap-2">
          {COUNTS.map(n => {
            const active = count === n;
            return (
              <button
                key={n}
                onClick={() => setCount(n)}
                className="flex-1 py-2 rounded-lg transition-all duration-200 text-sm font-semibold"
                style={{
                  border: active ? `1.5px solid ${T.saffron}` : `1px solid ${T.border}`,
                  color: active ? T.saffron : T.muted,
                  background: active ? 'rgba(196,124,43,0.08)' : 'rgba(255,255,255,0.3)',
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="text-sm rounded-lg px-4 py-3" style={{ background: 'rgba(139,32,32,0.06)', border: `1px solid rgba(139,32,32,0.2)`, color: T.crimson }}>
          {errorMsg}
        </div>
      )}

      <OrnamentDivider />

      {/* CTA */}
      <button
        onClick={startQuiz}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98]"
        style={{
          background: isLoading ? `rgba(196,124,43,0.5)` : `linear-gradient(135deg, #C47C2B, #A0622B)`,
          color: '#FEF6E8',
          boxShadow: isLoading ? 'none' : '0 4px 20px rgba(196,124,43,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          border: 'none',
        }}
      >
        {isLoading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang sinh câu hỏi từ kinh điển...</>
          : <><Sparkles className="w-4 h-4" /> Bắt đầu Pháp Vấn</>
        }
      </button>
    </motion.div>
  );
}

// ── Quiz Screen ────────────────────────────────────────────────────────────
function QuizScreen({ quiz }: { quiz: ReturnType<typeof useWebQuiz> }) {
  const { currentQuestion, currentIndex, questions, selectedAnswer, showExplanation, selectAnswer, nextQuestion, isLastQuestion, resetQuiz } = quiz;

  if (!currentQuestion) return null;

  const progress = (currentIndex + 1) / questions.length;
  const options = [
    { key: 'A' as const, text: currentQuestion.option_a },
    { key: 'B' as const, text: currentQuestion.option_b },
    { key: 'C' as const, text: currentQuestion.option_c },
    { key: 'D' as const, text: currentQuestion.option_d },
  ].filter(o => o.text);

  const isAnswered = !!selectedAnswer;
  const wasCorrect = selectedAnswer === currentQuestion.correct_answer;

  const getOptionState = (key: string): 'correct' | 'wrong' | 'dim' | 'idle' => {
    if (!isAnswered) return 'idle';
    if (key === currentQuestion.correct_answer) return 'correct';
    if (key === selectedAnswer) return 'wrong';
    return 'dim';
  };

  const optionStyles: Record<string, React.CSSProperties> = {
    idle:    { background: 'rgba(255,255,255,0.55)', border: `1px solid ${T.border}`, color: T.ink },
    correct: { background: `linear-gradient(135deg, rgba(74,124,89,0.12), rgba(74,124,89,0.05))`, border: `1.5px solid ${T.moss}`, color: T.moss },
    wrong:   { background: `linear-gradient(135deg, rgba(139,32,32,0.10), rgba(139,32,32,0.04))`, border: `1.5px solid ${T.crimson}`, color: T.crimson },
    dim:     { background: 'rgba(255,255,255,0.2)', border: `1px solid rgba(139,105,20,0.08)`, color: T.muted, opacity: 0.5 },
  };

  return (
    // ─── FIX: AnimatePresence wraps each question for slide animation ───
    <AnimatePresence mode="wait">
      <motion.div
        key={`question-${currentIndex}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl mx-auto px-5 py-6 flex flex-col gap-5"
      >
        {/* Top bar — Progress + Nav */}
        <div className="flex items-center gap-3">
          <button onClick={resetQuiz} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors" style={{ color: T.muted }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between" style={{ fontSize: 10, color: T.muted, letterSpacing: 1 }}>
              <span>CÂU {currentIndex + 1} / {questions.length}</span>
              <span style={{ color: T.saffron }}>{currentQuestion.difficulty}</span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: T.border }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${T.saffron}, ${T.sepia})` }}
                initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Question Card — Like a manuscript page */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, rgba(245,237,217,0.9), rgba(254,246,232,0.7))`,
            border: `1px solid ${T.border}`,
            boxShadow: '0 2px 20px rgba(139,105,20,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {/* Decorative corner glyph */}
          <span
            className="absolute top-4 right-4 select-none pointer-events-none"
            style={{ fontSize: 28, color: T.saffron, opacity: 0.12 }}
          >
            ☸
          </span>
          <p
            className="leading-relaxed text-[15px]"
            style={{ fontFamily: "'Lora', Georgia, serif", color: T.ink, fontWeight: 500 }}
          >
            {currentQuestion.question_text}
          </p>
          {currentQuestion.source_citation && (
            <p className="mt-3 text-[11px] font-medium" style={{ color: T.saffron, fontStyle: 'italic' }}>
              📖 {currentQuestion.source_citation}
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="flex flex-col gap-2.5">
          {options.map(({ key, text }) => {
            const state = getOptionState(key);
            return (
              <motion.button
                key={key}
                onClick={() => !isAnswered && selectAnswer(key)}
                disabled={isAnswered}
                whileTap={!isAnswered ? { scale: 0.95 } : {}}
                className="w-full text-left flex items-center md:items-start gap-4 px-4 py-4 rounded-xl transition-all duration-250 shadow-sm"
                style={{
                  ...optionStyles[state],
                  cursor: isAnswered ? 'default' : 'pointer',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {/* Key Badge */}
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-[1px] transition-all duration-250"
                  style={{
                    background: state === 'correct' ? T.moss
                      : state === 'wrong' ? T.crimson
                      : state === 'dim' ? 'transparent'
                      : 'rgba(139,105,20,0.1)',
                    color: (state === 'correct' || state === 'wrong') ? '#FEF6E8'
                      : state === 'dim' ? T.muted
                      : T.sepia,
                    border: state === 'dim' ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : key}
                </span>

                <span className="flex-1 text-sm leading-relaxed" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                  {text}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation — "Opening a scroll" animation */}
        {/* ── FIX: icon reflects answer correctness ── */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  background: wasCorrect
                    ? `linear-gradient(135deg, rgba(74,124,89,0.08), rgba(74,124,89,0.03))`
                    : `linear-gradient(135deg, rgba(196,124,43,0.08), rgba(196,124,43,0.03))`,
                  border: `1px solid ${wasCorrect ? 'rgba(74,124,89,0.2)' : T.border}`,
                }}
              >
                <div className="flex items-center gap-2">
                  {/* ── Icon đúng = ✓ xanh, sai = 📖 vàng (giải thích giáo lý) ── */}
                  {wasCorrect
                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: T.moss }} />
                    : <span style={{ fontSize: 13 }}>📖</span>
                  }
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: wasCorrect ? T.moss : T.sepia }}
                  >
                    {wasCorrect ? 'Chính xác!' : 'Giải thích từ Kinh điển'}
                  </span>
                </div>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ fontFamily: "'Lora', Georgia, serif", color: T.ink, fontStyle: 'italic' }}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {isAnswered && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={nextQuestion}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98]"
              style={{
                background: '#1C140A',
                color: '#F5EDD9',
                boxShadow: '0 4px 16px rgba(28,20,10,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────
function ResultScreen({ quiz }: { quiz: ReturnType<typeof useWebQuiz> }) {
  const { score, questions, answers, resetQuiz } = quiz;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const verdict = pct >= 90 ? { label: 'Tuệ Giác Xuất Sắc', sub: 'Đạo tâm kiên cố. Trí tuệ sáng tỏ.', color: T.moss }
    : pct >= 70  ? { label: 'Tinh Tấn Vững Chắc', sub: 'Tiếp tục tu học, đạo quả sẽ đến.', color: T.sepia }
    : pct >= 50  ? { label: 'Đang Trên Đường Đạo', sub: 'Hãy ôn lại kinh điển, thọ trì thêm.', color: T.saffron }
    : { label: 'Mới Bắt Đầu Hành Trình', sub: 'Kiên nhẫn là đức hạnh đầu tiên.', color: T.muted };

  // Animate score counter
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto px-5 py-8 flex flex-col items-center gap-6"
    >
      {/* Title */}
      <div className="text-center space-y-1">
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase">Kết Quả Pháp Vấn</p>
        <h3
          className="text-xl font-bold"
          style={{ fontFamily: "'Lora', Georgia, serif", color: verdict.color }}
        >
          {verdict.label}
        </h3>
        <p className="text-sm" style={{ color: T.muted, fontStyle: 'italic' }}>{verdict.sub}</p>
      </div>

      {/* Score Ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="38" fill="none" stroke={T.border} strokeWidth="6" />
          <motion.circle
            cx="44" cy="44" r="38"
            fill="none"
            stroke={verdict.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: verdict.color, fontVariantNumeric: 'tabular-nums' }}>
            {score}<span className="text-base font-medium" style={{ color: T.muted }}>/{questions.length}</span>
          </span>
          <span className="text-[10px]" style={{ color: T.muted }}>{pct}%</span>
        </div>
      </div>

      <OrnamentDivider />

      {/* Answer Breakdown */}
      <div className="w-full space-y-2">
        <p style={{ fontSize: 10, color: T.muted, letterSpacing: 3 }} className="uppercase font-semibold">Chi tiết từng câu</p>
        {answers.map((a, i) => (
          <motion.div
            key={a.questionId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
            style={{
              background: a.isCorrect ? 'rgba(74,124,89,0.06)' : 'rgba(139,32,32,0.05)',
              border: `1px solid ${a.isCorrect ? 'rgba(74,124,89,0.15)' : 'rgba(139,32,32,0.12)'}`,
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: a.isCorrect ? T.moss : T.crimson, color: '#FEF6E8' }}
            >
              {a.isCorrect ? '✓' : '✕'}
            </span>
            <span className="text-xs" style={{ color: T.ink }}>Câu {i + 1}</span>
            <span className="ml-auto text-[11px] font-medium" style={{ color: a.isCorrect ? T.moss : T.crimson }}>
              {a.isCorrect ? 'Đúng' : `Sai — Đáp án: ${questions[i]?.correct_answer ?? '?'}`}
            </span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={resetQuiz}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, #C47C2B, #A0622B)`,
          color: '#FEF6E8',
          boxShadow: '0 4px 20px rgba(196,124,43,0.25)',
        }}
      >
        <RefreshCcw className="w-4 h-4" />
        Luyện tập phiên mới
      </button>
    </motion.div>
  );
}



// ── Root ───────────────────────────────────────────────────────────────────
export default function DharmaQuizPortal({ tenantId }: DharmaQuizPortalProps) {
  const quiz = useWebQuiz(tenantId);

  return (
    <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'Lora', 'Playfair Display', Georgia, serif" }}>
      <AnimatePresence mode="wait">
        {quiz.phase === 'setup'  && <SetupScreen  key="setup"  quiz={quiz} />}
        {quiz.phase === 'quiz'   && <QuizScreen   key="quiz"   quiz={quiz} />}
        {quiz.phase === 'result' && <ResultScreen key="result" quiz={quiz} />}
      </AnimatePresence>
    </div>
  );
}
