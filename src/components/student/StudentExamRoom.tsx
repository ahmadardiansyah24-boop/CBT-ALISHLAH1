import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCBT } from '../../context/CBTContext';
import { FormulaRenderer } from '../common/FormulaRenderer';
import { Question } from '../../types/cbt';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  ShieldAlert,
  Send,
  Eye,
  Lock,
  Wifi,
  WifiOff,
  Check,
  Grid3X3,
  X,
  Sparkles,
} from 'lucide-react';

interface StudentExamRoomProps {
  onExamFinished: () => void;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({ onExamFinished }) => {
  const {
    currentStudent,
    currentExam,
    currentStudentSession,
    getExamQuestions,
    saveStudentAnswer,
    toggleStudentDoubtful,
    recordViolation,
    finishAndSubmitExam,
    isSimulatedOffline,
  } = useCBT();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [confirmAgreed, setConfirmAgreed] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [audioPlayedCount, setAudioPlayedCount] = useState<Record<string, number>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const questions = currentExam ? getExamQuestions(currentExam.id) : [];

  // Determine current question based on session order or default
  const questionOrder = currentStudentSession?.questionOrder || questions.map((q) => q.id);
  const currentQuestionId = questionOrder[currentQuestionIndex] || questions[0]?.id;
  const currentQuestion = questions.find((q) => q.id === currentQuestionId) || questions[0];

  const currentAnswer = currentStudentSession?.answers[currentQuestionId] || {};
  const isBlocked = currentStudentSession?.status === 'blocked';
  const isFinished = currentStudentSession?.status === 'completed';

  // If already finished, notify parent
  useEffect(() => {
    if (isFinished) {
      onExamFinished();
    }
  }, [isFinished, onExamFinished]);

  // Anti-Cheating: Fullscreen, Tab Switch, Blur, and Key Shortcuts
  useEffect(() => {
    if (isBlocked || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const reason = 'Terdeteksi berpindah tab browser atau membuka aplikasi lain';
        recordViolation('tab_switch', reason);
        setWarningMessage(`PERINGATAN INTEGRITAS: Anda terdeteksi keluar dari jendela ujian!`);
      }
    };

    const handleWindowBlur = () => {
      // Blur can fire during normal clicks inside iframes, so we record with a gentle throttle
      // recordViolation('tab_switch', 'Kehilangan fokus jendela');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent dev tools and inspect keys
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        recordViolation('devtools', 'Mencoba membuka Developer Tools / Inspect Element');
        setWarningMessage('DILARANG membuka alat inspeksi atau pintasan pengembang!');
      }

      // Prevent Copy / Paste
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        recordViolation('copy_paste', 'Mencoba menyalin/menempel teks (Copy-Paste)');
        setWarningMessage('Pintasan salin/tempel (Copy-Paste) dinonaktifkan dalam ruang ujian!');
      }

      // Keyboard shortcuts A, B, C, D, E for single choice questions
      if (currentQuestion && currentQuestion.type === 'single_choice' && !isGridOpen && !isConfirmSubmitOpen) {
        const keyUpper = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(keyUpper)) {
          const opt = currentQuestion.options?.find((o) => o.id === keyUpper);
          if (opt) {
            handleSelectOption(keyUpper);
          }
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isBlocked, isFinished, currentQuestion, isGridOpen, isConfirmSubmitOpen, recordViolation]);

  // Audio simulation player
  const handlePlayAudio = (qId: string) => {
    const currentPlays = audioPlayedCount[qId] || 0;
    if (currentPlays >= 3) {
      alert('Batas pemutaran audio (maksimal 3 kali) telah tercapai!');
      return;
    }

    setIsPlayingAudio(true);
    setAudioPlayedCount((prev) => ({ ...prev, [qId]: currentPlays + 1 }));

    // Simulate Web Audio Synthesizer Beep/Dialogue Tone so user hears actual audio sound!
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }
    } catch {
      // Ignore if audio context not allowed
    }

    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3000);
  };

  // Option select handler
  const handleSelectOption = (optId: string) => {
    setSaveStatus('saving');
    saveStudentAnswer(currentQuestionId, { selectedOptionId: optId });
    setTimeout(() => setSaveStatus('saved'), 150);
  };

  const handleToggleMultiChoice = (optId: string) => {
    const prevList = currentAnswer.selectedOptionIds || [];
    const nextList = prevList.includes(optId)
      ? prevList.filter((id) => id !== optId)
      : [...prevList, optId];

    setSaveStatus('saving');
    saveStudentAnswer(currentQuestionId, { selectedOptionIds: nextList });
    setTimeout(() => setSaveStatus('saved'), 150);
  };

  const handleTrueFalseSelect = (statementId: string, value: boolean) => {
    const prevMap = currentAnswer.trueFalseAnswers || {};
    const nextMap = { ...prevMap, [statementId]: value };

    setSaveStatus('saving');
    saveStudentAnswer(currentQuestionId, { trueFalseAnswers: nextMap });
    setTimeout(() => setSaveStatus('saved'), 150);
  };

  const handleShortAnswerChange = (val: string) => {
    setSaveStatus('saving');
    saveStudentAnswer(currentQuestionId, { shortAnswerText: val });
    setTimeout(() => setSaveStatus('saved'), 150);
  };

  const handleDoubtful = () => {
    toggleStudentDoubtful(currentQuestionId);
  };

  // Format Timer
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = currentStudentSession?.remainingSeconds ?? (currentExam?.durationMinutes ?? 90) * 60;
  const isTimerCritical = remainingSeconds < 300; // < 5 minutes
  const isTimerWarning = remainingSeconds < 600; // < 10 minutes

  // Question navigation counts
  const totalQuestions = questionOrder.length;
  let answeredCount = 0;
  let doubtfulCount = 0;

  questionOrder.forEach((qid) => {
    const a = currentStudentSession?.answers[qid];
    if (a) {
      if (a.isDoubtful) doubtfulCount++;
      const hasAnswer =
        a.selectedOptionId ||
        (a.selectedOptionIds && a.selectedOptionIds.length > 0) ||
        (a.trueFalseAnswers && Object.keys(a.trueFalseAnswers).length > 0) ||
        (a.shortAnswerText && a.shortAnswerText.trim().length > 0);
      if (hasAnswer) answeredCount++;
    }
  });

  const unansweredCount = totalQuestions - answeredCount;

  // Render font size class
  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  if (!currentStudent || !currentExam || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500 font-semibold">Memuat Ruang Ujian CBT...</div>
      </div>
    );
  }

  // Blocked View if maximum violations exceeded
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl border-4 border-red-600 space-y-5">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800">
              Sesi Ujian Ditangguhkan
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              AKUN UJIAN TERKUNCI!
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Sistem mendeteksi <strong>{currentStudentSession?.violations.length || 3} pelanggaran</strong> tata tertib ujian (berpindah tab, keluar mode layar penuh, atau membuka aplikasi lain).
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left text-xs text-red-900 space-y-1">
            <div className="font-bold text-red-800 uppercase tracking-wider">Log Riwayat Pelanggaran:</div>
            {currentStudentSession?.violations.map((v, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>{v.reason} ({new Date(v.timestamp).toLocaleTimeString('id-ID')})</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-slate-500">
            Silakan laporkan ke <strong>Proktor / Pengawas Ruangan</strong> untuk verifikasi dan pembukaan kunci (Reset Login).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* Top Fixed CBT Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Left Student Info */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentStudent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base truncate max-w-[140px] sm:max-w-xs text-white">
                  {currentStudent.name}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                  {currentStudent.username}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {currentExam.subject} • {currentStudent.classRoom}
              </p>
            </div>
          </div>

          {/* Center Timer Countdown */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base border transition-all ${
                isTimerCritical
                  ? 'bg-red-600/90 text-white border-red-400 animate-pulse'
                  : isTimerWarning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-emerald-400 border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          </div>

          {/* Right Action Tools: Font Resizer, Autosave Status, Grid Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Font Resizer */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-bold border border-slate-700">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'sm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Tulisan Kecil"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'base' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Tulisan Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'lg' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Ukuran Tulisan Besar"
              >
                A+
              </button>
            </div>

            {/* Offline/Autosave indicator */}
            <div
              className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-300 px-2 py-1 rounded bg-slate-800 border border-slate-700"
              title={
                isSimulatedOffline
                  ? 'Koneksi offline: jawaban disimpan aman di perangkat Anda'
                  : 'Koneksi aktif: jawaban tersinkronisasi'
              }
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Cache Lokal</span>
                </>
              ) : (
                <>
                  <Check className={`w-3.5 h-3.5 ${saveStatus === 'saved' ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
                  <span className="text-emerald-300">Tersimpan</span>
                </>
              )}
            </div>

            {/* Toggle Grid Daftar Soal */}
            <button
              onClick={() => setIsGridOpen(!isGridOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-xs cursor-pointer transition-all"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar Soal</span>
              <span className="font-mono bg-blue-800 px-1.5 py-0.2 rounded text-[10px]">
                {answeredCount}/{totalQuestions}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Violation / Anti-cheat Warning Toast */}
      {warningMessage && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{warningMessage}</span>
          </div>
          <button
            onClick={() => setWarningMessage(null)}
            className="p-1 hover:bg-red-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left / Center: Question & Answer Area (Spans 3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Question Header Bar */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
                  SOAL NO. {currentQuestionIndex + 1}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  dari {totalQuestions} Soal
                </span>
                {currentQuestion.topic && (
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    Topik: {currentQuestion.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Bobot: {currentQuestion.weight} Poin
                </span>
                {currentAnswer.isDoubtful && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-600" />
                    Ragu-ragu
                  </span>
                )}
              </div>
            </div>

            {/* Question Content Body */}
            <div className={`p-5 sm:p-7 space-y-6 ${fontSizeClasses[fontSize]}`}>
              {/* Optional Audio Player (for Listening questions) */}
              {currentQuestion.audio && (
                <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Listening Audio Track
                      </span>
                      <p className="text-xs text-indigo-700">
                        {currentQuestion.audioCaption || 'Dengarkan percakapan audio berikut:'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPlayingAudio}
                      onClick={() => handlePlayAudio(currentQuestion.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Volume2 className="w-4 h-4 animate-ping" />
                          <span>Memutar Audio...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Putar Suara (Diputar: {audioPlayedCount[currentQuestion.id] || 0}/3)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Question Image */}
              {currentQuestion.image && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-xl mx-auto">
                  <img
                    src={currentQuestion.image}
                    alt="Ilustrasi Soal CBT"
                    className="w-full max-h-72 object-contain mx-auto"
                  />
                  {currentQuestion.imageCaption && (
                    <p className="text-[11px] text-center text-slate-500 py-1.5 px-3 italic bg-slate-100 border-t border-slate-200">
                      {currentQuestion.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Question Prompt with KaTeX LaTeX Support */}
              <div className="text-slate-900 leading-relaxed font-normal">
                <FormulaRenderer content={currentQuestion.prompt} />
              </div>

              {/* Options Section based on Question Type */}
              <div className="pt-2 space-y-3">
                {/* 1. Single Choice (Pilihan Ganda A, B, C, D, E) */}
                {currentQuestion.type === 'single_choice' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentAnswer.selectedOptionId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(option.id)}
                          className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {option.id}
                          </span>
                          <div className="flex-1 min-w-0 pt-0.5 text-slate-800">
                            <FormulaRenderer content={option.text} />
                            {option.image && (
                              <img
                                src={option.image}
                                alt={`Pilihan ${option.id}`}
                                className="mt-2 max-h-36 rounded-lg border border-slate-200"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Multi Choice (Pilihan Ganda Kompleks) */}
                {currentQuestion.type === 'multi_choice' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                      Pilihlah satu atau lebih jawaban yang tepat:
                    </div>
                    {currentQuestion.options.map((option) => {
                      const isSelected = (currentAnswer.selectedOptionIds || []).includes(option.id);
                      return (
                        <label
                          key={option.id}
                          onClick={() => handleToggleMultiChoice(option.id)}
                          className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-1 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0 text-slate-800">
                            <FormulaRenderer content={option.text} />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 3. True / False Statement Table */}
                {currentQuestion.type === 'true_false' && currentQuestion.trueFalseStatements && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="p-3 sm:p-4">Pernyataan</th>
                          <th className="p-3 sm:p-4 w-24 text-center">Benar</th>
                          <th className="p-3 sm:p-4 w-24 text-center">Salah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {currentQuestion.trueFalseStatements.map((item) => {
                          const userVal = (currentAnswer.trueFalseAnswers || {})[item.id];
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="p-3 sm:p-4 text-slate-800">
                                <FormulaRenderer content={item.statement} />
                              </td>
                              <td className="p-3 sm:p-4 text-center">
                                <input
                                  type="radio"
                                  name={`tf-${item.id}`}
                                  checked={userVal === true}
                                  onChange={() => handleTrueFalseSelect(item.id, true)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="p-3 sm:p-4 text-center">
                                <input
                                  type="radio"
                                  name={`tf-${item.id}`}
                                  checked={userVal === false}
                                  onChange={() => handleTrueFalseSelect(item.id, false)}
                                  className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. Short Answer */}
                {currentQuestion.type === 'short_answer' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Ketikkan Jawaban Anda:
                    </label>
                    <input
                      type="text"
                      value={currentAnswer.shortAnswerText || ''}
                      onChange={(e) => handleShortAnswerChange(e.target.value)}
                      placeholder="Tuliskan jawaban singkat Anda di sini..."
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden bg-slate-50/50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation Buttons Bar */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {/* Prev Button */}
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Ragu-Ragu Checkbox Button */}
              <button
                type="button"
                onClick={handleDoubtful}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  currentAnswer.isDoubtful
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Ragu - Ragu</span>
              </button>

              {/* Next / Submit Button */}
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Selesai Ujian</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Grid Matrix (Desktop view + collapsible) */}
        <aside
          className={`${
            isGridOpen
              ? 'fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center lg:static lg:bg-transparent lg:p-0 lg:block'
              : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Daftar Nomor Soal
                </h3>
                <p className="text-xs text-slate-500">Klik nomor untuk berpindah soal</p>
              </div>
              {isGridOpen && (
                <button
                  onClick={() => setIsGridOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
              <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                ● Dijawab ({answeredCount})
              </div>
              <div className="p-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                ● Ragu ({doubtfulCount})
              </div>
              <div className="p-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                ● Kosong ({unansweredCount})
              </div>
            </div>

            {/* Matrix Numbers */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {questionOrder.map((qid, idx) => {
                const ans = currentStudentSession?.answers[qid];
                const isActive = idx === currentQuestionIndex;
                const isDoubt = ans?.isDoubtful;
                const hasAns =
                  ans?.selectedOptionId ||
                  (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                  (ans?.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) ||
                  (ans?.shortAnswerText && ans.shortAnswerText.trim().length > 0);

                let bgClass = 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100';
                if (isDoubt) {
                  bgClass = 'bg-amber-400 text-amber-950 border-amber-500 font-black';
                } else if (hasAns) {
                  bgClass = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                }

                if (isActive) {
                  bgClass += ' ring-2 ring-blue-600 ring-offset-2';
                }

                return (
                  <button
                    key={qid}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsGridOpen(false);
                    }}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition-all cursor-pointer relative ${bgClass}`}
                  >
                    <span>{idx + 1}</span>
                    {ans?.selectedOptionId && (
                      <span className="text-[9px] font-mono leading-none opacity-90">
                        {ans.selectedOptionId}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Selesai Ujian Action in Sidebar */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsGridOpen(false);
                  setIsConfirmSubmitOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Akhiri Ujian Sekarang</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Confirmation Finish Modal */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">
                  Konfirmasi Selesai Ujian
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pastikan Anda telah memeriksa lembar jawaban sebelum mengakhiri sesi.
                </p>
              </div>
            </div>

            {/* Answer Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[11px] font-medium text-slate-500">Sudah Dijawab</span>
                <p className="text-xl font-black text-emerald-600">{answeredCount}</p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500">Ragu - Ragu</span>
                <p className="text-xl font-black text-amber-600">{doubtfulCount}</p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500">Belum Dijawab</span>
                <p className="text-xl font-black text-slate-600">{unansweredCount}</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Masih ada <strong>{unansweredCount} soal</strong> yang belum Anda jawab. Apakah Anda yakin ingin tetap menyelesaikan ujian?
                </span>
              </div>
            )}

            {doubtfulCount > 0 && (
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <span>
                  Terdapat <strong>{doubtfulCount} soal</strong> dengan status ragu-ragu.
                </span>
              </div>
            )}

            {/* Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={confirmAgreed}
                onChange={(e) => setConfirmAgreed(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
              />
              <span>
                Saya telah memeriksa seluruh jawaban dan secara sadar bersedia mengakhiri ujian ini secara permanen.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal & Lanjut Mengerjakan
              </button>
              <button
                type="button"
                disabled={!confirmAgreed}
                onClick={() => {
                  setIsConfirmSubmitOpen(false);
                  finishAndSubmitExam();
                  onExamFinished();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Ya, Selesaikan Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
