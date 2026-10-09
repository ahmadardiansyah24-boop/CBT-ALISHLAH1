import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  User,
  School,
  Play,
  Maximize2,
  KeyRound,
} from 'lucide-react';

interface StudentConfirmProps {
  onStartExam: () => void;
}

export const StudentConfirm: React.FC<StudentConfirmProps> = ({ onStartExam }) => {
  const { currentStudent, currentExam, schoolProfile } = useCBT();
  const [agreed, setAgreed] = useState(false);

  if (!currentStudent || !currentExam) {
    return null;
  }

  const handleStart = () => {
    // Attempt fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback if browser denies fullscreen permission in iframe
      });
    }
    onStartExam();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Konfirmasi Data Peserta Ujian
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                {currentExam.title}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                {schoolProfile.name} • TP {schoolProfile.academicYear}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-blue-200 font-medium">Alokasi Waktu:</span>
              <div className="flex items-center gap-1.5 font-bold text-lg text-amber-300">
                <Clock className="w-5 h-5" />
                <span>{currentExam.durationMinutes} Menit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Identity Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Identitas Peserta</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-slate-500 font-medium">Nomor Peserta</span>
                <span className="col-span-2 font-bold text-slate-900 font-mono">: {currentStudent.username}</span>
                <span className="text-slate-500 font-medium">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {currentStudent.name}</span>
                <span className="text-slate-500 font-medium">NISN</span>
                <span className="col-span-2 font-mono font-medium text-slate-800">: {currentStudent.nisn}</span>
                <span className="text-slate-500 font-medium">Kelas / Rombel</span>
                <span className="col-span-2 font-semibold text-slate-800">: {currentStudent.classRoom}</span>
                <span className="text-slate-500 font-medium">Sesi / Ruang</span>
                <span className="col-span-2 font-semibold text-slate-800">: Sesi {currentStudent.session} ({currentStudent.roomName})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Informasi Ujian</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-slate-500 font-medium">Mata Pelajaran</span>
                <span className="col-span-2 font-bold text-blue-700">: {currentExam.subject}</span>
                <span className="text-slate-500 font-medium">Jumlah Soal</span>
                <span className="col-span-2 font-semibold text-slate-800">: {currentExam.questionIds.length} Butir Soal</span>
                <span className="text-slate-500 font-medium">Kriteria KKM</span>
                <span className="col-span-2 font-semibold text-emerald-700">: {currentExam.kkm} (Skala 100)</span>
                <span className="text-slate-500 font-medium">Token Validasi</span>
                <span className="col-span-2 font-mono font-bold text-indigo-700">: {currentExam.token}</span>
                <span className="text-slate-500 font-medium">Status Soal</span>
                <span className="col-span-2 font-medium text-slate-700">: {currentExam.randomizeQuestions ? 'Acak Soal Aktif' : 'Urutan Normal'}</span>
              </div>
            </div>
          </div>

          {/* Rules & Anti-Cheating Protocol */}
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-900 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Petunjuk Pengerjaan & Ketentuan Anti-Kecurangan (Anti-Cheating)</span>
            </div>
            <ul className="text-xs space-y-2 text-amber-950 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-700">1.</span>
                <span>Ujian wajib dikerjakan dalam mode <strong>Layar Penuh (Fullscreen)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-700">2.</span>
                <span><strong>Dilarang berpindah tab browser</strong>, membuka aplikasi lain, atau menekan tombol Alt+Tab. Setiap aktivitas keluar jendela akan tercatat di log proktor. Pelanggaran 3x otomatis mengunci ujian Anda!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-700">3.</span>
                <span>Jawaban Anda <strong>tersimpan otomatis secara real-time</strong>. Jika koneksi terputus sesaat, jawaban tetap aman di cache lokal dan akan sinkronisasi saat terhubung kembali.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-700">4.</span>
                <span>Gunakan tombol <strong>Ragu-Ragu (Kuning)</strong> bila belum yakin dengan jawaban yang dipilih.</span>
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
              />
              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                Saya menyatakan bahwa data identitas di atas adalah benar milik saya, dan saya bersedia mematuhi seluruh tata tertib ujian sekolah secara jujur dan berintegritas.
              </span>
            </label>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStart}
              disabled={!agreed}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>MULAI KERJAKAN UJIAN SEKARANG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
