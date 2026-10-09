import React from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Wifi,
  WifiOff,
  RotateCcw,
  Sparkles,
  KeyRound,
  Users,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    schoolProfile,
    userRole,
    setUserRole,
    currentStudent,
    logoutStudent,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin,
    isSimulatedOffline,
    toggleSimulatedOffline,
    currentExam,
    generateExamToken,
    resetAllToFactoryDefaults,
  } = useCBT();

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  CBT SEKOLAH PRO
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  v2.6 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-md">
                {schoolProfile.name} • {schoolProfile.academicYear}
              </p>
            </div>
          </div>

          {/* Center Info / Active Exam Pill */}
          {currentExam && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                {currentExam.subject}
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                <KeyRound className="w-3 h-3" />
                <span>{currentExam.token}</span>
              </div>
            </div>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Simulated Offline Toggle */}
            <button
              onClick={toggleSimulatedOffline}
              title={
                isSimulatedOffline
                  ? 'Koneksi internet terputus (CBT menggunakan autosave & cache lokal offline)'
                  : 'Koneksi stabil online (Klik untuk menguji ketahanan offline CBT)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSimulatedOffline
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Mode Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Role / Auth Status & Switcher */}
            <div className="flex items-center gap-1.5">
              {/* If Admin logged in and in proctor role */}
              {userRole === 'proctor' && isAdminLoggedIn && (
                <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl bg-slate-900 text-white text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold hidden sm:inline text-[11px]">
                    {adminUser?.name || 'Administrator'}
                  </span>
                  <button
                    onClick={() => logoutAdmin()}
                    className="ml-1 px-2 py-0.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    title="Keluar dari sesi Admin"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* If Student logged in and in student role */}
              {userRole === 'student' && currentStudent && (
                <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold hidden sm:inline text-[11px] truncate max-w-[120px]">
                    {currentStudent.name}
                  </span>
                  <button
                    onClick={() => logoutStudent()}
                    className="ml-1 px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                    title="Keluar dari akun Siswa"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Portal Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setUserRole('student')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    userRole === 'student'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Portal Siswa</span>
                  <span className="sm:hidden">Siswa</span>
                </button>
                <button
                  onClick={() => setUserRole('proctor')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    userRole === 'proctor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Portal Admin</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              </div>
            </div>

            {/* Factory Reset button */}
            <button
              onClick={() => {
                if (confirm('Kembalikan semua data ujian, siswa, dan sesi ke pengaturan awal (default demo)?')) {
                  resetAllToFactoryDefaults();
                }
              }}
              title="Reset Data Ujian ke Standar Demo"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
