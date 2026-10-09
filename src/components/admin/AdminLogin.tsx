import React, { useState, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onSwitchToStudent?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onSwitchToStudent }) => {
  const { schoolProfile, loginAdmin } = useCBT();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [proctorPin, setProctorPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutSeconds > 0) {
      setErrorMessage(`Percobaan diblokir sementara karena terlalu banyak kesalahan. Tunggu ${lockoutSeconds} detik.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan Kata Sandi Proktor wajib diisi!');
      return;
    }

    if (!proctorPin.trim()) {
      setErrorMessage('PIN Rahasia Proktor wajib diisi! Siswa tidak diizinkan mengakses panel ini.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password, proctorPin);
      setIsLoading(false);
      if (res.success) {
        setFailedAttempts(0);
        onLoginSuccess();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= 5) {
          setLockoutSeconds(30);
          setErrorMessage('Terlalu banyak percobaan gagal! Form login proktor dikunci selama 30 detik.');
        } else {
          setErrorMessage(res.message);
        }
      }
    }, 400);
  };

  return (
    <div className="w-full">
      {/* Security Notice Header */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-900 text-white shadow-xs flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-white block">
            Area Khusus Proktor & Guru Pengawas
          </span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            Halaman ini dilindungi dengan <strong>PIN Keamanan Proktor</strong> untuk mencegah akses tidak sah oleh peserta ujian.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {failedAttempts > 0 && failedAttempts < 5 && (
        <div className="mb-3 text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          Percobaan login gagal: <strong>{failedAttempts}/5</strong>. Terkunci jika 5 kali salah.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Username / ID Proktor
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin atau proktor"
              disabled={lockoutSeconds > 0}
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-50"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kata Sandi Akun
            </label>
          </div>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={lockoutSeconds > 0}
              className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Secret Proctor Security PIN */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN Rahasia Pengawas / Proktor</span>
            </label>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Wajib & Rahasia
            </span>
          </div>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={proctorPin}
              onChange={(e) => setProctorPin(e.target.value)}
              placeholder="Masukkan PIN Rahasia (Hanya Guru/Proktor)"
              maxLength={12}
              disabled={lockoutSeconds > 0}
              className="block w-full pl-10 pr-10 py-2.5 text-sm tracking-widest font-mono font-black bg-rose-50/40 border border-rose-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-tight">
            *PIN ini diberikan oleh koordinator ujian / teknisi sekolah untuk mencegah siswa membuka bank soal atau merilis token.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || lockoutSeconds > 0}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Memverifikasi Otoritas PIN & Akun...</span>
          ) : lockoutSeconds > 0 ? (
            <span>Terkunci Sementara ({lockoutSeconds}s)</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>MASUK KE DASHBOARD PROKTOR</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Discrete Accordion for Authorized Personnel / Evaluator */}
      <div className="mt-5 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowTeacherGuide(!showTeacherGuide)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Informasi Otorisasi (Khusus Guru / Pengawas / Evaluator)</span>
          </span>
          {showTeacherGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTeacherGuide && (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
            <p className="font-semibold text-slate-800">
              Kredensial Resmi Proktor Sekolah:
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Username</span>
                <span className="font-bold text-blue-800">admin</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Kata Sandi</span>
                <span className="font-bold text-blue-800">admin123</span>
              </div>
            </div>

            <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-700">
                PIN Rahasia Pengawas Default:
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono font-black text-sm text-rose-900 tracking-wider">
                  {schoolProfile.proctorPin || '982461'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                    setProctorPin(schoolProfile.proctorPin || '982461');
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                >
                  Isi Otomatis
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              *Proktor dapat mengganti PIN rahasia ini kapan saja melalui menu <strong>Profil Sekolah / Pengaturan</strong> di dashboard proktor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
