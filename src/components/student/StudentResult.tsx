import React, { useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import { FormulaRenderer } from '../common/FormulaRenderer';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  HelpCircle,
  Printer,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

interface StudentResultProps {
  onBackToHome: () => void;
}

export const StudentResult: React.FC<StudentResultProps> = ({ onBackToHome }) => {
  const {
    currentStudent,
    currentExam,
    currentStudentSession,
    getExamQuestions,
    schoolProfile,
    logoutStudent,
  } = useCBT();

  const questions = currentExam ? getExamQuestions(currentExam.id) : [];
  const session = currentStudentSession;
  const isPassed = session?.isPassed ?? false;
  const score = session?.score ?? 0;
  const percentage = session?.percentage ?? 0;

  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isPassed]);

  if (!currentStudent || !currentExam || !session) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Official Result Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Printable Kop Sekolah (visible in print) */}
        <div className="hidden print:block p-6 text-center border-b-2 border-black">
          <h2 className="text-xl font-bold uppercase">{schoolProfile.name}</h2>
          <p className="text-xs">{schoolProfile.address}, {schoolProfile.city}</p>
          <p className="text-xs font-semibold mt-1">LEMBAR HASIL NILAI UJIAN BERBASIS KOMPUTER (CBT)</p>
        </div>

        {/* Header */}
        <div
          className={`p-6 sm:p-8 text-white ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800'
              : 'bg-gradient-to-r from-amber-600 via-rose-700 to-rose-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                {isPassed ? (
                  <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300" />
                ) : (
                  <Award className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Laporan Hasil Ujian CBT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">{currentStudent.name}</h1>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                  {currentStudent.username} • {currentStudent.classRoom} • {currentExam.subject}
                </p>
              </div>
            </div>

            {/* Score Big Badge */}
            <div className="bg-white text-slate-900 px-6 py-4 rounded-2xl shadow-lg text-center min-w-[140px]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Nilai Akhir
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-blue-700">
                {score}
              </div>
              <div
                className={`mt-1 inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isPassed ? 'TUNTAS (LULUS)' : 'BELUM TUNTAS'}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Kriteria KKM</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{currentExam.kkm}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Persentase</span>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{percentage}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Waktu Selesai</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono">
                {session.finishedAt ? new Date(session.finishedAt).toLocaleTimeString('id-ID') : '-'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Pelanggaran</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {session.violations.length} Kali
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil Ujian (Print / PDF)</span>
            </button>

            <button
              onClick={() => {
                logoutStudent();
                onBackToHome();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Keluar / Ganti Akun</span>
            </button>
          </div>

          {/* Review Answers & Explanations */}
          {currentExam.showResultToStudent && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Rincian Pembahasan Soal & Kunci Jawaban</span>
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userAns = session.answers[q.id];
                  let isCorrect = false;

                  if (q.type === 'single_choice') {
                    isCorrect = userAns?.selectedOptionId === q.answerKey;
                  } else if (q.type === 'short_answer') {
                    isCorrect =
                      (userAns?.shortAnswerText || '').trim().toLowerCase() ===
                      String(q.answerKey || '').trim().toLowerCase();
                  }

                  return (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          Soal Nomor {idx + 1} ({q.weight} Poin)
                        </span>
                        <div className="flex items-center gap-1 font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Benar
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Belum Tepat
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-900">
                        <FormulaRenderer content={q.prompt} />
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Jawaban Anda:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            {userAns?.selectedOptionId || userAns?.shortAnswerText || '(Tidak dijawab)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Kunci Jawaban:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {Array.isArray(q.answerKey) ? q.answerKey.join(', ') : q.answerKey}
                          </span>
                        </div>
                        {q.explanation && (
                          <div className="pt-2 text-slate-600 border-t border-slate-100 mt-2">
                            <span className="font-bold text-blue-900 block mb-0.5">Penjelasan Ilmiah:</span>
                            <FormulaRenderer content={q.explanation} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
