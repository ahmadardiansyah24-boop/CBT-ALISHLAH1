import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  Calendar,
  Users,
} from 'lucide-react';

export const ProctorReports: React.FC = () => {
  const {
    schoolProfile,
    currentExam,
    students,
    studentSessions,
    getExamQuestions,
  } = useCBT();

  const [activeTab, setActiveTab] = useState<'rekap' | 'analisis' | 'berita_acara' | 'daftar_hadir'>('rekap');

  const questions = currentExam ? getExamQuestions(currentExam.id) : [];

  // Compute student results list
  const results = students.map((s) => {
    const session = studentSessions[s.id];
    const score = session?.score ?? 0;
    const isCompleted = session?.status === 'completed';
    const isPassed = session?.isPassed ?? (score >= (currentExam?.kkm || 75));

    return {
      student: s,
      session,
      score,
      isCompleted,
      isPassed,
      violations: session?.violations.length || 0,
      finishedAt: session?.finishedAt,
    };
  });

  // Sort by score descending for ranking
  results.sort((a, b) => b.score - a.score);

  // Statistics
  const completedResults = results.filter((r) => r.isCompleted);
  const totalCompleted = completedResults.length;
  const averageScore =
    totalCompleted > 0
      ? Math.round(completedResults.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted)
      : 0;
  const highestScore = totalCompleted > 0 ? Math.max(...completedResults.map((r) => r.score)) : 0;
  const lowestScore = totalCompleted > 0 ? Math.min(...completedResults.map((r) => r.score)) : 0;
  const passedCount = completedResults.filter((r) => r.isPassed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;

  // Item Analysis (Analisis Butir Soal)
  const itemAnalysis = questions.map((q, idx) => {
    let correctCount = 0;
    let totalAttempts = 0;
    const choiceDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    students.forEach((s) => {
      const sess = studentSessions[s.id];
      if (!sess) return;
      const ans = sess.answers[q.id];
      if (!ans) return;

      totalAttempts++;
      if (ans.selectedOptionId && choiceDistribution[ans.selectedOptionId] !== undefined) {
        choiceDistribution[ans.selectedOptionId]++;
      }

      if (q.type === 'single_choice' && ans.selectedOptionId === q.answerKey) {
        correctCount++;
      } else if (q.type === 'short_answer' && (ans.shortAnswerText || '').trim().toLowerCase() === String(q.answerKey).toLowerCase()) {
        correctCount++;
      }
    });

    const facilityIndex = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    let difficultyCategory = 'Sedang';
    if (facilityIndex > 70) difficultyCategory = 'Mudah';
    else if (facilityIndex < 30) difficultyCategory = 'Sukar';

    return {
      index: idx + 1,
      question: q,
      totalAttempts,
      correctCount,
      facilityIndex,
      difficultyCategory,
      choiceDistribution,
    };
  });

  // CSV Export for Excel
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Peringkat,Nomor Peserta,NISN,Nama Siswa,Kelas,Ruang,Nilai Akhir,Status KKM,Pelanggaran,Waktu Selesai\n';

    results.forEach((r, idx) => {
      const line = [
        idx + 1,
        `"${r.student.username}"`,
        `"${r.student.nisn}"`,
        `"${r.student.name}"`,
        `"${r.student.classRoom}"`,
        `"${r.student.roomName}"`,
        r.score,
        r.isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
        r.violations,
        r.finishedAt ? new Date(r.finishedAt).toLocaleTimeString('id-ID') : '-',
      ].join(',');
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${currentExam?.subject.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation & Export Actions Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rekap'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rekap Nilai Siswa
          </button>
          <button
            onClick={() => setActiveTab('analisis')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analisis'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Analisis Butir Soal
          </button>
          <button
            onClick={() => setActiveTab('berita_acara')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'berita_acara'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Berita Acara Ujian
          </button>
          <button
            onClick={() => setActiveTab('daftar_hadir')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daftar_hadir'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Daftar Hadir Ujian
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* 1. TAB REKAP NILAI */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium">Total Peserta Selesai</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {totalCompleted} / {students.length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium">Rata-Rata Nilai</span>
              <p className="text-xl font-black text-blue-700 mt-1">{averageScore}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium">Nilai Tertinggi</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{highestScore}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium">Nilai Terendah</span>
              <p className="text-xl font-black text-rose-600 mt-1">{lowestScore}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-slate-500 font-medium">Tingkat Ketuntasan</span>
              <p className="text-xl font-black text-indigo-700 mt-1">{passRate}%</p>
            </div>
          </div>

          {/* Rekap Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">No. Peserta</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 text-center">Pelanggaran</th>
                    <th className="py-3 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Status KKM ({currentExam?.kkm})</th>
                    <th className="py-3 px-4 text-right">Waktu Submit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, idx) => (
                    <tr key={r.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {r.student.username}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {r.student.name}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-600">
                        {r.student.classRoom}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {r.violations > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {r.violations}x
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-base text-blue-700">
                        {r.score}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {r.isPassed ? (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            TUNTAS
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                            BELUM TUNTAS
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {r.finishedAt ? new Date(r.finishedAt).toLocaleTimeString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB ANALISIS BUTIR SOAL */}
      {activeTab === 'analisis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900">
              Analisis Tingkat Kesukaran & Distribusi Pilihan Jawaban
            </h3>
            <p className="text-xs text-slate-500">
              Mata Pelajaran: {currentExam?.subject} ({questions.length} Butir Soal)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Topik Kompetensi</th>
                  <th className="py-3 px-4 text-center">Kunci</th>
                  <th className="py-3 px-4 text-center">Dijawab Benar</th>
                  <th className="py-3 px-4 text-center">Indeks Kesukaran</th>
                  <th className="py-3 px-4 text-center">Kategori</th>
                  <th className="py-3 px-4 text-center">Sebaran Pilihan (A / B / C / D / E)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemAnalysis.map((item) => (
                  <tr key={item.question.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {item.index}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.question.topic || item.question.subject}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                      {Array.isArray(item.question.answerKey)
                        ? item.question.answerKey.join(',')
                        : item.question.answerKey}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {item.correctCount} / {item.totalAttempts}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {item.facilityIndex}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.difficultyCategory === 'Mudah'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.difficultyCategory === 'Sukar'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.difficultyCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                      A: {item.choiceDistribution.A || 0} | B: {item.choiceDistribution.B || 0} | C: {item.choiceDistribution.C || 0} | D: {item.choiceDistribution.D || 0} | E: {item.choiceDistribution.E || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB BERITA ACARA UJIAN (Official Print Format) */}
      {activeTab === 'berita_acara' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Official Header Kop */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              {schoolProfile.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium">
              {schoolProfile.address}, {schoolProfile.subdistrict}, {schoolProfile.city}, {schoolProfile.province}
            </p>
            <p className="text-xs text-slate-600 font-mono">
              NPSN: {schoolProfile.npsn} {schoolProfile.nsm && `• NSM: ${schoolProfile.nsm}`}
            </p>
          </div>

          <div className="text-center pt-2">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider underline">
              BERITA ACARA PELAKSANAAN UJIAN BERBASIS KOMPUTER (CBT)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Tahun Pelajaran {schoolProfile.academicYear} • Semester {schoolProfile.semester}
            </p>
          </div>

          <div className="text-xs sm:text-sm leading-relaxed space-y-4 text-slate-800">
            <p>
              Pada hari ini, <strong>Kamis</strong> tanggal <strong>08 Oktober 2026</strong>, telah diselenggarakan Penyelenggaraan Ujian Berbasis Komputer (Computer Based Test) untuk:
            </p>

            <table className="w-full text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="w-48 py-1 font-semibold">Mata Pelajaran</td>
                  <td className="py-1">: {currentExam?.subject}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Tingkat / Kelas</td>
                  <td className="py-1">: {currentExam?.classLevel}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Alokasi Waktu</td>
                  <td className="py-1">: {currentExam?.durationMinutes} Menit</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Jumlah Peserta Terdaftar</td>
                  <td className="py-1">: {students.length} Orang</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Jumlah Peserta Hadir</td>
                  <td className="py-1">: {students.length} Orang</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Jumlah Peserta Tidak Hadir</td>
                  <td className="py-1">: 0 Orang</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Catatan Kejadian Khusus</td>
                  <td className="py-1">: Pelaksanaan ujian berjalan tertib, aman, dan lancar dengan sistem anti-kecurangan aktif.</td>
                </tr>
              </tbody>
            </table>

            <p className="pt-2">
              Demikian Berita Acara ini dibuat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 text-center text-xs sm:text-sm">
            <div>
              <p className="font-semibold">Proktor / Pengawas Ruangan,</p>
              <div className="h-20" />
              <p className="font-bold underline">{schoolProfile.proctorName}</p>
              <p className="text-slate-500 text-xs">NIP. {schoolProfile.proctorNip}</p>
            </div>
            <div>
              <p className="font-semibold">Kepala Madrasah / Sekolah,</p>
              <div className="h-20" />
              <p className="font-bold underline">{schoolProfile.principalName}</p>
              <p className="text-slate-500 text-xs">NIP. {schoolProfile.principalNip}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB DAFTAR HADIR PESERTA UJIAN */}
      {activeTab === 'daftar_hadir' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-5 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          <div className="text-center border-b-2 border-black pb-3 space-y-0.5">
            <h2 className="text-lg font-black uppercase">{schoolProfile.name}</h2>
            <p className="text-xs">DAFTAR HADIR PESERTA PENILAIAN AKHIR SEMESTER BERBASIS KOMPUTER</p>
            <p className="text-xs font-semibold text-slate-600">Mata Pelajaran: {currentExam?.subject}</p>
          </div>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 w-10 text-center border-r border-slate-300">No</th>
                <th className="p-2 border-r border-slate-300">No. Peserta</th>
                <th className="p-2 border-r border-slate-300">Nama Siswa</th>
                <th className="p-2 border-r border-slate-300">Kelas</th>
                <th className="p-2 border-r border-slate-300">Ruangan</th>
                <th className="p-2 w-28 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                  <td className="p-2 font-mono font-bold border-r border-slate-200">{s.username}</td>
                  <td className="p-2 font-semibold border-r border-slate-200">{s.name}</td>
                  <td className="p-2 border-r border-slate-200">{s.classRoom}</td>
                  <td className="p-2 border-r border-slate-200">{s.roomName}</td>
                  <td className="p-2 text-xs italic text-slate-400 font-mono">
                    {idx % 2 === 0 ? `${idx + 1}. ...........` : `     ${idx + 1}. ...........`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
