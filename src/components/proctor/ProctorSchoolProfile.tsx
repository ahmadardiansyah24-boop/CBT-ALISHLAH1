import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { School, Save, CheckCircle2, Shield, UserCheck } from 'lucide-react';

export const ProctorSchoolProfile: React.FC = () => {
  const { schoolProfile, updateSchoolProfile } = useCBT();

  const [form, setForm] = useState(schoolProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Identitas Satuan Pendidikan & Pengaturan KOP
            </h3>
            <p className="text-xs text-slate-500">
              Data ini akan dicetak pada KOP Berita Acara, Daftar Hadir, dan Kartu Ujian Resmi.
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan profil sekolah berhasil disimpan dan diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Madrasah / Sekolah
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={form.npsn}
                onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NSM (Khusus Madrasah Kemenag)
              </label>
              <input
                type="text"
                value={form.nsm || ''}
                onChange={(e) => setForm({ ...form, nsm: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Lengkap Satuan Pendidikan
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Kepala Madrasah / Sekolah
              </label>
              <input
                type="text"
                value={form.principalName}
                onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={form.principalNip}
                onChange={(e) => setForm({ ...form, principalNip: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Proktor / Teknisi CBT
              </label>
              <input
                type="text"
                value={form.proctorName}
                onChange={(e) => setForm({ ...form, proctorName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NIP Proktor
              </label>
              <input
                type="text"
                value={form.proctorNip}
                onChange={(e) => setForm({ ...form, proctorNip: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                required
              />
            </div>
          </div>

          {/* Secret Proctor Security PIN configuration */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-black text-rose-800 uppercase tracking-wider text-xs">
                PIN Rahasia Keamanan Masuk Proktor (Wajib Dijaga)
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                Proteksi Akses Siswa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.proctorPin || '982461'}
                onChange={(e) => setForm({ ...form, proctorPin: e.target.value })}
                placeholder="6 Digit Angka (Contoh: 982461)"
                maxLength={10}
                className="w-48 p-2.5 bg-white border border-rose-300 rounded-xl font-mono font-black text-sm text-rose-900 tracking-widest"
                required
              />
              <span className="text-[11px] text-rose-700 leading-tight">
                Ganti PIN ini secara berkala agar tidak ada siswa yang dapat masuk ke panel proktor.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Pelajaran
              </label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="text"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tajuk Penyelenggaraan Ujian
            </label>
            <input
              type="text"
              value={form.examTitle}
              onChange={(e) => setForm({ ...form, examTitle: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              required
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
