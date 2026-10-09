import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { Exam } from '../../types/cbt';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  KeyRound,
  RotateCcw,
  Sparkles,
  Shuffle,
  ShieldAlert,
  Award,
  X,
} from 'lucide-react';

export const ProctorExamManager: React.FC = () => {
  const {
    exams,
    activeExamId,
    setActiveExamId,
    createExam,
    updateExam,
    deleteExam,
    generateExamToken,
  } = useCBT();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('Kelas XII MIPA');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [kkm, setKkm] = useState(75);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [showResultToStudent, setShowResultToStudent] = useState(true);
  const [maxViolations, setMaxViolations] = useState(3);

  const handleOpenNew = () => {
    setEditingExamId(null);
    setTitle('Penilaian Akhir Semester - Kimia Terapan');
    setSubject('Kimia');
    setClassLevel('Kelas XII MIPA');
    setDurationMinutes(90);
    setKkm(75);
    setRandomizeQuestions(true);
    setRandomizeOptions(true);
    setShowResultToStudent(true);
    setMaxViolations(3);
    setIsModalOpen(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setSubject(exam.subject);
    setClassLevel(exam.classLevel);
    setDurationMinutes(exam.durationMinutes);
    setKkm(exam.kkm);
    setRandomizeQuestions(exam.randomizeQuestions);
    setRandomizeOptions(exam.randomizeOptions);
    setShowResultToStudent(exam.showResultToStudent);
    setMaxViolations(exam.maxViolations);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExamId) {
      updateExam(editingExamId, {
        title,
        subject,
        classLevel,
        durationMinutes,
        kkm,
        randomizeQuestions,
        randomizeOptions,
        showResultToStudent,
        maxViolations,
      });
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        title,
        subject,
        classLevel,
        durationMinutes,
        kkm,
        token: 'CBT' + Math.floor(100 + Math.random() * 900),
        tokenExpiresAt: Date.now() + 15 * 60 * 1000,
        status: 'active',
        randomizeQuestions,
        randomizeOptions,
        showResultToStudent,
        allowReview: true,
        maxViolations,
        passingScore: kkm,
        createdAt: new Date().toISOString(),
        questionIds: [],
      };
      createExam(newExam);
      setActiveExamId(newExam.id);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">
            Daftar Paket Ujian CBT
          </h3>
          <p className="text-xs text-slate-500">
            Kelola jadwal, durasi pengerjaan, KKM, dan token ujian peserta.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Paket Ujian Baru</span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => {
          const isActive = exam.id === activeExamId;

          return (
            <div
              key={exam.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {exam.classLevel}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                      Sedang Aktif
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  {exam.title}
                </h4>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  Mata Pelajaran: {exam.subject}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3 mt-2 border-y border-slate-100 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.durationMinutes} Menit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>KKM: {exam.kkm}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.randomizeQuestions ? 'Acak Soal: Ya' : 'Acak: Tidak'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    <span>Maks Tab: {exam.maxViolations}x</span>
                  </div>
                </div>

                {/* Token UNBK Box */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-none">
                        Token Ujian:
                      </span>
                      <span className="font-mono font-black text-sm text-indigo-900 tracking-wider">
                        {exam.token}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => generateExamToken(exam.id)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Generate Token Baru"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveExamId(exam.id)}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 opacity-80 cursor-default'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {isActive ? 'Ujian Aktif Saat Ini' : 'Aktifkan Ujian Ini'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(exam)}
                    className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Ujian"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {exams.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus paket ujian "${exam.title}"?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Hapus Ujian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Buat/Edit Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">
                {editingExamId ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Ujian
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sasaran Tingkat / Kelas
                  </label>
                  <input
                    type="text"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    min={10}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    KKM (Skala 100)
                  </label>
                  <input
                    type="number"
                    value={kkm}
                    onChange={(e) => setKkm(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    min={50}
                    max={100}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Toleransi Tab
                  </label>
                  <input
                    type="number"
                    value={maxViolations}
                    onChange={(e) => setMaxViolations(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    min={1}
                    max={10}
                    required
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Acak Urutan Soal untuk Setiap Siswa</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeOptions}
                    onChange={(e) => setRandomizeOptions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Acak Urutan Pilihan Opsi (A, B, C, D, E)</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showResultToStudent}
                    onChange={(e) => setShowResultToStudent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Tampilkan Skor & Pembahasan ke Siswa Setelah Submit</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  Simpan Paket Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
