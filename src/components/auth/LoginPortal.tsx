import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { StudentLogin } from '../student/StudentLogin';
import { AdminLogin } from '../admin/AdminLogin';
import {
  GraduationCap,
  ShieldCheck,
  Server,
  Activity,
  Cpu,
  KeyRound,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

interface LoginPortalProps {
  onStudentLoginSuccess: () => void;
  onAdminLoginSuccess: () => void;
  initialRole?: 'student' | 'proctor';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onStudentLoginSuccess,
  onAdminLoginSuccess,
  initialRole = 'student',
}) => {
  const { schoolProfile, currentExam } = useCBT();
  const [activePortalTab, setActivePortalTab] = useState<'student' | 'admin'>(
    initialRole === 'proctor' ? 'admin' : 'student'
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* School Crest / Branding */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 mb-3">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {schoolProfile.name}
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
          {schoolProfile.examTitle}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Tahun Pelajaran {schoolProfile.academicYear} • Semester {schoolProfile.semester}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Tab Selection: Siswa vs Admin/Proktor */}
        <div className="bg-slate-200/90 p-1 rounded-2xl flex items-center mb-4 shadow-2xs border border-slate-300/80">
          <button
            type="button"
            onClick={() => setActivePortalTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePortalTab === 'student'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Login Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePortalTab === 'admin'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Login Admin / Proktor</span>
          </button>
        </div>

        {/* Card Content Container */}
        <div className="bg-white py-6 px-5 sm:px-8 shadow-xl shadow-slate-200/70 rounded-2xl border border-slate-200/90">
          {activePortalTab === 'student' ? (
            <StudentLogin onLoginSuccess={onStudentLoginSuccess} />
          ) : (
            <AdminLogin
              onLoginSuccess={onAdminLoginSuccess}
              onSwitchToStudent={() => setActivePortalTab('student')}
            />
          )}
        </div>

        {/* Server & Network Status Banner */}
        <div className="mt-4 p-3.5 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">Status Server CBT:</span>
            <span className="text-emerald-700 font-bold">Online & Sinkron</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Sesi: PAS Gasal</span>
            <span className="text-blue-700 font-bold">● Port 3000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
