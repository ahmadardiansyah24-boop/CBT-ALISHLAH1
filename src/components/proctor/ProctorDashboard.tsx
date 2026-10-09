import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { ProctorLiveMonitor } from './ProctorLiveMonitor';
import { ProctorQuestionBank } from './ProctorQuestionBank';
import { ProctorExamManager } from './ProctorExamManager';
import { ProctorStudentManager } from './ProctorStudentManager';
import { ProctorReports } from './ProctorReports';
import { ProctorSchoolProfile } from './ProctorSchoolProfile';
import {
  Users,
  BookOpen,
  Calendar,
  BarChart2,
  School,
  KeyRound,
  RotateCcw,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Sparkles,
  Activity,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const ProctorDashboard: React.FC = () => {
  const {
    schoolProfile,
    currentExam,
    students,
    studentSessions,
    generateExamToken,
    setUserRole,
    adminUser,
    logoutAdmin,
  } = useCBT();

  const [activeTab, setActiveTab] = useState<'monitor' | 'questions' | 'exams' | 'students' | 'reports' | 'school'>('monitor');
  const [copiedToken, setCopiedToken] = useState(false);

  // Compute live metrics
  const totalStudents = students.length;
  let inProgressCount = 0;
  let completedCount = 0;
  let blockedCount = 0;
  let totalScore = 0;

  students.forEach((s) => {
    const sess = studentSessions[s.id];
    if (sess) {
      if (sess.status === 'in_progress') inProgressCount++;
      else if (sess.status === 'completed') {
        completedCount++;
        totalScore += sess.score || 0;
      } else if (sess.status === 'blocked') blockedCount++;
    }
  });

  const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

  const handleCopyToken = () => {
    if (currentExam) {
      navigator.clipboard.writeText(currentExam.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleGenerateNewToken = () => {
    if (currentExam) {
      generateExamToken(currentExam.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Large UNBK-Style Token Banner & Proctor Header */}
      {currentExam && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Panel Pusat Kontrol Proktor Ujian
                </span>
                <span className="text-xs text-slate-300">
                  {schoolProfile.name}
                </span>
                {adminUser && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Login: {adminUser.name}
                  </span>
                )}
                <button
                  onClick={() => logoutAdmin()}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                  title="Keluar dari sesi Administrator"
                >
                  Keluar Admin (Logout)
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {currentExam.title}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200">
                Mata Pelajaran: <strong>{currentExam.subject}</strong> • Durasi: <strong>{currentExam.durationMinutes} Menit</strong> • KKM: <strong>{currentExam.kkm}</strong>
              </p>
            </div>

            {/* UNBK Token Highlight Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-md">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  Token Rilis Ujian Siswa
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-white mt-0.5 select-all">
                  {currentExam.token}
                </div>
                <div className="flex items-center gap-2 mt-1.5 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerateNewToken}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Buat Token Baru"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rilis Baru</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Peserta</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalStudents}</p>
          <span className="text-[11px] text-slate-500">Terdaftar di rombel</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sedang Mengerjakan</span>
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{inProgressCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Aktif di ruang CBT
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Selesai Ujian</span>
            <Check className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{completedCount}</p>
          <span className="text-[11px] text-slate-500">Lembar disubmit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Terkunci / Melanggar</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{blockedCount}</p>
          <span className="text-[11px] text-rose-700 font-semibold">
            {blockedCount > 0 ? 'Perlu tindakan proktor' : 'Semua aman'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rata-Rata Nilai</span>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">{avgScore}</p>
          <span className="text-[11px] text-slate-500">Skala 100</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'monitor'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Monitoring Peserta</span>
          {inProgressCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white">
              {inProgressCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bank Soal & Formula</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Paket Ujian & Jadwal</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Peserta & Kartu</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Rekap Nilai & Berita Acara</span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'school'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Profil Sekolah</span>
        </button>
      </div>

      {/* 4. Active Tab Content */}
      <div className="pt-1">
        {activeTab === 'monitor' && <ProctorLiveMonitor />}
        {activeTab === 'questions' && <ProctorQuestionBank />}
        {activeTab === 'exams' && <ProctorExamManager />}
        {activeTab === 'students' && <ProctorStudentManager />}
        {activeTab === 'reports' && <ProctorReports />}
        {activeTab === 'school' && <ProctorSchoolProfile />}
      </div>
    </div>
  );
};
