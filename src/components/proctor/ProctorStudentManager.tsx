import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { Student } from '../../types/cbt';
import {
  Users,
  Plus,
  Printer,
  Edit,
  Trash2,
  Search,
  CreditCard,
  X,
  Upload,
} from 'lucide-react';

export const ProctorStudentManager: React.FC = () => {
  const {
    students,
    schoolProfile,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useCBT();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPrintCardsView, setIsPrintCardsView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form State
  const [nisn, setNisn] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [classRoom, setClassRoom] = useState('XII MIPA 1');
  const [session, setSession] = useState(1);
  const [roomName, setRoomName] = useState('Lab Komputer 1');

  const filteredStudents = students.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        s.classRoom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNew = () => {
    setEditingStudentId(null);
    setNisn(`00681923${Math.floor(10 + Math.random() * 89)}`);
    setUsername(`26-01-${String(students.length + 1).padStart(3, '0')}`);
    setName('');
    setClassRoom('XII MIPA 1');
    setSession(1);
    setRoomName('Lab Komputer 1');
    setIsModalOpen(true);
  };

  const handleEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setNisn(s.nisn);
    setUsername(s.username);
    setName(s.name);
    setClassRoom(s.classRoom);
    setSession(s.session);
    setRoomName(s.roomName);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        nisn,
        username,
        name,
        classRoom,
        session: Number(session),
        roomName,
      });
    } else {
      const newS: Student = {
        id: `std-${Date.now()}`,
        nisn,
        username,
        name,
        classRoom,
        session: Number(session),
        roomName,
      };
      createStudent(newS);
    }

    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // If in Print Cards Mode
  if (isPrintCardsView) {
    return (
      <div className="space-y-4">
        <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Pratinjau Cetak Kartu Peserta Ujian CBT
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredStudents.length} kartu peserta siap cetak di kertas A4.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintCardsView(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Kembali ke Daftar
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu (Print)</span>
            </button>
          </div>
        </div>

        {/* 2 Cards per row layout for standard A4 printing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:m-0">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="bg-white border-2 border-slate-800 p-4 rounded-xl text-xs space-y-3 break-inside-avoid print:rounded-none"
            >
              {/* Header Card */}
              <div className="text-center border-b border-black pb-2">
                <h4 className="font-black text-sm uppercase">{schoolProfile.name}</h4>
                <p className="text-[10px] font-bold text-slate-700 uppercase">
                  KARTU PESERTA {schoolProfile.examTitle}
                </p>
                <p className="text-[9px] text-slate-500">TP {schoolProfile.academicYear}</p>
              </div>

              {/* Body Card */}
              <div className="flex items-start gap-3">
                {/* Photo / Avatar Box */}
                <div className="w-20 h-24 border border-slate-400 bg-slate-100 flex flex-col items-center justify-center shrink-0 text-[10px] text-slate-400 font-mono">
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>Foto 3x4</span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-600 font-medium">No. Peserta</span>
                    <span className="col-span-2 font-mono font-black text-slate-900">: {s.username}</span>

                    <span className="text-slate-600 font-medium">Nama Siswa</span>
                    <span className="col-span-2 font-bold text-slate-900">: {s.name}</span>

                    <span className="text-slate-600 font-medium">NISN</span>
                    <span className="col-span-2 font-mono">: {s.nisn}</span>

                    <span className="text-slate-600 font-medium">Kelas</span>
                    <span className="col-span-2 font-semibold">: {s.classRoom}</span>

                    <span className="text-slate-600 font-medium">Sesi / Ruang</span>
                    <span className="col-span-2 font-semibold">: Sesi {s.session} ({s.roomName})</span>

                    <span className="text-slate-600 font-medium">Password</span>
                    <span className="col-span-2 font-mono font-bold">: 123456</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-2 border-t border-slate-200 flex justify-end text-[10px] text-right">
                <div>
                  <p>Kepala Madrasah / Sekolah,</p>
                  <div className="h-10" />
                  <p className="font-bold underline">{schoolProfile.principalName}</p>
                  <p className="text-[9px]">NIP. {schoolProfile.principalNip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NISN, atau kelas..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintCardsView(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cetak Kartu Peserta</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">No. Peserta</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Sesi Ujian</th>
                <th className="py-3 px-4">Ruang Ujian</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {s.username}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{s.classRoom}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                      Sesi {s.session}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.roomName}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100"
                        title="Edit Siswa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data siswa ${s.name}?`)) {
                            deleteStudent(s.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-100"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">
                {editingStudentId ? 'Edit Data Peserta' : 'Tambah Peserta Ujian Baru'}
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
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Peserta (Username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas / Rombongan Belajar
                </label>
                <input
                  type="text"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  placeholder="Contoh: XII MIPA 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sesi Ujian
                  </label>
                  <select
                    value={session}
                    onChange={(e) => setSession(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value={1}>Sesi 1 (Pagi)</option>
                    <option value={2}>Sesi 2 (Siang)</option>
                    <option value={3}>Sesi 3 (Sore)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ruang Ujian
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
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
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
