import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  GraduationCap,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MonitorCheck,
  Zap,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';

interface StudentLoginProps {
  onLoginSuccess: () => void;
  embedded?: boolean;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onLoginSuccess, embedded = false }) => {
  const {
    schoolProfile,
    currentExam,
    students,
    loginStudent,
    quickSwitchStudent,
    generateExamToken,
  } = useCBT();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [token, setToken] = useState(currentExam?.token || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Nomor Peserta atau Username wajib diisi!');
      return;
    }

    if (!token.trim()) {
      setErrorMessage('Token Ujian wajib diisi!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginStudent(username, token);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleQuickLogin = (studentId: string) => {
    quickSwitchStudent(studentId);
    if (currentExam) {
      setToken(currentExam.token);
    }
    onLoginSuccess();
  };

  const content = (
    <div>
      {/* Active Exam Preview Banner */}
      {currentExam && (
        <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                Mata Uji Aktif
              </span>
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {currentExam.durationMinutes} Menit
              </span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 truncate">
              {currentExam.subject}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-slate-600">Token:</span>
              <span className="font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                {currentExam.token}
              </span>
              <button
                type="button"
                onClick={() => setToken(currentExam.token)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nomor Peserta / Username
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: 26-01-001 atau NISN"
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Kata Sandi (Default: 123456)
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Token Ujian
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Dari Proktor Pengawas
            </span>
          </div>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="Contoh: MTK78X"
              maxLength={6}
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm uppercase tracking-widest font-mono font-bold bg-slate-50/50 border border-slate-300 rounded-xl text-indigo-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Memverifikasi Akun...</span>
          ) : (
            <>
              <span>MASUK KE RUANG UJIAN</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Personas */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Simulasi Akun Siswa Demo:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('std-001')}
            className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-slate-800 truncate">Ahmad Fauzi</div>
            <div className="text-[10px] text-emerald-600 font-semibold">● Sedang Ujian (7/10)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('std-002')}
            className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-slate-800 truncate">Siti Nur Aisyah</div>
            <div className="text-[10px] text-blue-600 font-semibold">● Selesai (Skor 100)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('std-003')}
            className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-slate-800 truncate">Budi Santoso</div>
            <div className="text-[10px] text-red-600 font-semibold">● Terkunci (3x Tab)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('std-004')}
            className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-slate-800 truncate">Dewi Rahmawati</div>
            <div className="text-[10px] text-slate-500 font-semibold">● Mulai Ujian Baru</div>
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 mb-3">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {schoolProfile.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
            {schoolProfile.examTitle}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Pelajaran {schoolProfile.academicYear} • Semester {schoolProfile.semester}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80">
          {content}
        </div>

        <div className="mt-4 p-3.5 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">Pemeriksaan Sistem Klien:</span>
            <span className="text-emerald-700 font-medium">Siap Ujian CBT</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Resolusi: {window.innerWidth}×{window.innerHeight}</span>
            <span className="text-emerald-600 font-bold">● Stabil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

