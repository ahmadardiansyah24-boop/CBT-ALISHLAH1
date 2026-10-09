import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { StudentExamSession, Student } from '../../types/cbt';
import {
  Users,
  Search,
  Filter,
  RotateCcw,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Eye,
  Send,
  Plus,
  Play,
  Monitor,
  AlertTriangle,
  X,
  Laptop,
} from 'lucide-react';

export const ProctorLiveMonitor: React.FC = () => {
  const {
    students,
    studentSessions,
    currentExam,
    getExamQuestions,
    proctorResetSession,
    proctorExtendDuration,
    proctorUnlockStudent,
    proctorForceSubmit,
  } = useCBT();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'blocked' | 'not_started'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const questions = currentExam ? getExamQuestions(currentExam.id) : [];
  const totalQuestions = questions.length;

  // Filter list
  const filteredStudents = students.filter((s) => {
    const session = studentSessions[s.id];
    const status = session ? session.status : 'not_started';

    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (classFilter !== 'all' && s.classRoom !== classFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchUser = s.username.toLowerCase().includes(q);
      const matchNisn = s.nisn.includes(q);
      if (!matchName && !matchUser && !matchNisn) return false;
    }

    return true;
  });

  const uniqueClasses = Array.from(new Set(students.map((s) => s.classRoom)));

  // Helper for formatting time
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, nomor peserta, atau NISN..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="in_progress">Sedang Mengerjakan</option>
            <option value="completed">Sudah Selesai</option>
            <option value="blocked">Terkunci (Pelanggaran)</option>
            <option value="not_started">Belum Mulai</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
          >
            <option value="all">Semua Kelas</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Peserta</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas / Ruang</th>
                <th className="py-3.5 px-4">Progres Soal</th>
                <th className="py-3.5 px-4">Sisa Waktu</th>
                <th className="py-3.5 px-4">Integritas / Tab</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Proktor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada peserta yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const session = studentSessions[student.id];
                  const status = session ? session.status : 'not_started';

                  // Calculate answered questions
                  let answeredCount = 0;
                  if (session) {
                    Object.values(session.answers).forEach((a) => {
                      if (
                        a.selectedOptionId ||
                        (a.selectedOptionIds && a.selectedOptionIds.length > 0) ||
                        (a.trueFalseAnswers && Object.keys(a.trueFalseAnswers).length > 0) ||
                        (a.shortAnswerText && a.shortAnswerText.trim().length > 0)
                      ) {
                        answeredCount++;
                      }
                    });
                  }

                  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
                  const violationCount = session?.violations.length || 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* No Peserta */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {student.username}
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas / Ruang */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">{student.classRoom}</span>
                        <div className="text-[10px] text-slate-400">{student.roomName}</div>
                      </td>

                      {/* Progres Soal */}
                      <td className="py-3 px-4 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>{answeredCount} / {totalQuestions}</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Sisa Waktu */}
                      <td className="py-3 px-4 font-mono font-semibold">
                        {session && status === 'in_progress' ? (
                          <span className={session.remainingSeconds < 300 ? 'text-red-600 font-bold animate-pulse' : 'text-slate-800'}>
                            {formatTime(session.remainingSeconds)}
                          </span>
                        ) : session && status === 'completed' ? (
                          <span className="text-emerald-600 font-bold">Selesai</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Integritas / Pelanggaran */}
                      <td className="py-3 px-4">
                        {violationCount > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              violationCount >= 3
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                            title={session?.violations.map((v) => v.reason).join('\n')}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>{violationCount}x Peringatan</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Bersih (0)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            Mengerjakan
                          </span>
                        )}
                        {status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Selesai ({session?.score ?? 0})
                          </span>
                        )}
                        {status === 'blocked' && (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-max">
                            <Lock className="w-3 h-3 text-red-600" />
                            Terkunci
                          </span>
                        )}
                        {status === 'not_started' && (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-600 border border-slate-200 w-max">
                            Belum Mulai
                          </span>
                        )}
                      </td>

                      {/* Aksi Proktor */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(student)}
                            title="Lihat Lembar Jawaban & Detail Peserta"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Session / Re-Login */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Reset sesi login untuk siswa ${student.name}? Siswa dapat login kembali dari perangkat lain.`)) {
                                proctorResetSession(student.id);
                              }
                            }}
                            title="Reset Login (Izinkan Re-Login)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Unlock if blocked */}
                          {status === 'blocked' && (
                            <button
                              type="button"
                              onClick={() => proctorUnlockStudent(student.id)}
                              title="Buka Kunci Akun Siswa"
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              Buka Kunci
                            </button>
                          )}

                          {/* Extend Time */}
                          {status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => {
                                proctorExtendDuration(student.id, 15);
                                alert(`Waktu pengerjaan untuk ${student.name} berhasil ditambah 15 menit!`);
                              }}
                              title="Tambah Waktu Ujian (+15 Menit)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Force Submit */}
                          {status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Selesaikan paksa (Force Submit) ujian untuk ${student.name}? Jawaban saat ini akan dinilai.`)) {
                                  proctorForceSubmit(student.id);
                                }
                              }}
                              title="Selesaikan Paksa (Force Submit)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Lembar Jawaban Peserta */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Lembar Pantauan Peserta: {selectedStudentForDetail.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudentForDetail.username} • {selectedStudentForDetail.classRoom} • {selectedStudentForDetail.roomName}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const sess = studentSessions[selectedStudentForDetail.id];
              return (
                <div className="space-y-4 text-xs">
                  {/* System metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-medium">IP Perangkat:</span>
                      <p className="font-bold text-slate-800 font-mono">{sess?.deviceIp || '192.168.1.X'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Peramban (Browser):</span>
                      <p className="font-bold text-slate-800 truncate">{sess?.userAgent || 'Chrome/Windows'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Nilai Sementara / Akhir:</span>
                      <p className="font-black text-blue-700 text-sm">{sess?.score ?? '-'}</p>
                    </div>
                  </div>

                  {/* Violations Log */}
                  {sess && sess.violations.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                      <div className="font-bold text-red-800 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Riwayat Peringatan Pelanggaran ({sess.violations.length})</span>
                      </div>
                      <div className="space-y-1">
                        {sess.violations.map((v, i) => (
                          <div key={i} className="text-red-900 flex justify-between">
                            <span>• {v.reason}</span>
                            <span className="font-mono text-slate-500">
                              {new Date(v.timestamp).toLocaleTimeString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matrix of answers */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px] tracking-wider">
                      Matriks Jawaban Siswa ({questions.length} Butir Soal):
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {questions.map((q, idx) => {
                        const ans = sess?.answers[q.id];
                        const hasAns =
                          ans?.selectedOptionId ||
                          (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                          (ans?.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) ||
                          ans?.shortAnswerText;

                        return (
                          <div
                            key={q.id}
                            className={`p-2 rounded-lg border text-center font-mono ${
                              ans?.isDoubtful
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : hasAns
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="text-[10px] text-slate-500">#{idx + 1}</div>
                            <div className="text-xs truncate">
                              {ans?.selectedOptionId || (hasAns ? '✓' : '-')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
